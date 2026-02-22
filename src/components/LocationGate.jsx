import { Copyright, Loader, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { MapPin, Store } from "lucide-react";
import { MapController } from "./Map";
import { getDistanceKm } from "./Direction";
import { setTempAddress, saveAddress, updateTempAddressSaved } from "../store/authSlice";
import { useDispatch, useSelector } from "react-redux";

// ─── Constants ───────────────────────────────────────────────────────────────
const DEFAULT_COORDS = [28.203326, 78.267783];
const DELIVERY_RANGE_KM = 10;
const SESSION_EXPIRY_MS = 1000 * 60 * 30; // 30 min

// ─── Map Icons ────────────────────────────────────────────────────────────────
const makeIcon = (Component, color, size) =>
  L.divIcon({
    html: renderToStaticMarkup(<Component size={size} color="white" fill={color} strokeWidth={1.5} />),
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });

const USER_PIN = makeIcon(MapPin, "#2563eb", 28);
const SHOP_PIN = makeIcon(Store, "#f97316", 24);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const coordsMatch = (a, b) =>
  Math.abs(a[0] - b[0]) < 0.001 && Math.abs(a[1] - b[1]) < 0.001;

const reverseGeocode = async (lat, lng) => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_API}/api/geocode/reverse-geocode?lat=${lat}&lon=${lng}`
  );
  if (!res.ok) throw new Error("Reverse geocode failed");
  const data = await res.json();
  return data.display_name || "Unknown location";
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function LocationGate({ children }) {
  const dispatch = useDispatch();
  const { user, isAuthenticated, tempAddress } = useSelector((s) => s.auth);
  const { shopsData } = useSelector((s) => s.shop);

  // UI state
  const [view, setView] = useState("picker"); // "picker" | "map" | "saved"
  const [showModal, setShowModal] = useState(false);
  const [checking, setChecking] = useState(true);

  // Map state
  const [markerPos, setMarkerPos] = useState(DEFAULT_COORDS);
  const [addressText, setAddressText] = useState("");
  const [addressError, setAddressError] = useState("");
  const [mapLoading, setMapLoading] = useState(false);
  const [gettingGPS, setGettingGPS] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [isDeliverable, setIsDeliverable] = useState(false);
  const [shopMarkers, setShopMarkers] = useState([]);
  const [mapBounds, setMapBounds] = useState(null);

  // Prevent double-save on login
  const savedOnLoginRef = useRef(false);
  const gpsWatchRef = useRef(null);

  // ─── Shop markers ──────────────────────────────────────────────────────────
  useEffect(() => {
    const shops = Array.isArray(shopsData) ? shopsData : shopsData?.shops ?? [];
    const markers = shops
      .map((shop) => {
        const loc = shop?.shopLocation;
        if (!loc) return null;
        const position = loc.coordinates
          ? [loc.coordinates[1], loc.coordinates[0]]
          : loc.lat && loc.lng
            ? [loc.lat, loc.lng]
            : null;
        return position ? { ...shop, position, id: shop._id } : null;
      })
      .filter(Boolean);
    setShopMarkers(markers);
  }, [shopsData]);

  // ─── Map bounds ────────────────────────────────────────────────────────────
  useEffect(() => {
    const positions = shopMarkers.map((m) => m.position);
    if (markerPos) positions.push(markerPos);
    setMapBounds(positions.length > 0 ? positions : null);
  }, [shopMarkers, markerPos]);

  // ─── Deliverability check ──────────────────────────────────────────────────
  useEffect(() => {
    if (shopMarkers.length === 0 || !markerPos) return;
    const min = Math.min(...shopMarkers.map((s) => getDistanceKm(markerPos, s.position)));
    setIsDeliverable(min <= DELIVERY_RANGE_KM);
  }, [markerPos, shopMarkers]);

  // ─── Address text when marker moves ────────────────────────────────────────
  useEffect(() => {
    if (view !== "map") return;
    reverseGeocode(markerPos[0], markerPos[1])
      .then(setAddressText)
      .catch(() => setAddressText(""));
  }, [markerPos, view]);

  // ─── Session check on mount ────────────────────────────────────────────────
  useEffect(() => {
    const time = Number(sessionStorage.getItem("locationChoiceTime"));
    if (time && Date.now() - time > SESSION_EXPIRY_MS) {
      sessionStorage.removeItem("locationChoice");
      sessionStorage.removeItem("locationChoiceTime");
      sessionStorage.removeItem("userCoords");
      sessionStorage.removeItem("formattedAddress");
    }

    const saved = sessionStorage.getItem("locationChoice");
    if (saved) {
      const coords = JSON.parse(sessionStorage.getItem("userCoords"));
      const cachedAddress = sessionStorage.getItem("formattedAddress") || "";

      // Set immediately with whatever we have so navbar renders right away
      dispatch(setTempAddress({ formattedAddress: cachedAddress, coordinates: coords, saved: true }));
      setChecking(false);

      // If no cached address text, reverse geocode and update
      if (!cachedAddress) {
        reverseGeocode(coords[0], coords[1])
          .then((formattedAddress) => {
            sessionStorage.setItem("formattedAddress", formattedAddress);
            dispatch(setTempAddress({ formattedAddress, coordinates: coords, saved: true }));
          })
          .catch(() => { });
      }
    } else {
      setShowModal(true);
      setChecking(false);
    }
  }, []);

  // ─── Listen for external open event ───────────────────────────────────────
  useEffect(() => {
    const open = () => { setView("picker"); setShowModal(true); };
    window.addEventListener("open-location-gate", open);
    return () => window.removeEventListener("open-location-gate", open);
  }, []);

  // ─── Save temp address after login (once) ─────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      savedOnLoginRef.current = false;
      return;
    }
    if (!user || !tempAddress || tempAddress.saved || savedOnLoginRef.current) return;

    savedOnLoginRef.current = true;

    const existing = user.addresses?.find((a) =>
      coordsMatch(a.coordinates, tempAddress.coordinates) ||
      a.formattedAddress?.trim().toLowerCase() === tempAddress.formattedAddress?.trim().toLowerCase()
    );

    if (existing) {
      dispatch(setTempAddress(existing));
    } else {
      dispatch(saveAddress({ ...tempAddress, label: "Address from session" }))
        .unwrap()
        .then(() => dispatch(updateTempAddressSaved()))
        .catch(() => { savedOnLoginRef.current = false; });
    }
  }, [isAuthenticated, user?.addresses?.length, tempAddress?.saved]);

  // ─── Body scroll lock ──────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showModal]);

  // ─── GPS ───────────────────────────────────────────────────────────────────
  function startGPS() {
    setGettingGPS(true);
    setMapLoading(true);
    setView("map");

    gpsWatchRef.current = navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setMarkerPos(coords);
        setGettingGPS(false);
        setMapLoading(false);
      },
      (err) => {
        setGettingGPS(false);
        setMapLoading(false);
        setView("picker");
        const msgs = { 1: "Location permission denied", 2: "Location unavailable", 3: "Location request timed out" };
        alert(msgs[err.code] || "Unable to get location");
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  }

  function cancelGPS() {
    if (gpsWatchRef.current) navigator.geolocation.clearWatch(gpsWatchRef.current);
    setGettingGPS(false);
    setMapLoading(false);
    setView("picker");
    setMarkerPos(DEFAULT_COORDS);
  }

  // ─── Confirm location ──────────────────────────────────────────────────────
  async function confirmLocation() {
    if (!addressText.trim()) {
      setAddressError("Address cannot be empty");
      setTimeout(() => setAddressError(""), 3000);
      return;
    }

    setConfirming(true);

    const addressData = { formattedAddress: addressText.trim(), coordinates: markerPos };

    // Check if address already saved
    const existing = user?.addresses?.find((a) =>
      coordsMatch(a.coordinates, markerPos) ||
      a.formattedAddress?.trim().toLowerCase() === addressText.trim().toLowerCase()
    );

    if (existing) {
      dispatch(setTempAddress(existing));
    } else {
      dispatch(setTempAddress(addressData));
      if (isAuthenticated && user) {
        const result = await dispatch(saveAddress({ ...addressData, label: "New Address" }));
        if (result.meta.requestStatus === "fulfilled") {
          dispatch(updateTempAddressSaved());
        }
      }
    }

    sessionStorage.setItem("userCoords", JSON.stringify(markerPos));
    sessionStorage.setItem("locationChoice", "manual");
    sessionStorage.setItem("locationChoiceTime", Date.now());
    sessionStorage.setItem("formattedAddress", addressText.trim());

    setTimeout(() => { setShowModal(false); setConfirming(false); }, 300);
  }

  function selectSavedAddress(addr) {
    sessionStorage.setItem("userCoords", JSON.stringify(addr.coordinates));
    sessionStorage.setItem("locationChoice", "saved");
    sessionStorage.setItem("locationChoiceTime", Date.now());
    sessionStorage.setItem("formattedAddress", addr.formattedAddress || "");
    dispatch(setTempAddress(addr));
    setShowModal(false);
  }

  if (checking) return null;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {children}

      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[90vw] max-w-[500px] bg-white rounded-2xl p-6 shadow-2xl">

            {/* ── View: Picker ── */}
            {view === "picker" && (
              <>
                <div className="mb-6 text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin size={32} className="text-orange-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Select your location</h2>
                  <p className="text-sm text-gray-500">We need your location to show delivery options in your area</p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={startGPS}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-4 rounded-xl shadow-lg transition-all"
                  >
                    <MapPin size={20} /> Use my current location
                  </button>

                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <div className="flex-1 h-px bg-gray-200" />
                    OR
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  <button
                    onClick={() => { setView("map"); setMapLoading(true); }}
                    className="w-full flex items-center justify-center gap-3 border border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium py-4 rounded-xl transition-all"
                  >
                    <MapPin size={20} /> Pin location on map
                  </button>

                  {isAuthenticated && user?.addresses?.length > 0 && (
                    <button
                      onClick={() => setView("saved")}
                      className="w-full flex items-center justify-center gap-3 border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-4 rounded-xl transition-all"
                    >
                      <Store size={20} /> Choose from saved addresses
                    </button>
                  )}
                </div>
              </>
            )}

            {/* ── View: Map ── */}
            {view === "map" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {gettingGPS ? "📍 Finding your location..." : "🗺️ Pin your location"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {gettingGPS ? "Please wait..." : "Drag the pin to set your delivery address"}
                    </p>
                  </div>
                  <button
                    onClick={gettingGPS ? cancelGPS : () => { setView("picker"); setMarkerPos(DEFAULT_COORDS); }}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Map */}
                <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow">
                  {(mapLoading || gettingGPS) && (
                    <div className="absolute inset-0 z-50 bg-white/90 flex flex-col items-center justify-center gap-3 rounded-xl">
                      <Loader className="animate-spin text-orange-500" size={36} />
                      <p className="text-sm text-gray-500">
                        {gettingGPS ? "Getting your location..." : "Loading map..."}
                      </p>
                      {gettingGPS && (
                        <button onClick={cancelGPS} className="text-xs text-gray-400 underline">Cancel</button>
                      )}
                    </div>
                  )}
                  <MapContainer
                    center={markerPos}
                    zoom={14}
                    scrollWheelZoom
                    attributionControl={false}
                    style={{ width: "100%", height: "300px" }}
                    whenCreated={() => setMapLoading(false)}
                  >
                    <TileLayer
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      attribution="© Esri"
                    />
                    <MapController center={markerPos} zoom={14} bounds={mapBounds} />

                    {shopMarkers.map((m) => (
                      <Marker key={m.id} position={m.position} icon={SHOP_PIN} zIndexOffset={1000}>
                        <Popup><p className="text-sm font-semibold text-orange-600 text-center">{m.name}</p></Popup>
                      </Marker>
                    ))}

                    <Marker
                      position={markerPos}
                      icon={USER_PIN}
                      draggable
                      eventHandlers={{
                        dragend: (e) => {
                          const { lat, lng } = e.target.getLatLng();
                          setMarkerPos([lat, lng]);
                        },
                      }}
                    >
                      <Popup><p className="text-sm font-semibold text-blue-600 text-center">📍 Delivery Here</p></Popup>
                    </Marker>
                  </MapContainer>
                </div>

                <p className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1">
                  <Copyright size={11} /> OpenStreetMap contributors
                </p>

                {/* Address input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Edit your address</label>
                  <textarea
                    value={addressText}
                    onChange={(e) => { setAddressText(e.target.value); setAddressError(""); }}
                    placeholder="Add house number, landmark, floor etc."
                    rows={2}
                    className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-400 resize-none ${addressError ? "border-red-400" : "border-gray-300"}`}
                  />
                  {addressError && <p className="text-xs text-red-500 mt-1">{addressError}</p>}
                </div>

                {/* Confirm button */}
                <button
                  onClick={confirmLocation}
                  disabled={!isDeliverable || gettingGPS || confirming}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-medium text-white transition-all shadow-lg
                    ${isDeliverable
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                      : "bg-gray-400 cursor-not-allowed"
                    }`}
                >
                  {confirming
                    ? <Loader className="animate-spin" size={18} />
                    : isDeliverable
                      ? "✓ Confirm Location"
                      : "Not in delivery range"}
                </button>
              </div>
            )}

            {/* ── View: Saved Addresses ── */}
            {view === "saved" && (
              <div>
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Saved Addresses</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Choose from your saved locations</p>
                  </div>
                  <button
                    onClick={() => setView("picker")}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {user.addresses.map((addr, i) => (
                    <button
                      key={i}
                      onClick={() => selectSavedAddress(addr)}
                      className="w-full text-left flex items-start gap-3 border border-gray-200 rounded-xl px-4 py-3 hover:border-orange-300 hover:bg-orange-50 transition-all"
                    >
                      <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MapPin size={16} className="text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900">{addr.label || `Address ${i + 1}`}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{addr.formattedAddress}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}