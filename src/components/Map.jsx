import { useEffect, useState, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { MapPin, Store, AlertCircle, ChevronDown } from "lucide-react";
import { socket } from "../socket";

export function MapController({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, 18, {
        animate: true,
        duration: 1,
      });
    }
  }, [center, zoom, map]);

  return null;
}
export const getStreetName = async (lat, lon) => {
  const res = await fetch(
    `https://us1.locationiq.com/v1/reverse?key=${import.meta.env.VITE_LOCATIONIQ_KEY}&lat=${lat}&lon=${lon}&format=json`,
  );
  const data = await res.json();

  return data.display_name;
};

const MAP_ZOOM = 16;

function Map() {
  const { shopsData } = useSelector((state) => state.shop);
  const [shops, setShops] = useState([]);
  const [deletedShopIds, setDeletedShopIds] = useState(new Set());
  const [mapCenter, setMapCenter] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [errorAlert, setErrorAlert] = useState(null);
  const [selectedShop, setSelectedShop] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ─── Sync with Redux shops on mount and updates ────────────────────────────
  useEffect(() => {
    const shopsList = Array.isArray(shopsData)
      ? shopsData
      : (shopsData?.shops ?? []);

    const processedShops = shopsList
      .map((shop) => {
        const loc = shop?.shopLocation;
        if (!loc) return null;
        const position = loc.coordinates
          ? [loc.coordinates[1], loc.coordinates[0]]
          : loc.lat && loc.lng
            ? [loc.lat, loc.lng]
            : null;
        return position ? { ...shop, position, id: shop._id || shop.id } : null;
      })
      .filter(Boolean);

    setShops((prevShops) => {
      // If coming from empty state (initial mount), initialize with all shops
      if (prevShops.length === 0) {
        if (processedShops.length > 0 && !mapCenter) {
          setMapCenter(processedShops[0].position);
          setSelectedShop(processedShops[0].id);
        }
        console.log("Initial shops loaded:", processedShops);
        return processedShops;
      }

      // Merge Redux data with local state (preserves socket-added shops not yet in Redux)
      // 1. Update existing shops with Redux data
      const mergedShops = prevShops
        .map((localShop) => {
          const reduxShop = processedShops.find((s) => s.id === localShop.id);
          return reduxShop || localShop; // Use Redux version if exists, else keep local
        })
        .filter((shop) => !deletedShopIds.has(shop.id)); // Remove deleted shops

      // 2. Add new shops from Redux that weren't in local state
      const newFromRedux = processedShops.filter(
        (reduxShop) =>
          !prevShops.find((s) => s.id === reduxShop.id) &&
          !deletedShopIds.has(reduxShop.id),
      );

      const nextShops = [...mergedShops, ...newFromRedux];
      console.log("Shops merged from Redux:", nextShops);
      return nextShops;
    });
  }, [shopsData, deletedShopIds]);

  // ─── Socket listeners: shop added/deleted ──────────────────────────────────
  useEffect(() => {
    const handleShopDeleted = (deletedShop) => {
      console.log("Shop deleted:", deletedShop);
      const deletedId = deletedShop._id || deletedShop.id;

      // Track this deletion to prevent Redux from re-adding it
      setDeletedShopIds((prev) => new Set(prev).add(deletedId));

      // Remove from local shops state
      setShops((prev) => prev.filter((s) => s.id !== deletedId));
    };

    const handleShopAdded = (newShop) => {
      console.log("Shop added:", newShop);
      const loc = newShop?.shopLocation;
      if (!loc) return;

      const position = loc.coordinates
        ? [loc.coordinates[1], loc.coordinates[0]]
        : loc.lat && loc.lng
          ? [loc.lat, loc.lng]
          : null;

      if (!position) return;

      const processedShop = {
        ...newShop,
        position,
        id: newShop._id || newShop.id,
      };

      // If this shop was previously deleted, remove it from deleted set
      setDeletedShopIds((prev) => {
        const updated = new Set(prev);
        updated.delete(processedShop.id);
        return updated;
      });

      setShops((prev) => {
        // Avoid duplicates
        if (prev.find((s) => s.id === processedShop.id)) return prev;
        return [...prev, processedShop];
      });
    };

    socket.on("shop-deleted", handleShopDeleted);
    socket.on("shop-added", handleShopAdded);

    return () => {
      socket.off("shop-deleted", handleShopDeleted);
      socket.off("shop-added", handleShopAdded);
    };
  }, []); // Empty dependency - listeners don't depend on any state

  // ─── Validate selected shop still exists ───────────────────────────────────
  useEffect(() => {
    if (selectedShop && !shops.find((s) => s.id === selectedShop)) {
      const firstShop = shops[0];
      if (firstShop) {
        setSelectedShop(firstShop.id);
        setMapCenter(firstShop.position);
      } else {
        setSelectedShop(null);
        setMapCenter(null);
      }
    }
  }, [shops, selectedShop]);

  const USER_PIN = useMemo(
    () =>
      L.divIcon({
        html: renderToStaticMarkup(
          <MapPin size={24} color="white" fill="#2563eb" strokeWidth={1.5} />,
        ),
        className: "",
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24],
      }),
    [],
  );

  const SHOP_PIN = useMemo(
    () =>
      L.divIcon({
        html: renderToStaticMarkup(
          <Store size={24} color="white" fill="#f97316" strokeWidth={1.5} />,
        ),
        className: "",
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24],
      }),
    [],
  );

  function LocateMe() {
    if (!navigator.geolocation) {
      setErrorAlert("Geolocation not supported on this browser");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        // Stop watching if accuracy is less than 300 meters
        if (pos.coords.accuracy < 300) {
          setUserPos([pos.coords.latitude, pos.coords.longitude]);
          setMapCenter([pos.coords.latitude, pos.coords.longitude]);

          navigator.geolocation.clearWatch(watchId);
          return;
        }
      },
      (err) => {
        setErrorAlert(
          "Please turn on GPS / High accuracy mode from your device and try again.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      },
    );
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="relative mt-10 rounded-3xl border border-orange-200 bg-white p-6 shadow-sm">
      {/* Error Alert Modal */}
      {errorAlert && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[90vw] max-w-[420px] bg-white rounded-2xl p-6 shadow-2xl">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-50 to-orange-50 rounded-full flex items-center justify-center flex-shrink-0 border border-red-200">
                <AlertCircle size={24} className="text-red-500" />
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-lg font-bold text-gray-900">
                  Location Error
                </h3>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              {errorAlert}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setErrorAlert(null)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  setErrorAlert(null);
                  LocateMe();
                }}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg transition-all shadow-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Visit our kitchen
          </h3>
          <p className="text-sm text-slate-600 line-clamp-1">
            We’re always happy to welcome you.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-4 py-2.5 border border-slate-200 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1 transition-all flex items-center gap-2 min-w-[180px]"
            >
              <Store size={16} className="text-orange-600" />
              {shops.find((m) => m.id === selectedShop)?.name || "Select Shop"}
              <ChevronDown
                size={16}
                className={`ml-auto transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
                {shops.map((shop) => (
                  <button
                    key={shop.id}
                    onClick={() => {
                      setSelectedShop(shop.id);
                      setMapCenter(shop.position);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${
                      selectedShop === shop.id
                        ? "bg-orange-50 text-orange-700 font-medium"
                        : "text-slate-700 hover:bg-slate-50"
                    } border-b border-slate-100 last:border-0`}
                  >
                    <Store size={16} />
                    {shop.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => {
              const shop = shops.find((m) => m.id === selectedShop);
              if (shop) {
                const gmapsUrl = `https://www.google.com/maps?q=${shop.position[0]},${shop.position[1]}`;
                window.open(gmapsUrl, "_blank");
              }
            }}
            className="rounded-lg border border-orange-200 bg-orange-50 px-5 py-2.5 text-sm font-semibold text-orange-600 hover:bg-orange-100 whitespace-nowrap transition-colors"
          >
            Open in Google Maps
          </button>
        </div>
      </div>
      <div>
        {/* map */}
        <div className=" mt-5 h-68 w-full rounded-2xl border border-dashed border-orange-200 bg-orange-50/50 flex items-center justify-center relative z-20">
          {mapLoading && (
            <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
                <p className="text-slate-700 font-medium">Loading map...</p>
              </div>
            </div>
          )}

          <MapContainer
            center={mapCenter || [28.203822, 78.374228]}
            zoom={MAP_ZOOM}
            scrollWheelZoom={false}
            attributionControl={false}
            style={{
              width: "100%",
              height: "100%",
              background: "rgba(255,255,255,0.6)",
              borderRadius: 6,
            }}
            whenReady={() => setMapLoading(false)}
          >
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="© Esri"
            />
            <MapController center={mapCenter} zoom={MAP_ZOOM} />
            {shops.map((m) => (
              <Marker key={m.id} position={m.position} icon={SHOP_PIN}>
                <Popup>
                  <p className="text-md text-slate-900">{m.shopName}</p>
                </Popup>
              </Marker>
            ))}
            {userPos && (
              <Marker
                position={userPos}
                icon={USER_PIN}
                draggable
                eventHandlers={{
                  dragend: (e) => {
                    const p = e.target.getLatLng();
                    setUserPos([p.lat, p.lng]);
                  },
                }}
              >
                <Popup>📍 You are here</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

export default Map;
