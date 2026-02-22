import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, setTempAddress } from "../store/authSlice";
import { useEffect, useState } from "react";
import { fetchCartItems } from "../store/cartSlice";
import {
  UtensilsCrossed,
  MapPin,
  User,
  Mail,
  Phone,
  LogOut,
  ChevronRight,
  CheckCircle2,
  Clock,
  Package,
  ShoppingBag,
} from "lucide-react";
import { getStreetName } from "../components/Map";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function distanceInMeters([lat1, lon1], [lat2, lon2]) {
  const R = 6371000;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatAddressForDisplay(formattedAddress) {
  if (typeof formattedAddress !== "string" || !formattedAddress.trim())
    return { house: "", line1: "", line2: "", country: "" };
  const parts = formattedAddress.split(",").map((p) => p.trim()).filter(Boolean);
  if (!parts.length) return { house: "", line1: "", line2: "", country: "" };
  const country = parts[parts.length - 1];
  const hasPostcode = /^[0-9]{4,10}$/.test(parts[parts.length - 2]);
  const tail = hasPostcode ? parts.length - 2 : parts.length - 1;
  const body = parts.slice(0, tail);
  return { house: body[0] || "", line1: body[1] || "", line2: body.slice(2).join(", "), country };
}

function formatOrderDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (isNaN(date.getTime())) return String(value);
  return `${date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} • ${date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
}

const STATUS_STYLES = {
  delivered: { cls: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  placed: { cls: "bg-blue-100 text-blue-700", icon: ShoppingBag },
  accepted: { cls: "bg-indigo-100 text-indigo-700", icon: Package },
  ready: { cls: "bg-amber-100 text-amber-700", icon: Package },
  "out-for-delivery": { cls: "bg-purple-100 text-purple-700", icon: Package },
  canceled: { cls: "bg-red-100 text-red-600", icon: Clock },
  rejected: { cls: "bg-red-100 text-red-600", icon: Clock },
};

function getStatusStyle(status) {
  return STATUS_STYLES[status?.toLowerCase()] || { cls: "bg-slate-100 text-slate-600", icon: Clock };
}

// ─── Skeleton loaders ─────────────────────────────────────────────────────────
function OrderSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-orange-100 bg-white p-4 space-y-3">
      <div className="flex justify-between">
        <div className="h-3 w-20 bg-slate-200 rounded-full" />
        <div className="h-5 w-16 bg-slate-200 rounded-full" />
      </div>
      <div className="h-4 w-32 bg-slate-200 rounded-full" />
      <div className="h-3 w-24 bg-slate-100 rounded-full" />
      <div className="flex gap-2">
        <div className="h-6 w-20 bg-slate-100 rounded-full" />
        <div className="h-6 w-16 bg-slate-100 rounded-full" />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const Account = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, tempAddress } = useSelector((s) => s.auth);
  const { orders, loadingOrders } = useSelector((s) => s.cart);

  const [accuracy, setAccuracy] = useState(null);
  const [newAddress, setNewAddress] = useState("");
  const [coords, setCoords] = useState(null);
  const [isAlreadySaved, setIsAlreadySaved] = useState(false);
  const [addressList, setAddressList] = useState([]);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [ordersReady, setOrdersReady] = useState(false);

  const profile = {
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  };

  const initials = profile.fullName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2) || "U";

  // ── Fix: fetch orders on mount if not loaded ──────────────────────────────
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => setOrdersReady(true), 400);
    if (!orders.length && !loadingOrders) {
      dispatch(fetchCartItems());
    }
    return () => clearTimeout(timer);
  }, [user]);

  // ── Hydrate address list ──────────────────────────────────────────────────
  useEffect(() => {
    const next = (user?.addresses || []).map((a) => ({
      _id: a._id,
      coordinates: a.coordinates || [0, 0],
      formattedAddress: a.formattedAddress || "",
      isDefault: a.isDefault || false,
    }));
    setAddressList(next);
  }, [user]);

  // ── Geocode on coord change ───────────────────────────────────────────────
  useEffect(() => {
    if (!coords) return;
    let cancelled = false;

    const existing = addressList.find(
      (a) => distanceInMeters(coords, a.coordinates) < 100
    );
    if (existing) {
      alert("This location is already saved.");
      setIsAlreadySaved(existing._id);
      return;
    }

    setGettingLocation(true);
    getStreetName(coords[0], coords[1], accuracy).then((street) => {
      if (cancelled) return;
      if (street && !street.toLowerCase().startsWith("unnamed") && !street.toLowerCase().startsWith("unknown")) {
        setNewAddress(street);
      } else {
        alert("Unable to determine street name.");
        setCoords(null);
      }
      setGettingLocation(false);
    });

    return () => { cancelled = true; };
  }, [coords, accuracy]);

  const showOrderSkeleton = loadingOrders || !ordersReady;

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#FFFBE9] to-orange-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

        {/* ── Header ── */}
        <div className="mb-8 rounded-3xl bg-white border border-orange-100 shadow-sm overflow-hidden">
          {/* Top stripe */}
          <div className="h-2 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500" />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white text-xl font-bold shadow-md">
                  {initials}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white" />
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-orange-500 mb-0.5">
                  Account
                </p>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">
                  {profile.fullName || "Your Account"}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Member since {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
                    : "—"} · {orders.length} orders
                </p>
              </div>
            </div>

            <button
              onClick={() => { dispatch(logout()); navigate("/auth/login", { replace: true }); }}
              className="self-start sm:self-auto inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-600 transition-all"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        <div className="mt-6">

          {/* ── top column ── */}
          <div className="space-y-6 mb-6">

            {/* Personal Info */}
            <div className=" rounded-3xl bg-white border border-orange-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
                <User size={16} className="text-orange-400" /> Personal Information
              </h2>

              <div className="space-y-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { icon: User, label: "Full Name", value: profile.fullName },
                  { icon: Mail, label: "Email", value: profile.email },
                  { icon: Phone, label: "Phone", value: profile.phone ? `+91 ${profile.phone}` : "—" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <Icon size={14} className="text-orange-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
                      <p className="text-sm font-medium text-slate-800 truncate">{value || "—"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Addresses */}
            <div className="rounded-3xl bg-white border border-orange-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                <MapPin size={16} className="text-orange-400" /> Saved Addresses
              </h2>
              <p className="text-xs text-slate-400 mb-5">Tap an address to use it for delivery</p>

              {newAddress && !gettingLocation && (
                <div className="mb-4 rounded-2xl border border-orange-200 bg-orange-50 p-4">
                  <label className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
                    New address detected
                  </label>
                  <textarea
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    rows={2}
                    className="mt-2 w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">Edit to add house number, landmark, floor etc.</p>
                </div>
              )}

              <ListAddresses
                addressList={addressList}
                newAddress={newAddress}
                isAlreadySaved={isAlreadySaved}
                tempAddress={tempAddress}
              />
            </div>
          </div>

          {/* ── bottom column: Orders ── */}
          <div className="rounded-3xl bg-white border border-orange-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <ShoppingBag size={16} className="text-orange-400" /> Order History
            </h2>
            <p className="text-xs text-slate-400 mb-5">Your recent orders</p>

            <div className="space-y-3">
              {showOrderSkeleton ? (
                <>
                  <OrderSkeleton />
                  <OrderSkeleton />
                  <OrderSkeleton />
                </>
              ) : orders.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/50 p-8 text-center">
                  <div className="mx-auto w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mb-3">
                    <UtensilsCrossed size={22} className="text-orange-400" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1">No orders yet</h3>
                  <p className="text-xs text-slate-500 mb-4">Your first order is just a few clicks away</p>
                  <button
                    onClick={() => navigate("/menu")}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                <div className="space-y-3  overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
                  {[...orders].reverse().map((order) => {
                    const id = (order?._id || order?.orderId || "");
                    const shortId = typeof id === "string" ? id.slice(-6).toUpperCase() : "ORDER";
                    const items = Array.isArray(order.orderItems) ? order.orderItems : [];
                    const itemCount = items.reduce((t, i) => t + (i.quantity || 0), 0);
                    const top3 = items.slice(0, 3);
                    const extra = items.length - top3.length;
                    const { cls, icon: StatusIcon } = getStatusStyle(order.status);

                    return (
                      <button
                        key={order._id || shortId}
                        type="button"
                        onClick={() => id && navigate(`/orders/${id}`)}
                        className="group w-full text-left rounded-2xl border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-200 p-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500">
                              #{shortId}
                            </p>
                            <p className="text-sm font-semibold text-slate-900 mt-1">
                              {itemCount} item{itemCount !== 1 ? "s" : ""} · ₹{order.totalAmount}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{formatOrderDate(order.createdAt)}</p>
                          </div>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${cls}`}>
                            <StatusIcon size={10} />
                            {order.status || "Processing"}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {top3.map((item) => (
                            <span
                              key={`${order._id}-${item.name}`}
                              className="rounded-full border border-orange-100 bg-white px-2.5 py-0.5 text-[11px] text-slate-600"
                            >
                              {item.name} ×{item.quantity}
                            </span>
                          ))}
                          {extra > 0 && (
                            <span className="rounded-full border border-dashed border-orange-200 px-2.5 py-0.5 text-[11px] text-orange-500">
                              +{extra} more
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-end mt-2 gap-1 text-[11px] font-medium text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          View details <ChevronRight size={12} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Account;

// ─── Exported helpers ─────────────────────────────────────────────────────────
export const getMyLocation = ({ setGettingLocation, setCoords, setAccuracy }) => {
  setGettingLocation(true);
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    setGettingLocation(false);
    return;
  }

  let attempts = 0;
  const MAX = 6;
  const opts = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 };

  const fetch = () => {
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude, accuracy } }) => {
        setAccuracy(accuracy);
        if (accuracy <= 400 || attempts >= MAX) {
          setCoords([latitude, longitude]);
          setGettingLocation(false);
        } else {
          attempts++;
          setTimeout(fetch, 5000);
        }
      },
      (err) => {
        console.error(err);
        alert("Please turn on GPS & keep screen ON");
        setGettingLocation(false);
      },
      opts,
    );
  };

  fetch();
};

