import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, saveAddress } from "../store/authSlice";
import { useEffect, useRef, useState } from "react";
import { Loader, UtensilsCrossed } from "lucide-react";

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

async function getStreetName(lat, lon) {
  const res = await fetch(
    `https://us1.locationiq.com/v1/reverse?key=${import.meta.env.VITE_LOCATIONIQ_KEY}&lat=${lat}&lon=${lon}&format=json`,
  );
  const data = await res.json();
  console.log("Reverse geocoding result:", data);

  return data.display_name;
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

function formatOrderDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const datePart = date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${datePart} • ${timePart}`;
}

const Account = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);
  const { orders = [], reviews = [] } = user || {};
  const [accuracy, setAccuracy] = useState(null);
  const [newAddress, setNewAddress] = useState("");
  const [coords, setCoords] = useState(null);
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
      if (
        street &&
        typeof street === "string" &&
        !street.toLowerCase().startsWith("unnamed") &&
        !street.toLowerCase().startsWith("unknown")
      ) {
        setNewAddress(street);
      } else {
        alert("Unable to determine street name.");
        setCoords(null);
        setAccuracy(null);
        setNewAddress(null);
      }

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
                        rows={2}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-200 resize-none"
                      />

                      <p className="mt-2 text-xs text-slate-500">
                        Tip: Edit house number, floor, landmark if needed
                      </p>
                    </div>
                  </div>
                )}
                <ListAddresses
                  addressList={addressList}
                  newAddress={newAddress}
                  isAlreadySaved={isAlreadySaved}
                />
              </div>
            </div>
            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm h-fit">
              <h2 className="text-xl font-serif font-semibold text-slate-900">
                Orders Snapshot
              </h2>
              <div className="mt-4 grid gap-4">
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
                  orders.map((order) => {
                    const orderTarget = order?._id || order?.orderId;
                    const orderId =
                      typeof orderTarget === "string"
                        ? orderTarget.slice(-6).toUpperCase()
                        : "ORDER";
                    const items = Array.isArray(order.orderItems)
                      ? order.orderItems
                      : [];
                    const topItems = items.slice(0, 3);
                    const remainingItems = items.length - topItems.length;
                    const itemCount = items.reduce(
                      (total, item) => total + (item.quantity || 0),
                      0,
                    );

                    return (
                      <button
                        key={order._id || orderId}
                        type="button"
                        className="group w-full rounded-2xl border border-orange-100 bg-gradient-to-br from-white via-amber-50/40 to-orange-50/70 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
                        onClick={() =>
                          orderTarget && navigate(`/orders/${orderTarget}`)
                        }
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-500">
                              Order #{orderId}
                            </p>
                            <p className="mt-2 text-sm font-semibold text-slate-900">
                              {itemCount} items • ₹{order.totalAmount}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {formatOrderDate(order.createdAt)}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                              order.status === "Delivered"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-500"
                            }`}
                          >
                            {order.status || "Processing"}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-700">
                          {topItems.map((item) => (
                            <span
                              key={`${order._id}-${item.name}`}
                              className="rounded-full border border-orange-100 bg-white/90 px-3 py-1 shadow-sm"
                            >
                              {item.name} x {item.quantity}
                            </span>
                          ))}
                          {remainingItems > 0 && (
                            <span className="rounded-full border border-dashed border-orange-200 px-3 py-1 text-orange-500">
                              +{remainingItems} more
                            </span>
                          )}
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-xs text-slate-500">
                            Tap to view details
                          </div>
                          <div className="flex items-center gap-2 text-xs font-semibold text-orange-600">
                            <span className="h-2 w-2 rounded-full bg-orange-400"></span>
                            Tracking active
                          </div>
                        </div>
                      </button>
                    );
                  })
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
  setAccuracy,
}) => {
  setGettingLocation(true);

  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    setGettingLocation(false);
    return;
  }

  const options = {
    enableHighAccuracy: true,
    timeout: 15000, // ✅ GPS needs time
    maximumAge: 0,
  };

  let attempts = 0;
  const MAX_ATTEMPTS = 6; // ~30 seconds total

  const fetchLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        console.log("Accuracy:", accuracy);

        setAccuracy(accuracy);

        if (accuracy <= 400 || attempts >= MAX_ATTEMPTS) {
          setCoords([latitude, longitude]);
          setGettingLocation(false);
          return;
        }

        attempts++;
        setTimeout(fetchLocation, 5000); // retry after 5 sec
      },
      (err) => {
        console.error(err);
        alert("Please turn on GPS & keep screen ON");
        setGettingLocation(false);
      },
      options,
    );
  };

  fetchLocation();
};

export const ListAddresses = ({
  onChekout = false,
  addressList = [],
  newAddress = null,
  isAlreadySaved = null,
  setSelectedAddress = () => {},
  selectedAddress = null,
}) => {
  const navigate = useNavigate();
  return (
    <>
      {addressList.length > 0 || newAddress ? (
        <div className="mt-4 space-y-4">
          {addressList.map((address, index) => {
            const { house, line1, line2, country } = formatAddressForDisplay(
              address.formattedAddress,
            );
            return (
              <div
                key={`address-${index}`}
                className={`rounded-2xl border p-4 shadow-sm 
                  ${!onChekout && isAlreadySaved == address._id ? "border-orange-200 bg-orange-50" : "border-slate-200 bg-white"} 
                  ${onChekout && selectedAddress == address._id ? "!border-orange-200 !bg-orange-50" : "border-slate-200 bg-white"} 
                  transition hover:border-orange-300 hover:bg-orange-50 cursor-pointer`}
                onClick={() => onChekout && setSelectedAddress(address._id)}
              >
                <div className="flex items-center justify-start gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500 flex-1">
                    Saved Address
                  </p>
                  {address.isDefault && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                      Default
                    </span>
                  )}
                  {onChekout && (
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        address._id === selectedAddress
                          ? "border-orange-500 bg-orange-500"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {address._id === selectedAddress && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  )}
                </div>

                <div
                  className={`mt-3 rounded-xl p-3 bg-transparent ${address._id === selectedAddress || (!onChekout && isAlreadySaved == address._id) ? "border border-orange-200 bg-orange-50" : "border border-slate-200 bg-white"} transition`}
                >
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
                  <p className="mt-2 text-xs text-slate-500">{country}</p>
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
                No shipping address on file yet. Use Get My Location to add one
                and receive your orders.
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Tip: Make sure location services are enabled.
              </p>
              {onChekout && (
                <button
                  aria-label="redirect-to-account"
                  className="mt-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  onClick={() => {
                    navigate("/account");
                  }}
                >
                  Add Address
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
