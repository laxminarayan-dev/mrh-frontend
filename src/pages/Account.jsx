import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/authSlice";
import { useEffect, useRef, useState } from "react";
import { Loader, UtensilsCrossed } from "lucide-react";

async function getStreetName(lat, lon) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lon}`,
  );
  const data = await res.json();

  return typeof data?.display_name === "string" ? data.display_name : "";
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
  const { user } = useSelector((state) => state.auth);
  const { orders = [], reviews = [] } = user || {};
  const houseInput = useRef(null);
  const [profile, setProfile] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [addressList, setAddressList] = useState([]);
  const [addressHydrated, setAddressHydrated] = useState(false);

  let watchId = null;
  const [gettingLocation, setGettingLocation] = useState(false);
  const [coords, setCoords] = useState(null);
  const [newAddress, setNewAddress] = useState(null);

  useEffect(() => {
    setAddressHydrated(false);
    setProfile({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    const nextAddresses = (user?.addresses || []).map((address) => ({
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

    async function hydrateAddress() {
      setGettingLocation(true);
      const street = await getStreetName(coords[0], coords[1]);
      if (cancelled) return;

      setNewAddress(formatAddressForDisplay(street));

      setGettingLocation(false);
    }

    hydrateAddress();
    return () => (cancelled = true);
  }, [coords]);

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
                          watchId,
                          coords,
                          setGettingLocation,
                          setCoords,
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
                      onClick={() => {
                        if (houseInput.current) {
                          const houseNumber = houseInput.current.value.trim();
                          if (houseNumber) {
                            const addressToSave = {
                              coordinates: coords,
                              formattedAddress: `${houseNumber}, ${newAddress.line1}, ${newAddress.line2}, ${newAddress.country}`,
                              isDefault: addressList.length === 0, // Set as default if it's the first address
                            };
                            console.log("Save new address:", addressToSave);
                          } else {
                            alert("Please enter a flat or house number.");
                          }
                        }
                      }}
                      className="rounded-full border border-green-200 bg-white px-4 py-2 text-xs font-semibold text-green-400 shadow-sm transition hover:-translate-y-0.5 hover:border-green-300 hover:bg-green-50 hover:shadow-md"
                    >
                      Save New Address
                    </button>
                  )}
                </div>
                {newAddress && !gettingLocation && (
                  <div className="mt-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="mt-4">
                        <label className="text-xs font-medium text-slate-500">
                          Flat / House No.
                        </label>
                        <input
                          ref={houseInput}
                          type="text"
                          placeholder="Enter flat or house number"
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-200"
                        />
                      </div>
                      <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <p className="text-sm font-semibold text-slate-900">
                          {newAddress.line1}
                        </p>
                        {newAddress.line2 && (
                          <p className="mt-1 whitespace-pre-line text-sm text-slate-600">
                            {newAddress.line2}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-slate-500">
                          {newAddress.country}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {addressList.length > 0 || newAddress ? (
                  <div className="mt-4 space-y-4">
                    {addressList.map((address, index) => {
                      const { house, line1, line2, country } =
                        formatAddressForDisplay(address.formattedAddress);

                      return (
                        <div
                          key={`address-${index}`}
                          className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
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

                          <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
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
            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
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
  watchId,
  coords,
  setGettingLocation,
  setCoords,
}) => {
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
        setCoords([pos.coords.latitude, pos.coords.longitude]);
        setGettingLocation(false);

        navigator.geolocation.clearWatch(watchId);
        return;
      }
    },
    (err) => {
      alert("Please turn on GPS");
      setGettingLocation(false);
    },
    {
      enableHighAccuracy: true,
      timeout: 20000, // ⬅ increase
      maximumAge: 0,
    },
  );
  return () => navigator.geolocation.clearWatch(watchId);
};