export const ListAddresses = ({
  onChekout = false,
  addressList = [],
  newAddress = null,
  isAlreadySaved = null,
  tempAddress = null,
  setSelectedAddress = () => { },
  selectedAddress = null,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  if (!addressList.length && !newAddress) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/40 p-6 text-center">
        <div className="mx-auto w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-3">
          <MapPin size={18} className="text-orange-500" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1">No addresses saved</h3>
        <p className="text-xs text-slate-500 mb-3">Add your first delivery address to get started.</p>
        {onChekout && (
          <button
            onClick={() => navigate("/account")}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
          >
            Add Address
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {addressList.map((address, index) => {
        const { house, line1, line2, country } = formatAddressForDisplay(address.formattedAddress);

        const isCurrentTemp =
          tempAddress?.coordinates &&
          address.coordinates &&
          Math.abs(tempAddress.coordinates[0] - address.coordinates[0]) < 0.001 &&
          Math.abs(tempAddress.coordinates[1] - address.coordinates[1]) < 0.001;

        const isSelected = onChekout
          ? selectedAddress === address._id
          : isAlreadySaved === address._id || isCurrentTemp;

        return (
          <div
            key={`address-${index}`}
            onClick={() => {
              if (onChekout) {
                setSelectedAddress(address._id);
              } else if (!isCurrentTemp) {
                dispatch(setTempAddress({
                  formattedAddress: address.formattedAddress,
                  coordinates: address.coordinates,
                  saved: true,
                }));
                sessionStorage.setItem("userCoords", JSON.stringify(address.coordinates));
                sessionStorage.setItem("locationChoice", "saved");
                sessionStorage.setItem("locationChoiceTime", Date.now());
              }
            }}
            className={`relative rounded-2xl border-2 p-4 cursor-pointer transition-all duration-150
              ${isSelected
                ? "border-orange-400 bg-gradient-to-br from-orange-50 to-amber-50 shadow-sm"
                : "border-slate-100 bg-white hover:border-orange-200 hover:bg-orange-50/40"
              }`}
          >
            {/* Selected indicator */}
            {isSelected && (
              <div className="absolute top-3 right-3 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}

            <div className="flex items-start gap-3 pr-6">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin size={14} className="text-orange-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900 text-sm leading-snug">
                  {house || line1 || `Address ${index + 1}`}
                </p>
                {(line1 && house) && <p className="text-xs text-slate-500 mt-0.5">{line1}</p>}
                {line2 && <p className="text-xs text-slate-400 mt-0.5 truncate">{line2}</p>}
                {country && <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">{country}</p>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};