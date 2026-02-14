import { Loader, X } from "lucide-react";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { MapPin, Store } from "lucide-react";
import { getStreetName, MapController } from "./Map";
import { useSelector } from "react-redux";
import {
  setTempAddress,
  saveAddress,
  updateTempAddressSaved,
} from "../store/authSlice";
import { useDispatch } from "react-redux";

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
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [checking, setChecking] = useState(true);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [isGPS, setIsGPS] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const [fromSavedAddress, setFromSavedAddress] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [userMarkerPos, setUserMarkerPos] = useState([28.203326, 78.267783]);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [geolocationWatch, setGeolocationWatch] = useState(null);
  const [gpsCoords, setGpsCoords] = useState(null);
  const [confirmingLocation, setConfirmingLocation] = useState(false);
  const [addressText, setAddressText] = useState("");
  const defaultShopLocation = [28.203326, 78.267783]; // Default shop location
  const { user, isAuthenticated, tempAddress } = useSelector(
    (state) => state.auth,
  );
  const markers = [
    { id: 1, name: "Narora Outlet", position: [28.203822, 78.374228] },
    { id: 2, name: "Debai Outlet 1", position: [28.203326, 78.267783] },
    { id: 3, name: "Debai Outlet 2", position: [28.207438, 78.253838] },
  ];
  const shopIcon = ShopPin("#f97316", 24);
  const mapPin = UserPin("#2563eb", 28);

  const saveTempAddress = async (coords, shouldSaveToBackend = false) => {
    console.log(coords);
    const lat = Array.isArray(coords) ? coords[0] : coords.lat;
    const lng = Array.isArray(coords) ? coords[1] : coords.lng;

    // Check if this address already exists in user's saved addresses
    if (isAuthenticated && user && user.addresses) {
      const existingAddress = user.addresses.find((addr) => {
        const [savedLat, savedLng] = addr.coordinates;
        // Check if coordinates are very close (within ~100 meters)
        const latDiff = Math.abs(savedLat - lat);
        const lngDiff = Math.abs(savedLng - lng);
        return latDiff < 0.001 && lngDiff < 0.001;
      });

      if (existingAddress) {
        // Use existing saved address
        dispatch(setTempAddress(existingAddress));
        return;
      }
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_API}/api/geocode/reverse-geocode?lat=${lat}&lon=${lng}`,
      );

      if (!res.ok) {
        throw new Error(`Reverse geocoding failed: ${res.status}`);
      }

      const data = await res.json();
      const formattedAddress = data.display_name || "Unknown location";
      const addressData = {
        formattedAddress,
        coordinates: [lat, lng],
      };

      dispatch(setTempAddress(addressData));

      // Save to backend if user is authenticated and shouldSaveToBackend is true
      if (shouldSaveToBackend && isAuthenticated && user) {
        try {
          const result = await dispatch(
            saveAddress({
              formattedAddress,
              coordinates: [lat, lng],
              label: "New Address",
            }),
          );

          if (result.meta.requestStatus === "fulfilled") {
            // Update temp address to mark it as saved
            dispatch(updateTempAddressSaved());
            console.log("Address saved successfully");
          }
        } catch (err) {
          console.error("Error saving address:", err);
        }
      }
    } catch (err) {
      console.error("Error fetching address:", err);
    }
  };

  const fetchAndSetAddressText = async (coords) => {
    const lat = Array.isArray(coords) ? coords[0] : coords.lat;
    const lng = Array.isArray(coords) ? coords[1] : coords.lng;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_API}/api/geocode/reverse-geocode?lat=${lat}&lon=${lng}`,
      );

      if (!res.ok) {
        throw new Error(`Reverse geocoding failed: ${res.status}`);
      }

      const data = await res.json();
      const formattedAddress = data.display_name || "Unknown location";
      setAddressText(formattedAddress);
    } catch (err) {
      console.error("Error fetching address text:", err);
      setAddressText("Unable to fetch address");
    }
  };

  useEffect(() => {
    validateSession();
    checkPermission();
  }, []);

  useEffect(() => {
    const handleOpenLocationGate = () => {
      setIsManual(false);
      setGettingLocation(false);
      setShowModal(true);
      setChecking(false);
    };

    window.addEventListener("open-location-gate", handleOpenLocationGate);

    return () => {
      window.removeEventListener("open-location-gate", handleOpenLocationGate);
      // Cleanup geolocation watch on unmount
      if (geolocationWatch) {
        navigator.geolocation.clearWatch(geolocationWatch);
      }
    };
  }, [geolocationWatch]);

  // Handle saving tempAddress when user logs in after selecting an address
  useEffect(() => {
    // Save tempAddress if user just became authenticated and has an unsaved address
    if (isAuthenticated && user && tempAddress && !tempAddress.saved) {
      // Check if this address already exists in user's saved addresses
      const addressExists = user.addresses?.find((addr) => {
        const [savedLat, savedLng] = addr.coordinates;
        const [tempLat, tempLng] = tempAddress.coordinates;
        const latDiff = Math.abs(savedLat - tempLat);
        const lngDiff = Math.abs(savedLng - tempLng);
        return latDiff < 0.001 && lngDiff < 0.001;
      });

      if (!addressExists) {
        // Save the address that was selected before login
        dispatch(
          saveAddress({
            ...tempAddress,
            label: "Address from session",
          }),
        )
          .unwrap()
          .then(() => {
            dispatch(updateTempAddressSaved());
            console.log("Address saved after login");
          })
          .catch((err) => {
            console.error("Error saving address after login:", err);
          });
      } else {
        // If address already exists, just mark tempAddress as saved and use existing address
        dispatch(setTempAddress(addressExists));
      }
    }
  }, [
    isAuthenticated,
    user?.addresses,
    tempAddress?.coordinates,
    tempAddress?.saved,
  ]);

  // Fetch and display formatted address when coordinates change
  useEffect(() => {
    if (isGPS && gpsCoords) {
      fetchAndSetAddressText(gpsCoords);
    } else if (isManual && selectedCoords) {
      fetchAndSetAddressText(selectedCoords);
    } else if (isManual && userMarkerPos) {
      fetchAndSetAddressText(userMarkerPos);
    }
  }, [gpsCoords, selectedCoords, userMarkerPos, isGPS, isManual]);

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
    if (saved) {
      const coords = JSON.parse(sessionStorage.getItem("userCoords"));
      // Don't save to backend when loading from session - just set temp address
      saveTempAddress(coords, false);
      setChecking(false);
      return;
    }

    setShowModal(true);
    setChecking(false);
  }

  function getLocation() {
    setGettingLocation(true);
    setIsGPS(true);
    setMapLoading(true);

    const watchId = navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        // Store GPS coords separately, don't immediately update marker position
        setGpsCoords([coords.lat, coords.lng]);
        // Only store coordinates, don't move marker until confirmation
        setSelectedCoords([coords.lat, coords.lng]);
        setGettingLocation(false);
        setMapLoading(false);
      },
      (err) => {
        setIsGPS(false);
        setGettingLocation(false);
        setMapLoading(false);
        if (err.code === 1) alert("Location permission denied");
        else if (err.code === 2)
          alert("Location unavailable. Try moving outside.");
        else if (err.code === 3) alert("Location request timed out");
        else alert("Unable to get location");
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      },
    );
    setGeolocationWatch(watchId);
  }

  function cancelLocationRequest() {
    if (geolocationWatch) {
      navigator.geolocation.clearWatch(geolocationWatch);
      setGeolocationWatch(null);
    }
    setGettingLocation(false);
    setIsGPS(false);
    setMapLoading(false);
    // Reset to default shop location when cancelling GPS
    setUserMarkerPos(defaultShopLocation);
    setSelectedCoords(null);
    setGpsCoords(null);
  }

  function handleManual() {
    setIsManual(true);
    setMapLoading(true);
    // Reset to default shop location for manual selection
    setUserMarkerPos(defaultShopLocation);
    setSelectedCoords(null);
    setGpsCoords(null);
  }

  function handleSavedAddressSelection(address) {
    sessionStorage.setItem("userCoords", JSON.stringify(address.coordinates));
    sessionStorage.setItem("locationChoice", "saved");
    sessionStorage.setItem("locationChoiceTime", Date.now());
    // For saved addresses, just set the temp address, don't save to backend again
    dispatch(setTempAddress(address));
    setShowModal(false);
  }

  async function confirmLocation() {
    setConfirmingLocation(true);
    try {
      const finalCoords = selectedCoords || userMarkerPos;

      // If GPS mode, update marker position now
      if (isGPS && gpsCoords) {
        setUserMarkerPos(gpsCoords);
      }

      sessionStorage.setItem("userCoords", JSON.stringify(finalCoords));
      sessionStorage.setItem("locationChoice", isGPS ? "gps" : "manual");
      sessionStorage.setItem("locationChoiceTime", Date.now());

      // Use the edited address text from the input
      const addressData = {
        formattedAddress: addressText.trim() || "Unknown location",
        coordinates: finalCoords,
      };

      // Check if this address already exists in user's saved addresses
      if (isAuthenticated && user && user.addresses) {
        const existingAddress = user.addresses.find((addr) => {
          const [savedLat, savedLng] = addr.coordinates;
          const [tempLat, tempLng] = finalCoords;
          const latDiff = Math.abs(savedLat - tempLat);
          const lngDiff = Math.abs(savedLng - tempLng);
          return latDiff < 0.001 && lngDiff < 0.001;
        });

        if (existingAddress) {
          // Update existing address with new text if different
          if (
            existingAddress.formattedAddress !== addressData.formattedAddress
          ) {
            dispatch(
              setTempAddress({
                ...existingAddress,
                formattedAddress: addressData.formattedAddress,
              }),
            );
          } else {
            dispatch(setTempAddress(existingAddress));
          }
        } else {
          // Set temp address and save if user is authenticated
          dispatch(setTempAddress(addressData));

          if (isAuthenticated && user) {
            try {
              const result = await dispatch(
                saveAddress({
                  ...addressData,
                  label: "New Address",
                }),
              );

              if (result.meta.requestStatus === "fulfilled") {
                // Update tempAddress to mark it as saved to prevent duplicate saves
                dispatch(
                  setTempAddress({
                    ...addressData,
                    saved: true,
                  }),
                );
                console.log("Address saved successfully");
              }
            } catch (err) {
              console.error("Error saving address:", err);
            }
          }
        }
      } else {
        // No user addresses to check, just set temp address
        dispatch(setTempAddress(addressData));
      }

      // Add small delay to ensure redux state is updated
      setTimeout(() => {
        setShowModal(false);
        setConfirmingLocation(false);
      }, 500);
    } catch (error) {
      console.error("Error confirming location:", error);
      setConfirmingLocation(false);
    }
  }

  if (checking) return null;

  return (
    <>
      {children}

      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm min-h-screen">
          <div
            className={`w-[90vw] max-w-[500px] rounded-2xl h-fit bg-white p-6 text-center shadow-2xl transform transition-all`}
          >
            {!isGPS && !isManual && !fromSavedAddress ? (
              <>
                <div className="mb-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin size={32} className="text-orange-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Select your location
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    We need your location to show deliverable items and delivery
                    options in your area
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 text-white font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                    onClick={getLocation}
                  >
                    <MapPin size={20} />
                    Allow Location Access
                  </button>

                  <div className="my-6 flex items-center">
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    <span className="mx-4 text-xs text-gray-500 bg-white px-2">
                      OR
                    </span>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                  </div>

                  <button
                    className="w-full rounded-xl border border-orange-300 bg-orange-50 px-6 py-4 text-orange-700 font-medium hover:bg-orange-100 hover:border-orange-400 transition-all duration-200 flex items-center justify-center gap-3"
                    onClick={handleManual}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Select location manually
                  </button>

                  {isAuthenticated &&
                    user &&
                    user.addresses &&
                    user.addresses.length > 0 && (
                      <button
                        className="w-full rounded-xl border border-blue-300 bg-blue-50 px-6 py-4 text-blue-700 font-medium hover:bg-blue-100 hover:border-blue-400 transition-all duration-200 flex items-center justify-center gap-3"
                        onClick={() => setFromSavedAddress(true)}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                          />
                        </svg>
                        Choose from saved addresses
                      </button>
                    )}
                </div>
              </>
            ) : null}
            {(isManual || isGPS) && !fromSavedAddress ? (
              <div className="flex flex-1 flex-col h-full relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="text-left">
                    <h2 className="text-xl font-bold text-gray-800">
                      {isGPS ? "📍 Your Location" : "🗺️ Pin Your Location"}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {isGPS
                        ? gettingLocation
                          ? "Please wait while we locate you..."
                          : "Location found! Drag the pin to adjust if needed"
                        : "Drag the pin to set your delivery address"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (isGPS) {
                        cancelLocationRequest();
                      }
                      if (isManual) {
                        setIsManual(false);
                        setMapLoading(false);
                      }
                    }}
                    className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all duration-200"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Map Container */}
                <div className="flex-1 relative rounded-xl overflow-hidden border border-gray-200 shadow-lg">
                  {mapLoading || gettingLocation ? (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
                      <div className="flex flex-col items-center gap-3">
                        <Loader
                          className="animate-spin"
                          size={40}
                          color="#f97316"
                        />
                        <p className="text-sm text-gray-600 font-medium">
                          {gettingLocation
                            ? "Getting your location..."
                            : "Loading map..."}
                        </p>
                        {gettingLocation && (
                          <button
                            onClick={cancelLocationRequest}
                            className="text-xs text-gray-500 hover:text-gray-700 underline mt-1"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ) : null}
                  <MapContainer
                    center={
                      isGPS ? gpsCoords || defaultShopLocation : userMarkerPos
                    }
                    zoom={18}
                    scrollWheelZoom={true}
                    attributionControl={false}
                    style={{
                      width: "100%",
                      height: "320px",
                      background: "rgba(255,255,255,0.6)",
                      borderRadius: 6,
                    }}
                    whenCreated={() => {
                      if (!gettingLocation) {
                        setMapLoading(false);
                      }
                    }}
                  >
                    <TileLayer
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      attribution="© Esri"
                    />
                    <MapController
                      center={
                        isGPS ? gpsCoords || defaultShopLocation : userMarkerPos
                      }
                      zoom={18}
                    />
                    {markers.map((m) => (
                      <Marker key={m.id} position={m.position} icon={shopIcon}>
                        <Popup>
                          <div className="text-center">
                            <p className="font-semibold text-sm text-orange-600">
                              {m.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              Our Kitchen
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                    <Marker
                      position={
                        isGPS ? gpsCoords || defaultShopLocation : userMarkerPos
                      }
                      icon={mapPin}
                      draggable
                      eventHandlers={{
                        dragend: (e) => {
                          const pos = e.target.getLatLng();
                          const newPos = [pos.lat, pos.lng];

                          // Update positions for both GPS and manual modes
                          setUserMarkerPos(newPos);
                          setSelectedCoords(newPos);

                          // If in GPS mode, update gpsCoords as well
                          if (isGPS) {
                            setGpsCoords(newPos);
                          }

                          // Fetch new address for the dragged position
                          fetchAndSetAddressText(newPos);
                        },
                      }}
                    >
                      <Popup>
                        <div className="text-center">
                          <p className="font-semibold text-sm text-blue-600">
                            📍 Delivery Here
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Drag to adjust your location
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>

                {/* Address Input Field */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📍 Edit your address
                  </label>
                  <textarea
                    value={addressText}
                    onChange={(e) => setAddressText(e.target.value)}
                    placeholder="Enter your complete address with house number, landmark etc."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none text-sm"
                    rows={2}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You can edit this address to add house number, floor,
                    landmark etc.
                  </p>
                </div>

                {/* Confirm Button */}
                <button
                  onClick={confirmLocation}
                  disabled={gettingLocation || confirmingLocation}
                  className="mt-6 w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                >
                  {confirmingLocation ? (
                    <Loader className="animate-spin" size={20} />
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                  {gettingLocation
                    ? "Please wait..."
                    : confirmingLocation
                      ? "Confirming..."
                      : "Confirm Location"}
                </button>
              </div>
            ) : null}
            {fromSavedAddress &&
              user &&
              isAuthenticated &&
              user.addresses.length > 0 && (
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-left">
                      <h2 className="text-xl font-bold text-gray-800">
                        📍 Saved Addresses
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Choose from your saved locations
                      </p>
                    </div>
                    <button
                      onClick={() => setFromSavedAddress(false)}
                      className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all duration-200"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {user.addresses.map((addr, index) => (
                      <button
                        key={index}
                        className="w-full text-left rounded-xl border border-gray-200 bg-white px-4 py-4 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 shadow-sm hover:shadow-md"
                        onClick={() => {
                          handleSavedAddressSelection(addr);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-5 h-5 text-orange-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {addr.label || `Address ${index + 1}`}
                            </p>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {addr.formattedAddress}
                            </p>
                          </div>
                          <svg
                            className="w-5 h-5 text-orange-500 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
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
