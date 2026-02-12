import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { MapPin, Store } from "lucide-react";
import { MapController } from "./Map";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";

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
function UserPin(color = "#2563eb", size = 36) {
    return L.divIcon({
        html: renderToStaticMarkup(
            <MapPin size={size} color="white" fill={color} strokeWidth={1.5} />,
        ),
        className: "",
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size],
    });
}
export default function LocationGate({ children }) {
    const [showModal, setShowModal] = useState(false);
    const [checking, setChecking] = useState(true);
    const [gettingLocation, setGettingLocation] = useState(false);
    const [isManual, setIsManual] = useState(false);
    const [mapLoading, setMapLoading] = useState(true);
    const [userMarkerPos, setUserMarkerPos] = useState([28.203326, 78.267783]);
    const [selectedCoords, setSelectedCoords] = useState(null);
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    const markers = [
        { id: 1, name: "Narora Outlet", position: [28.203822, 78.374228] },
        { id: 2, name: "Debai Outlet 1", position: [28.203326, 78.267783] },
        { id: 3, name: "Debai Outlet 2", position: [28.207438, 78.253838] },
    ];
    const shopIcon = ShopPin("#f97316", 24);
    const mapPin = UserPin("#2563eb", 28);

    useEffect(() => {
        validateSession();
        checkPermission();
    }, []);

    function validateSession() {
        const time = Number(sessionStorage.getItem("locationChoiceTime"));

        if (!time) return;

        const THIRTY_MIN = 1000 * 60 * 30;

        if (Date.now() - time > THIRTY_MIN) {
            sessionStorage.clear();
        }
    }

    async function checkPermission() {
        const saved = sessionStorage.getItem("locationChoice");
        console.log("Saved location choice:", saved);
        if (saved) {
            setChecking(false);
            return;
        }

        if (!navigator.geolocation) {
            setShowModal(true);
            setChecking(false);
            return;
        }

        try {
            const perm = await navigator.permissions.query({ name: "geolocation" });

            if (perm.state === "granted") {
                getLocation();
            } else {
                setShowModal(true);
            }
        } catch {
            setShowModal(true);
        }

        setChecking(false);
    }

    function getLocation() {
        setGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {

                const coords = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                };
                setTimeout(() => {
                    setGettingLocation(false);
                    setShowModal(false);
                }, 1000);
                setUserMarkerPos([coords.lat, coords.lng]);
                sessionStorage.setItem("userCoords", JSON.stringify(coords));
                sessionStorage.setItem("locationChoice", "gps");
                sessionStorage.setItem("locationChoiceTime", Date.now());

            },
            (err) => {
                setGettingLocation(false);
                if (err.code === 1)
                    alert("Location permission denied");

                else if (err.code === 2)
                    alert("Location unavailable. Try moving outside.");

                else if (err.code === 3)
                    alert("Location request timed out");

                else
                    alert("Unable to get location");
            },
            {
                enableHighAccuracy: true,
                timeout: 20000, // ⬅ increase
                maximumAge: 0,
            },
        );
    }

    function handleManual() {
        setIsManual(true);
        setMapLoading(true);
    }

    if (checking) return null;

    return (
        <>
            {children}

            {showModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 min-h-screen">
                    <div className={`${isManual ? "w-[80vw] max-w-[600px] max-w-4xl h-[500px] sm:h-[600px]" : "w-[350px] h-76"} rounded-2xl bg-white px-6 py-8 text-center shadow-[0_20px_40px_rgba(0,0,0,0.15)] ${gettingLocation ? "flex items-center justify-center" : ""}`}>
                        {!gettingLocation && !isManual ? (
                            <>
                                <h2 className="text-xl font-semibold">Select your location</h2>
                                <p className="mt-2 text-sm text-neutral-600">
                                    We need your location to show deliverable items and delivery options
                                </p>

                                <button
                                    className="mt-4 w-full rounded-xl bg-orange-500 px-4 py-3 text-base text-white hover:brightness-110 flex items-center justify-center gap-2"
                                    onClick={getLocation}
                                >
                                    <MapPin size={18} /> Allow Location
                                </button>

                                <div className="my-4 text-xs text-neutral-500 flex items-center">
                                    <span className="flex-1 h-[2px] bg-orange-100 rounded-full"></span>
                                    <span className="mx-2">OR</span>
                                    <span className="flex-1 h-[2px] bg-orange-100 rounded-full"></span>
                                </div>

                                <button
                                    className="w-full rounded-xl border border-orange-400 bg-orange-50 px-4 py-3 text-sm hover:bg-orange-100"
                                    onClick={handleManual}
                                >
                                    Select location manually
                                </button>
                            </>
                        ) : !isManual ? (
                            <Loader className="animate-spin" size={48} color="#f97316" />
                        ) : null}
                        {isManual && (
                            <div className="flex flex-col h-full relative"  >
                                {/* Header */}
                                <div className="flex items-center justify-between self-center mb-4 ">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900">Pin Your Location</h2>
                                        <p className="text-xs text-slate-500 mt-0.5">Drag the pin to set your delivery address</p>
                                    </div>
                                    <button
                                        onClick={() => setIsManual(false)}
                                        className=" absolute top-0 right-0 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Map Container */}
                                <div className="flex-1 relative rounded-xl overflow-hidden border-2 border-orange-100 shadow-inner">
                                    {mapLoading && (
                                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader className="animate-spin" size={32} color="#f97316" />
                                                <p className="text-xs text-slate-600">Loading map...</p>
                                            </div>
                                        </div>
                                    )}
                                    <MapContainer
                                        center={userMarkerPos}
                                        zoom={18}
                                        scrollWheelZoom={true}
                                        attributionControl={false}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            background: "rgba(255,255,255,0.6)",
                                            borderRadius: 6,
                                        }}
                                        whenCreated={() => {
                                            setMapLoading(false)
                                        }}
                                    >
                                        <TileLayer
                                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                            attribution="© Esri"
                                        />
                                        <MapController center={userMarkerPos} zoom={18} />
                                        {markers.map((m) => (
                                            <Marker key={m.id} position={m.position} icon={shopIcon}>
                                                <Popup>
                                                    <div className="text-center">
                                                        <p className="font-semibold text-sm text-orange-600">{m.name}</p>
                                                        <p className="text-xs text-slate-500 mt-1">Our Kitchen</p>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        ))}
                                        <Marker
                                            position={userMarkerPos}
                                            icon={mapPin}
                                            draggable={true}
                                            eventHandlers={{
                                                dragend: (e) => {
                                                    const pos = e.target.getLatLng();
                                                    const newPos = [pos.lat, pos.lng];
                                                    setUserMarkerPos(newPos);
                                                    setSelectedCoords(newPos);
                                                },
                                            }}
                                        >
                                            <Popup>
                                                <div className="text-center">
                                                    <p className="font-semibold text-sm text-blue-600">📍 Delivery Here</p>
                                                    <p className="text-xs text-slate-500 mt-1">Drag to adjust</p>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    </MapContainer>

                                    {/* Floating Locate Button */}
                                    <button
                                        onClick={getLocation}
                                        className="absolute bottom-4 right-4 z-[500] bg-white hover:bg-orange-50 text-orange-600 p-3 rounded-full shadow-lg border border-orange-100 transition-all hover:scale-105"
                                        title="Use my current location"
                                    >
                                        <MapPin size={20} />
                                    </button>
                                </div>

                                {user && isAuthenticated && user.addresses.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-sm text-neutral-600 mb-4">Select from saved addresses:</p>
                                        {/* Render user's saved addresses here */}
                                        {user.addresses.map((addr, index) => (
                                            <button
                                                key={index}
                                                className="w-full rounded-xl border border-orange-400 bg-orange-50 px-4 py-3 text-sm hover:bg-orange-100"
                                                onClick={() => {
                                                    setUserMarkerPos(addr.coordinates);
                                                    setSelectedCoords(addr.coordinates);
                                                }}
                                            >
                                                {addr.formattedAddress}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Confirm Button */}
                                <button
                                    onClick={() => {
                                        sessionStorage.setItem("userCoords", JSON.stringify(selectedCoords || userMarkerPos));
                                        sessionStorage.setItem("locationChoice", "manual");
                                        sessionStorage.setItem("locationChoiceTime", Date.now());

                                        setShowModal(false);
                                    }}
                                    className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Confirm Location
                                </button>



                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
