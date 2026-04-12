import { Copyright, Loader, X, AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { MapPin, Store } from "lucide-react";
import { MapController } from "./Map";
import { getDistanceKm } from "./Direction";
import {
  setTempAddress,
  saveAddress,
  updateTempAddressSaved,
} from "../store/authSlice";
import { setDeliveryShop } from "../store/shopSlice";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "../socket";

// ─── Constants ───────────────────────────────────────────────────────────────
const DEFAULT_COORDS = [28.203326, 78.267783];
const DELIVERY_RANGE_KM = 3; // 3 km delivery radius
const SESSION_EXPIRY_MS = 1000 * 60 * 30; // 30 min

// ─── Map Icons ────────────────────────────────────────────────────────────────
const makeIcon = (Component, color, size) =>
  L.divIcon({
    html: renderToStaticMarkup(
      <Component size={size} color="white" fill={color} strokeWidth={1.5} />,
    ),
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
    `${import.meta.env.VITE_BACKEND_API}/api/geocode/reverse-geocode?lat=${lat}&lon=${lng}`,
  );
  if (!res.ok) throw new Error("Reverse geocode failed");
  const data = await res.json();
  return data.display_name || "Unknown location";
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function LocationGate({ children }) {
  const dispatch = useDispatch();
  const { user, isAuthenticated, tempAddress } = useSelector((s) => s.auth);

  const { deliveryShop, shopsData } = useSelector((state) => state.shop);
  // UI state
  const [view, setView] = useState("picker"); // "picker" | "map" | "saved"
  const [showModal, setShowModal] = useState(false);
  const [checking, setChecking] = useState(true);
  const [alertMessage, setAlertMessage] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

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
  const [nearestShop, setNearestShop] = useState(null);
  const [gpsErrorCode, setGpsErrorCode] = useState(null);

  // Prevent double-save on login
  const savedOnLoginRef = useRef(false);
  const gpsWatchRef = useRef(null);
  const gpsFallbackRef = useRef(false);

  // ─── Shop deletion listener ───────────────────────────────────────────
  useEffect(() => {
    const handleShopDeleted = (deletedShop) => {
      console.log(deliveryShop, deletedShop);
      if (deliveryShop?._id == deletedShop._id) {
        const remaining = shopMarkers.filter((s) => s._id !== deletedShop._id);

        // Optimistic update: immediately remove deleted shop from markers UI
        // This will be replaced by authoritative shopsData when backend syncs
        setShopMarkers(remaining);

        if (remaining.length === 0) {
          dispatch(setDeliveryShop(null));
          setIsDeliverable(false);
          setAlertMessage(
            "Sorry, no restaurants available in your area. Please try another location.",
          );
          setShowAlert(true);
        } else {
          const nearest = remaining.reduce((closest, shop) => {
            const distance = getDistanceKm(markerPos, shop.position);
            return distance < (closest.distance || Infinity)
              ? { shop, distance }
              : closest;
          }, {});
          console.log("nearest find after delete", nearest);

          if (nearest.distance <= parseInt(nearest.shop?.shopDeliveryRange)) {
            dispatch(setDeliveryShop(nearest.shop));
            setAlertMessage(
              `${nearest.shop.name} is now nearest available outlet in your area`,
            );
            setShowAlert(true);
          } else {
            dispatch(setDeliveryShop(null));
            setIsDeliverable(false);
            setAlertMessage(
              "No restaurants available in your current delivery range",
            );
            setShowAlert(true);
          }
        }
      }
    };

    const handleShopAdded = (newShop) => {
      console.log("New shop added:", newShop);
      const loc = newShop?.shopLocation;
      if (!loc) return;

      const position = loc.coordinates
        ? [loc.coordinates[1], loc.coordinates[0]]
        : loc.lat && loc.lng
          ? [loc.lat, loc.lng]
          : null;

      if (!position) return;

      // Optimistic update: add new shop to markers immediately
      // This will be replaced by authoritative shopsData when backend syncs
      const newMarker = { ...newShop, position, id: newShop._id };
      setShopMarkers((prev) => [...prev, newMarker]);

      // Check if new shop is in delivery range
      const distance = getDistanceKm(markerPos, position);
      const shopRange = newShop.shopDeliveryRange || DELIVERY_RANGE_KM;

      if (distance <= shopRange && !isDeliverable) {
        dispatch(setDeliveryShop(newShop));
        setAlertMessage(`${newShop.name} is now available in your area!`);
        setShowAlert(true);
      }
    };

    socket.on("shop-deleted", handleShopDeleted);
    socket.on("shop-added", handleShopAdded);

    return () => {
      socket.off("shop-deleted", handleShopDeleted);
      socket.off("shop-added", handleShopAdded);
    };
  }, [deliveryShop, shopMarkers, markerPos, dispatch, isDeliverable]);

  // ─── Shop markers ──────────────────────────────────────────────────────────
  useEffect(() => {
    const shops = Array.isArray(shopsData)
      ? shopsData
      : (shopsData?.shops ?? []);
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
    console.log("shopData changed");
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

    const nearest = shopMarkers.reduce((closest, shop) => {
      const distance = getDistanceKm(markerPos, shop.position);
      return distance < (closest.distance || Infinity)
        ? { shop, distance }
        : closest;
    }, {});

    if (!nearest.shop) {
      setIsDeliverable(false);
      setNearestShop(null);
      return;
    }

    const min = nearest.distance;
    const shopRange = nearest.shop.shopDeliveryRange || DELIVERY_RANGE_KM;
    const deliverable = min <= shopRange;

    setIsDeliverable(deliverable);
    setNearestShop(nearest.shop);
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
      dispatch(
        setTempAddress({
          formattedAddress: cachedAddress,
          coordinates: coords,
          saved: true,
        }),
      );
      setChecking(false);

      // If no cached address text, reverse geocode and update
      if (!cachedAddress) {
        reverseGeocode(coords[0], coords[1])
          .then((formattedAddress) => {
            sessionStorage.setItem("formattedAddress", formattedAddress);
            dispatch(
              setTempAddress({
                formattedAddress,
                coordinates: coords,
                saved: true,
              }),
            );
          })
          .catch(() => {});
      }
    } else {
      setShowModal(true);
      setChecking(false);
    }
  }, []);

  // ─── Listen for external open event ───────────────────────────────────────
  useEffect(() => {
    const open = () => {
      setView("picker");
      setShowModal(true);
    };
    window.addEventListener("open-location-gate", open);
    return () => window.removeEventListener("open-location-gate", open);
  }, []);

  // ─── Save temp address after login (once) ─────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      savedOnLoginRef.current = false;
      return;
    }
    if (!user || !tempAddress || tempAddress.saved || savedOnLoginRef.current)
      return;

    savedOnLoginRef.current = true;

    const existing = user.addresses?.find(
      (a) =>
        coordsMatch(a.coordinates, tempAddress.coordinates) ||
        a.formattedAddress?.trim().toLowerCase() ===
          tempAddress.formattedAddress?.trim().toLowerCase(),
    );

    if (existing) {
      dispatch(setTempAddress(existing));
    } else {
      dispatch(saveAddress({ ...tempAddress, label: "Address from session" }))
        .unwrap()
        .then(() => dispatch(updateTempAddressSaved()))
        .catch(() => {
          savedOnLoginRef.current = false;
        });
    }
  }, [isAuthenticated, user?.addresses?.length, tempAddress?.saved]);

  // ─── Body scroll lock ──────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  // ─── GPS ───────────────────────────────────────────────────────────────────
  function startGPS() {
    setGettingGPS(true);
    setMapLoading(true);
    setView("map");
    setGpsErrorCode(null);
    gpsFallbackRef.current = false;

    gpsWatchRef.current = navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setMarkerPos(coords);
        setGettingGPS(false);
        setMapLoading(false);
        setGpsErrorCode(null);
      },
      (err) => {
        // First attempt failed - try fallback without high accuracy
        if (!gpsFallbackRef.current && (err.code === 1 || err.code === 2)) {
          gpsFallbackRef.current = true;
          gpsWatchRef.current = navigator.geolocation.getCurrentPosition(
            (pos) => {
              const coords = [pos.coords.latitude, pos.coords.longitude];
              setMarkerPos(coords);
              setGettingGPS(false);
              setMapLoading(false);
              setGpsErrorCode(null);
            },
            (fallbackErr) => {
              // Fallback also failed - now display error
              handleGPSError(fallbackErr.code, true);
            },
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 0 },
          );
          return;
        }

        // Fallback already attempted or different error - show error
        handleGPSError(err.code, gpsFallbackRef.current);
      },
      { enableHighAccuracy: true, timeout: 25000, maximumAge: 0 },
    );
  }

  function handleGPSError(errorCode, isFallback) {
    setGettingGPS(false);
    setMapLoading(false);

    // If fallback attempt also failed with code 1, it means GPS is unavailable on device, not permission denied
    let finalErrorCode = errorCode;
    if (isFallback && errorCode === 1) {
      finalErrorCode = 2; // Convert to "location unavailable" since permission was just checked
    }

    setGpsErrorCode(finalErrorCode);
    setView("picker");

    let msg = "";
    switch (finalErrorCode) {
      case 1:
        msg =
          "Location permission was denied. Please enable location access:\n\n1. Click the lock icon in address bar\n2. Find 'Location' and set to 'Allow'\n3. Reload page and try again";
        break;
      case 2:
        msg =
          "Location data is unavailable. Make sure:\n\n1. GPS is enabled on your device\n2. Location services are active\n3. You're in an area with GPS signal\n\nOr use the map to pin your location manually.";
        break;
      case 3:
        msg =
          "Location request timed out. This might be due to poor network or GPS signal. Please try again or enable high accuracy mode.";
        break;
      default:
        msg = "Unable to get your location. Please try again.";
    }

    setAlertMessage(msg);
    setShowAlert(true);
  }

  function cancelGPS() {
    if (gpsWatchRef.current)
      navigator.geolocation.clearWatch(gpsWatchRef.current);
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

    const addressData = {
      formattedAddress: addressText.trim(),
      coordinates: markerPos,
    };

    // Check if address already saved
    const existing = user?.addresses?.find(
      (a) =>
        coordsMatch(a.coordinates, markerPos) ||
        a.formattedAddress?.trim().toLowerCase() ===
          addressText.trim().toLowerCase(),
    );

    if (existing) {
      dispatch(setTempAddress(existing));
    } else {
      dispatch(setTempAddress(addressData));
      if (isAuthenticated && user) {
        const result = await dispatch(
          saveAddress({ ...addressData, label: "New Address" }),
        );
        if (result.meta.requestStatus === "fulfilled") {
          dispatch(updateTempAddressSaved());
        }
      }
    }

    sessionStorage.setItem("userCoords", JSON.stringify(markerPos));
    sessionStorage.setItem("locationChoice", "manual");
    sessionStorage.setItem("locationChoiceTime", Date.now());
    sessionStorage.setItem("formattedAddress", addressText.trim());

    setTimeout(() => {
      setShowModal(false);
      setConfirming(false);
    }, 300);
  }

  function selectSavedAddress(addr) {
    // Verify that there's a nearby shop that can deliver to this saved address
    if (shopMarkers.length === 0) {
      setAlertMessage("No restaurants available. Please try another location.");
      setShowAlert(true);
      return;
    }

    // Find nearest shop to the saved address
    const nearest = shopMarkers.reduce((closest, shop) => {
      const distance = getDistanceKm(addr.coordinates, shop.position);
      return distance < (closest.distance || Infinity)
        ? { shop, distance }
        : closest;
    }, {});

    // Check if nearest shop is within its delivery range
    if (!nearest.shop) {
      setAlertMessage("No restaurants available. Please try another location.");
      setShowAlert(true);
      return;
    }

    const shopRange = nearest.shop.shopDeliveryRange || DELIVERY_RANGE_KM;
    if (nearest.distance > shopRange) {
      setAlertMessage(
        "Sorry, no restaurants available at this saved location. Please change your location.",
      );
      setShowAlert(true);
      return;
    }

    // Address is valid and has a nearby shop - proceed with selection
    sessionStorage.setItem("userCoords", JSON.stringify(addr.coordinates));
    sessionStorage.setItem("locationChoice", "saved");
    sessionStorage.setItem("locationChoiceTime", Date.now());
    sessionStorage.setItem("formattedAddress", addr.formattedAddress || "");
    dispatch(setTempAddress(addr));
    dispatch(setDeliveryShop(nearest.shop));
    setShowModal(false);
  }

  if (checking) return null;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Alert Modal */}
      {showAlert && alertMessage && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[90vw] max-w-[420px] bg-white rounded-2xl p-6 shadow-2xl">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-50 to-orange-50 rounded-full flex items-center justify-center flex-shrink-0 border border-red-200">
                <AlertCircle size={24} className="text-red-500" />
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-lg font-bold text-gray-900">
                  {alertMessage.includes("Unable") ||
                  alertMessage.includes("denied") ||
                  alertMessage.includes("unavailable") ||
                  alertMessage.includes("timed out")
                    ? "Location Error"
                    : alertMessage.includes("is now nearest")
                      ? "Current Shop is no more available"
                      : "No Delivery Available"}
                </h3>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed whitespace-pre-line">
              {alertMessage}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAlert(false);
                  setAlertMessage(null);
                  setGpsErrorCode(null);
                }}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all"
              >
                Dismiss
              </button>
              {alertMessage.includes("is now nearest") ? (
                <button
                  onClick={() => {
                    setShowAlert(false);
                    setAlertMessage(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg transition-all shadow-lg"
                >
                  Ok
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowAlert(false);
                    setAlertMessage(null);
                    if (gpsErrorCode === 1) {
                      // Permission denied - show instructions then retry
                      setView("picker");
                      setShowModal(true);
                    } else if (gpsErrorCode === 3 || gpsErrorCode === 2) {
                      // Timeout or unavailable - try again with map picker as fallback
                      startGPS();
                    } else {
                      setView("picker");
                      setShowModal(true);
                    }
                    setGpsErrorCode(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg transition-all shadow-lg"
                >
                  {alertMessage.includes("in your current delivery range")
                    ? "Change Location"
                    : gpsErrorCode === 1
                      ? "Try Again"
                      : "Retry"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Select your location
                  </h2>
                  <p className="text-sm text-gray-500">
                    We need your location to show delivery options in your area
                  </p>
                  {gpsErrorCode === 1 && (
                    <p className="text-xs text-blue-600 mt-2 p-2 bg-blue-50 rounded-lg">
                      💡 Make sure location permission is enabled in your
                      browser settings
                    </p>
                  )}
                  {gpsErrorCode === 2 && (
                    <p className="text-xs text-orange-600 mt-2 p-2 bg-orange-50 rounded-lg">
                      💡 GPS is not available. Make sure GPS is enabled on your
                      device, or use the map to pin your location
                    </p>
                  )}
                  {gpsErrorCode === 3 && (
                    <p className="text-xs text-amber-600 mt-2 p-2 bg-amber-50 rounded-lg">
                      💡 Location took too long. Try again or use the map to pin
                      your location
                    </p>
                  )}
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
                    onClick={() => {
                      setView("map");
                      setMapLoading(true);
                    }}
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
                      {gettingGPS
                        ? "📍 Finding your location..."
                        : "🗺️ Pin your location"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {gettingGPS
                        ? "Please wait..."
                        : "Drag the pin to set your delivery address"}
                    </p>
                  </div>
                  <button
                    onClick={
                      gettingGPS
                        ? cancelGPS
                        : () => {
                            setView("picker");
                            setMarkerPos(DEFAULT_COORDS);
                          }
                    }
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Map */}
                <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow">
                  {(mapLoading || gettingGPS) && (
                    <div className="absolute inset-0 z-50 bg-white/90 flex flex-col items-center justify-center gap-3 rounded-xl">
                      <Loader
                        className="animate-spin text-orange-500"
                        size={36}
                      />
                      <p className="text-sm text-gray-500">
                        {gettingGPS
                          ? "Getting your location...\n(Keep GPS enabled)"
                          : "Loading map..."}
                      </p>
                      {gettingGPS && (
                        <button
                          onClick={cancelGPS}
                          className="text-xs text-gray-400 underline"
                        >
                          Cancel
                        </button>
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
                    <MapController
                      center={markerPos}
                      zoom={14}
                      bounds={mapBounds}
                    />

                    {shopMarkers.map((m) => (
                      <Marker
                        key={m.id}
                        position={m.position}
                        icon={SHOP_PIN}
                        zIndexOffset={1000}
                      >
                        <Popup>
                          <p className="text-sm font-semibold text-orange-600 text-center">
                            {m.name}
                          </p>
                        </Popup>
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
                      <Popup>
                        <p className="text-sm font-semibold text-blue-600 text-center">
                          📍 Delivery Here
                        </p>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>

                <p className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1">
                  <Copyright size={11} /> OpenStreetMap contributors
                </p>

                {/* Address input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Edit your address
                  </label>
                  <textarea
                    value={addressText}
                    onChange={(e) => {
                      setAddressText(e.target.value);
                      setAddressError("");
                    }}
                    placeholder="Add house number, landmark, floor etc."
                    rows={2}
                    className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-400 resize-none ${addressError ? "border-red-400" : "border-gray-300"}`}
                  />
                  {addressError && (
                    <p className="text-xs text-red-500 mt-1">{addressError}</p>
                  )}
                </div>

                {/* Confirm button */}
                <button
                  onClick={confirmLocation}
                  disabled={!isDeliverable || gettingGPS || confirming}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-medium text-white transition-all shadow-lg min-h-[56px]
                    ${
                      gettingGPS
                        ? "bg-gray-400 cursor-not-allowed"
                        : isDeliverable
                          ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                          : "bg-gray-400 cursor-not-allowed"
                    }`}
                >
                  {gettingGPS && (
                    <>
                      <Loader
                        className="animate-spin flex-shrink-0"
                        size={18}
                      />
                      <span className="text-sm font-semibold">
                        Getting location...
                      </span>
                    </>
                  )}
                  {!gettingGPS && confirming && (
                    <>
                      <Loader
                        className="animate-spin flex-shrink-0"
                        size={18}
                      />
                      <span className="text-sm font-semibold">
                        Confirming...
                      </span>
                    </>
                  )}
                  {!gettingGPS && !confirming && isDeliverable && (
                    <span className="text-sm font-semibold">
                      ✓ Confirm Location
                    </span>
                  )}
                  {!gettingGPS && !confirming && !isDeliverable && (
                    <span className="text-sm font-semibold">
                      Not in delivery range
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* ── View: Saved Addresses ── */}
            {view === "saved" && (
              <div>
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Saved Addresses
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Choose from your saved locations
                    </p>
                  </div>
                  <button
                    onClick={() => setView("picker")}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {user?.addresses && user.addresses.length > 0 ? (
                    user.addresses.map((addr, i) => (
                      <button
                        key={i}
                        onClick={() => selectSavedAddress(addr)}
                        className="w-full text-left flex items-start gap-3 border border-gray-200 rounded-xl px-4 py-3 hover:border-orange-300 hover:bg-orange-50 transition-all"
                      >
                        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MapPin size={16} className="text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900">
                            {addr.label || `Address ${i + 1}`}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {addr.formattedAddress}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      No saved addresses
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
