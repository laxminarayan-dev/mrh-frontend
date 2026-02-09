import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, saveAddress } from "../store/authSlice";
import { useEffect, useRef, useState } from "react";
import { Loader, UtensilsCrossed } from "lucide-react";

function pickBestResult(results, accuracy) {
  if (accuracy > 50) {
    return (
      results.find(
        (r) =>
          r.types.includes("route") &&
          r.geometry.location_type === "GEOMETRIC_CENTER",
      ) ||
      results.find((r) => r.types.includes("sublocality")) ||
      results[0]
    );
  }

  return (
    results.find((r) => r.geometry.location_type === "ROOFTOP") || results[0]
  );
}

function distanceInMeters([lat1, lon1], [lat2, lon2]) {
  const R = 6371000; // meters
  const toRad = (v) => (v * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function getStreetName(lat, lon, accuracy) {
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${import.meta.env.VITE_GOOGLE_MAP_API}`,
  );

  const data = await res.json();

  const result = pickBestResult(data.results, accuracy);
  console.log("Geocode results:", result);
  return result ? result.formatted_address : "Unknown location";
}

function formatAddressForDisplay(formattedAddress) {
  if (typeof formattedAddress !== "string" || !formattedAddress.trim()) {
    return { house: "", line1: "", line2: "", country: "" };
  }

  const parts = formattedAddress
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return { house: "", line1: "", line2: "", country: "" };
  }

  const country = parts[parts.length - 1];
  const possiblePostcode = parts[parts.length - 2];
  const hasPostcode = /^[0-9]{4,10}$/.test(possiblePostcode);
  const tailIndex = hasPostcode ? parts.length - 2 : parts.length - 1;

  const addressParts = parts.slice(0, tailIndex);

  return {
    house: addressParts[0] || "",
    line1: addressParts[1] || "",
    line2: addressParts.slice(2).join(", "),
    country,
  };
}

const Account = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);
  const { orders = [], reviews = [] } = user || {};
  const [accuracy, setAccuracy] = useState(null);
  const [newAddress, setNewAddress] = useState("");
  const [coords, setCoords] = useState(null);
  const houseInput = useRef(null);
  const [isAlreadySaved, setIsAlreadySaved] = useState(false);
  const [addressList, setAddressList] = useState([]);
  const [gettingLocation, setGettingLocation] = useState(false);
  const watchId = useRef(null);

  const [profile, setProfile] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [addressHydrated, setAddressHydrated] = useState(false);

  useEffect(() => {
    setAddressHydrated(false);
    setProfile({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    const nextAddresses = (user?.addresses || []).map((address) => ({
      _id: address._id,
      coordinates: address.coordinates || [0, 0],
      formattedAddress: address.formattedAddress || "",
      isDefault: address.isDefault || false,
    }));
    setAddressList(nextAddresses);
    setAddressHydrated(true);
  }, [user]);

  useEffect(() => {
    if (!coords) return;

    let cancelled = false;

    const existing = addressList.find((addr) => {
      const dist = distanceInMeters(coords, addr.coordinates);
      return dist < 100;
    });

    if (existing) {
      alert(
        "Your current location is very close to an existing saved address. No need to add again.",
      );
      setIsAlreadySaved(existing._id);
      return; // ✅ STOP here — DO NOT call Google
    }

    async function hydrateAddress() {
      setGettingLocation(true);
      const street = await getStreetName(coords[0], coords[1], accuracy);
      // const englishStreet = await translateToEnglish(street);
      if (cancelled) return;

      setNewAddress(street);

      setGettingLocation(false);
    }

    hydrateAddress();
    return () => (cancelled = true);
  }, [coords, accuracy]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFBE9] to-orange-200 min-h-screen">
      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <header className="rounded-3xl border border-orange-100 bg-white/90 p-6 shadow-sm backdrop-blur">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
                Account Overview
              </p>
              <button
                className="rounded-full border border-rose-200 bg-white px-5 py-2 text-xs font-semibold text-rose-600 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md"
                onClick={() => {
                  dispatch(logout());
                  navigate("/auth/login", { replace: true });
                }}
              >
                Logout
              </button>
            </div>
            <div className="flex gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex items-center gap-5">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md flex items-center justify-center text-xl font-semibold">
                  {profile.fullName
                    .split(" ")
                    .map((part) => part[0])
                    .join("") || "U"}
                </div>
                <div>
                  <p className="text-md font-serif font-light text-slate-900">
                    Welcome back
                  </p>
                  <h1 className="text-2xl font-serif font-bold text-slate-900">
                    {profile.fullName || "Your account"}
                  </h1>
                  <p className="text-sm text-slate-600">
                    Member since 2023 • {orders.length} orders
                  </p>
                </div>
              </div>
            </div>
          </header>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-serif font-semibold text-slate-900">
                  Personal Information
                </h2>
                {false && (
                  <button className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    Save Changes
                  </button>
                )}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 text-sm text-slate-700">
                  <span className="font-medium">Full Name</span>
                  <p className="w-full rounded-xl border border-slate-300 px-4 py-3 ">
                    {profile.fullName}
                  </p>
                </div>
                <div className="space-y-2 text-sm text-slate-700">
                  <span className="font-medium">Email</span>
                  <p className="w-full rounded-xl border border-slate-300 px-4 py-3 ">
                    {profile.email}
                  </p>
                </div>
                <div className="space-y-2 text-sm text-slate-700">
                  <span className="font-medium">Phone</span>
                  <div className="flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2">
                    <span className="text-sm">+91</span>
                    <p className="ml-2 w-full border-none bg-transparent px-1 py-1 text-sm outline-none">
                      {profile.phone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-900">
                    Shipping Address
                  </h3>
                  {!newAddress && (
                    <button
                      onClick={() =>
                        getMyLocation({
                          watchIdRef: watchId,
                          setGettingLocation,
                          setCoords,
                          setAccuracy,
                        })
                      }
                      className="rounded-full border border-orange-200 bg-white px-4 py-2 text-xs font-semibold text-orange-400 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 hover:shadow-md"
                    >
                      {gettingLocation ? (
                        <Loader className="animate-spin" />
                      ) : (
                        "Get My Location"
                      )}
                    </button>
                  )}
                  {newAddress && (
                    <button
                      disabled={loading}
                      onClick={() => {
                        const isDuplicate = addressList.some(
                          (addr) =>
                            addr.formattedAddress.toLowerCase() ===
                            newAddress.trim().toLowerCase(),
                        );
                        if (isDuplicate) {
                          alert(
                            "This address is already in your saved addresses",
                          );
                          return;
                        }

                        if (!newAddress.trim()) {
                          alert("Address cannot be empty");
                          return;
                        }

                        const addressData = {
                          coordinates: coords,
                          formattedAddress: newAddress.trim(),
                          isDefault: addressList.length === 0,
                        };

                        dispatch(saveAddress(addressData))
                          .unwrap()
                          .then(() => {
                            setNewAddress("");
                            setCoords(null);
                            setAccuracy(null);
                          })
                          .catch((err) => {
                            alert("Failed to save address: " + err.message);
                          });
                      }}
                      className="rounded-full border border-green-200 bg-white px-4 py-2 text-xs font-semibold text-green-400 shadow-sm transition hover:-translate-y-0.5 hover:border-green-300 hover:bg-green-50 hover:shadow-md"
                    >
                      {loading ? (
                        <Loader className="animate-spin" />
                      ) : (
                        "Save New Address"
                      )}
                    </button>
                  )}
                </div>
                {newAddress && !gettingLocation && (
                  <div className="mt-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <label className="text-xs font-medium text-slate-500">
                        Edit your address
                      </label>

                      <textarea
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        rows={4}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-200"
                      />

                      <p className="mt-2 text-xs text-slate-500">
                        Tip: Edit house number, floor, landmark if needed
                      </p>
                    </div>
                  </div>
                )}

                {addressList.length > 0 || newAddress ? (
                  <div className="mt-4 space-y-4">
                    {addressList.map((address, index) => {
                      console.log(
                        "Comparing addresses:",
                        address._id,
                        isAlreadySaved,
                      );
                      console.log(
                        "Comparing type:",
                        typeof address._id,
                        typeof isAlreadySaved,
                      );

                      const { house, line1, line2, country } =
                        formatAddressForDisplay(address.formattedAddress);
                      console.log(
                        "Comparing addresses:",
                        address._id,
                        isAlreadySaved,
                      );
                      return (
                        <div
                          key={`address-${index}`}
                          className={`rounded-2xl border p-4 shadow-sm ${isAlreadySaved == address._id ? "border-orange-300 bg-orange-50" : "border-slate-200 bg-white"}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
                              Saved Address
                            </p>
                            {address.isDefault && (
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                                Default
                              </span>
                            )}
                          </div>

                          <div className="mt-3 rounded-xl border border-slate-100 bg-transparent p-3">
                            <p className="text-sm font-semibold text-slate-900">
                              {house}
                            </p>
                            <p className="text-sm font-semibold text-slate-900">
                              {line1}
                            </p>
                            {line2 && (
                              <p className="mt-1 whitespace-pre-line text-sm text-slate-600">
                                {line2}
                              </p>
                            )}
                            <p className="mt-2 text-xs text-slate-500">
                              {country}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4">
                    <div className="flex items-start gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Add a shipping address
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          No shipping address on file yet. Use Get My Location
                          to add one and receive your orders.
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          Tip: Make sure location services are enabled.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm h-fit">
              <h2 className="text-xl font-serif font-semibold text-slate-900">
                Orders Snapshot
              </h2>
              <div className="mt-4 space-y-4">
                {orders.length === 0 ? (
                  <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
                      <UtensilsCrossed size={24} className="text-orange-500" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-slate-900">
                      No orders yet
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                      Your first order is just a few clicks away. Explore the
                      menu and discover today’s specials.
                    </p>
                    <button
                      className="mt-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      onClick={() => navigate("/menu")}
                    >
                      Browse Menu
                    </button>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-slate-100 p-4 transition hover:border-orange-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {order.id}
                          </p>
                          <p className="text-xs text-slate-500">{order.date}</p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            order.status === "Delivered"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-slate-700">
                        {order.items}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-900">
                          {order.total}
                        </span>
                        <button className="rounded-full border border-orange-200 bg-white px-3 py-1 text-xs font-semibold text-orange-700 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {reviews.length > 0 && (
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-serif font-semibold text-slate-900">
                  Recent Reviews
                </h2>
                <div className="mt-4 space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-2xl bg-slate-50 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900">
                          {review.item}
                        </p>
                        <span className="text-xs text-slate-500">
                          {review.date}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <span
                            key={`${review.id}-star-${idx}`}
                            className={`text-sm ${
                              idx < review.rating
                                ? "text-orange-500"
                                : "text-slate-300"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        {review.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Account;

export const getMyLocation = ({
  setGettingLocation,
  setCoords,
  watchIdRef,
  setAccuracy,
}) => {
  setGettingLocation(true);

  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    setGettingLocation(false);
    return;
  }

  watchIdRef.current = navigator.geolocation.watchPosition(
    (pos) => {
      console.log("Accuracy (meters):", pos.coords.accuracy);

      if (pos.coords.accuracy <= 150) {
        setAccuracy(pos.coords.accuracy);
        setCoords([pos.coords.latitude, pos.coords.longitude]);
        setGettingLocation(false);

        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    },
    () => {
      alert("Please turn on GPS");
      setGettingLocation(false);
    },
    {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0,
    },
  );
};
