import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import Direction from "../components/Direction";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { MapPin, Store } from "lucide-react";

function UserPin(color = "#f97316", size = 36) {
  return L.divIcon({
    html: renderToStaticMarkup(
      <MapPin size={size} color="white" fill={color} strokeWidth={1.5} />,
    ),
    className: "", // IMPORTANT: remove default styles
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}
function ShopPin(color = "#f97316", size = 36) {
  return L.divIcon({
    html: renderToStaticMarkup(
      <Store size={size} color="white" fill={color} strokeWidth={1.5} />,
    ),
    className: "", // IMPORTANT: remove default styles
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}
function MapController({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, {
        animate: true,
        duration: 1,
      });
    }
  }, [center, zoom, map]);

  return null;
}

function Map({ setGettingLocation }) {
  const markers = [
    { id: 1, name: "Narora Outlet", position: [28.203822, 78.374228] },
    { id: 2, name: "Debai Outlet 1", position: [28.203326, 78.267783] },
    { id: 3, name: "Debai Outlet 2", position: [28.207438, 78.253838] },
  ];
  const [tooFarDistance, setTooFarDistance] = useState(null);
  const [mapCenter, setMapCenter] = useState(markers[0].position);
  const [mapZoom, setMapZoom] = useState(16);
  const [destination, setDestination] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [distance, setDistance] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);

  const shopIcon = ShopPin("#f97316", 24); // orange
  const userIcon = UserPin("#2563eb", 24); // blue
  let watchId = null;

  function LocateMe() {
    setGettingLocation(true);
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      setGettingLocation(false);
      return;
    }

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        console.log("Accuracy (meters):", pos.coords.accuracy);

        // Stop watching if accuracy is less than 300 meters
        if (pos.coords.accuracy < 300) {
          setUserPos([pos.coords.latitude, pos.coords.longitude]);
          setGettingLocation(false);
          setMapCenter([pos.coords.latitude, pos.coords.longitude]);

          navigator.geolocation.clearWatch(watchId);
          return;
        }
      },
      (err) => {
        alert("Please turn on GPS / High accuracy mode");
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000, // ⬅ increase
        maximumAge: 0,
      },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }

  useEffect(() => {
    if (userPos) {
      console.log("User position:", userPos);
    }
  }, [userPos]);

  useEffect(() => {
    const timer = setTimeout(() => setMapLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="relative mt-10 rounded-3xl border border-orange-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Visit our kitchen
          </h3>
          <p className="text-sm text-slate-600">
            We’re always happy to welcome you.
          </p>
        </div>
        <button
          onClick={async () => {
            LocateMe();
          }}
          className="rounded-lg border border-orange-200 bg-orange-50 px-5 py-2.5 text-sm font-semibold text-orange-600 hover:bg-orange-100"
        >
          Get Directions
        </button>
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
            center={mapCenter}
            zoom={mapZoom}
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
            <MapController center={mapCenter} zoom={mapZoom} />
            {markers.map((m) => (
              <Marker key={m.id} position={m.position} icon={shopIcon}>
                <Popup>
                  <p className="text-md text-slate-900">{m.name}</p>
                </Popup>
              </Marker>
            ))}
            {userPos && (
              <Direction
                userPos={userPos}
                outlets={markers}
                userIcon={userIcon}
                onTooFar={setTooFarDistance}
                setDistance={setDistance}
                setDestination={setDestination}
              />
            )}
            {userPos && (
              <Marker
                position={userPos}
                icon={userIcon}
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

        {tooFarDistance && (
          <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
            🚫 Too far Distance ({tooFarDistance.toFixed(1)} km away)
          </div>
        )}
        {distance && (
          <div className="mt-3 rounded-lg bg-orange-50 border border-orange-200 px-4 py-2 text-sm text-orange-500 flex items-center gap-2">
            <MapPin /> Distance ({distance.toFixed(1)} km away)
          </div>
        )}
        {/* locatores */}
        <div className="absolute top-78 right-9 bg-white py-2 px-3 rounded-full text-xs font-medium text-slate-700 flex items-center gap-2 z-90">
          {markers.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setMapCenter(m.position);
                console.log("Centered map to:", m.position);
              }}
              className={`${mapCenter.every((val, i) => val === m.position[i]) ? "bg-orange-600 text-white" : "text-orange-600 border border-orange-600 "} px-2 py-1 rounded-full`}
            >
              Shop {m.id}
            </button>
          ))}
          {userPos && (
            <button
              onClick={() => {
                setMapCenter(userPos);
                console.log("Centered map to user:", userPos);
              }}
              className={` ${mapCenter.every((val, i) => val === userPos[i]) ? "bg-blue-600 text-white" : "text-blue-600 border border-blue-600"}  px-2 py-1 rounded-full`}
            >
              My Location
            </button>
          )}
        </div>
        <p className="text-[12px] text-gray-400 mt-1">
          © OpenStreetMap contributors | Leaflet
        </p>
        <button
          onClick={() => {
            let gmapsUrl = `https://www.google.com/maps?q=${mapCenter[0]},${mapCenter[1]}`;
            if (userPos !== null) {
              gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination[0]},${destination[1]}&travelmode=driving`;
            }
            window.open(gmapsUrl, "_blank");
          }}
          className={`flex justify-start items-center gap-2 mt-4 text-sm text-white ${markers.map((m) => m.position).some((pos) => mapCenter.every((val, i) => val === pos[i])) ? "bg-orange-600" : "bg-blue-600"} px-4 py-2 rounded-lg `}
        >
          <MapPin size={18} /> Open in Google Maps
        </button>
      </div>
    </div>
  );
}

export default Map;
