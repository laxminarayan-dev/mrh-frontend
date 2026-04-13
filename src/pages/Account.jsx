import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, setTempAddress } from "../store/authSlice";
import { useEffect, useState } from "react";
import { fetchCartItems } from "../store/cartSlice";
import { setDeliveryShop } from "../store/shopSlice";
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
  AlertCircle,
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import { getDistanceKm } from "../components/Direction";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatOrderDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (isNaN(date.getTime())) return String(value);
  return `${date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} • ${date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
}

const STATUS_STYLES = {
  placed: {
    cls: "bg-blue-100 text-blue-700 border border-blue-500",
    icon: ShoppingBag,
  },
  accepted: {
    cls: "bg-emerald-100 text-emerald-700 border border-emerald-500",
    icon: Package,
  },
  // ready: {
  //   cls: "bg-amber-100 text-amber-700 border border-amber-500",
  //   icon: Package,
  // },
  delivered: {
    cls: "bg-emerald-100 text-emerald-700 border border-emerald-500",
    icon: CheckCircle2,
  },
  out_for_delivery: {
    cls: "bg-purple-100 text-purple-700 border border-purple-500",
    icon: Package,
  },
  "out-for-delivery": {
    cls: "bg-purple-100 text-purple-700 border border-purple-500",
    icon: Package,
  },
  canceled: {
    cls: "bg-red-100 text-red-600 border border-red-500",
    icon: Clock,
  },
  rejected: {
    cls: "bg-red-100 text-red-600 border border-red-500",
    icon: Clock,
  },
};

function getStatusStyle(status) {
  return (
    STATUS_STYLES[status?.toLowerCase()] || {
      cls: "bg-slate-100 text-slate-600",
      icon: Clock,
    }
  );
}

function getDisplayStatus(status) {
  const normalized = String(status || "").toLowerCase();
  return normalized === "ready" ? "accepted" : normalized;
}

// ─── Skeleton loaders ─────────────────────────────────────────────────────────
function OrderSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-orange-100 bg-white p-4 space-y-3">
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
  const { shopsData } = useSelector((state) => state.shop);

  const [accuracy, setAccuracy] = useState(null);
  const [newAddress, setNewAddress] = useState("");
  const [coords, setCoords] = useState(null);
  const [isAlreadySaved, setIsAlreadySaved] = useState(false);
  const [addressList, setAddressList] = useState([]);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [ordersReady, setOrdersReady] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false);

  const profile = {
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  };

  const initials =
    profile.fullName
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2) || "U";

  // ── Fix: fetch orders on mount if not loaded ──────────────────────────────
  useEffect(() => {
    if (!user) return;
    if (!orders.length && !loadingOrders) {
      dispatch(fetchCartItems());
    }
  }, [user, dispatch]);

  // ── Mark orders ready after initial load ────────────────────────────────────
  useEffect(() => {
    if (!loadingOrders) {
      setOrdersReady(true);
    }
  }, [loadingOrders]);

  // ── Hydrate address list ──────────────────────────────────────────────────
  useEffect(() => {
    const next = (user?.addresses || []).map((a) => ({
      _id: a._id,
      coordinates: a.coordinates || [0, 0],
      formattedAddress: a.formattedAddress || "",
      isDefault: a.isDefault || false,
    }));
    setAddressList(next);
    if (next.length > 0) {
      setSelectedAddressId(next[0]._id);
    }
  }, [user]);

  const showOrderSkeleton = loadingOrders || !ordersReady;

  // ── Helper: Verify if a shop is available for address ──────────────────────
  const verifyShopAvailability = (coordinates) => {
    const DELIVERY_RANGE_KM = 3;
    const shopMarkers = Array.isArray(shopsData)
      ? shopsData
      : (shopsData?.shops ?? []);

    const shops = shopMarkers
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

    if (!shops.length) {
      setAlertMessage("No restaurants available at this moment.");
      setShowAlert(true);
      return false;
    }

    const nearest = shops.reduce((closest, shop) => {
      const distance = getDistanceKm(coordinates, shop.position);
      return distance < (closest.distance || Infinity)
        ? { shop, distance }
        : closest;
    }, {});

    if (!nearest.shop) {
      setAlertMessage(
        "No restaurants available in your area. Please try another location.",
      );
      setShowAlert(true);
      return false;
    }

    const shopRange = nearest.shop.shopDeliveryRange || DELIVERY_RANGE_KM;
    if (nearest.distance > shopRange) {
      setAlertMessage(
        `Sorry, the nearest restaurant is ${nearest.distance.toFixed(1)}km away. Delivery range is ${shopRange}km. Please choose another address.`,
      );
      setShowAlert(true);
      return false;
    }

    // Address is valid - set shop
    dispatch(setDeliveryShop(nearest.shop));
    return true;
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#FFFBE9] to-orange-50">
      {/* Alert Modal for Address Verification */}
      {showAlert && alertMessage && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[90vw] max-w-[420px] bg-white rounded-2xl p-6 shadow-2xl">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-50 to-orange-50 rounded-full flex items-center justify-center flex-shrink-0 border border-red-200">
                <AlertCircle size={24} className="text-red-500" />
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-lg font-bold text-gray-900">
                  Delivery Not Available
                </h3>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              {alertMessage}
            </p>
            <button
              onClick={() => {
                setShowAlert(false);
                setAlertMessage(null);
              }}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg transition-all shadow-lg"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* ── Header ── */}
        <div className="mb-8 rounded-xl bg-white border border-orange-100 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-xl tracking-[2px] bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white text-xl font-bold shadow-md">
                {initials}
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-orange-500">
                  Account
                </p>
                <h1 className="text-2xl font-bold text-slate-900">
                  {profile.fullName || "Your Account"}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  {orders.length} orders
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                dispatch(logout());
                navigate("/auth/login", { replace: true });
              }}
              className="self-start sm:self-auto inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-600 transition-all"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        {/* ── Personal Info ── */}
        <div className="mb-6 rounded-xl bg-white border border-orange-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <User size={16} className="text-orange-400" /> Personal Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: User, label: "Full Name", value: profile.fullName },
              { icon: Mail, label: "Email", value: profile.email },
              {
                icon: Phone,
                label: "Phone",
                value: profile.phone ? `+91 ${profile.phone}` : "—",
              },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  {label}
                </p>
                <p className="text-sm font-medium text-slate-800 mt-1 truncate">
                  {value || "—"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Addresses Dropdown ── */}
        <div className="mb-6 rounded-xl bg-white border border-orange-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-orange-400" /> Delivery Address
          </h2>

          {addressList.length > 0 ? (
            <div className="relative">
              <button
                onClick={() => setIsAddressDropdownOpen(!isAddressDropdownOpen)}
                className="w-full flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-left hover:border-orange-300 transition-colors"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase">
                    {selectedAddressId &&
                    addressList.find((a) => a._id === selectedAddressId)
                      ?.isDefault
                      ? "Default Address"
                      : "Selected Address"}
                  </p>
                  <p className="text-sm font-medium text-slate-800 mt-1 line-clamp-1">
                    {selectedAddressId
                      ? addressList.find((a) => a._id === selectedAddressId)
                          ?.formattedAddress
                      : "Select an address"}
                  </p>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-orange-500 transition-transform ${
                    isAddressDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isAddressDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-orange-100 rounded-lg shadow-lg z-50 overflow-hidden">
                  {addressList.map((addr) => (
                    <button
                      key={addr._id}
                      onClick={() => {
                        // Verify shop availability for this address
                        if (verifyShopAvailability(addr.coordinates)) {
                          setSelectedAddressId(addr._id);
                          dispatch(
                            setTempAddress({
                              formattedAddress: addr.formattedAddress,
                              coordinates: addr.coordinates,
                              saved: true,
                            }),
                          );
                          sessionStorage.setItem(
                            "userCoords",
                            JSON.stringify(addr.coordinates),
                          );
                          sessionStorage.setItem("locationChoice", "saved");
                          sessionStorage.setItem(
                            "locationChoiceTime",
                            Date.now(),
                          );
                        }
                        setIsAddressDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 border-b last:border-0 transition-colors ${
                        selectedAddressId === addr._id
                          ? "bg-orange-50 border-l-4 border-l-orange-500"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <p className="text-xs font-semibold text-slate-400 uppercase">
                        {addr.isDefault ? "✓ Default" : "Address"}
                      </p>
                      <p className="text-sm text-slate-800 mt-1">
                        {addr.formattedAddress}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-orange-200 bg-orange-50 p-4 text-center">
              <MapPin size={20} className="mx-auto text-orange-400 mb-2" />
              <p className="text-sm font-medium text-slate-700">
                No addresses saved
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Add your first delivery address to get started
              </p>
            </div>
          )}
        </div>

        {/* ── Quick Actions ── */}
        <div className="mb-6 rounded-xl bg-white border border-orange-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <ShoppingBag size={16} className="text-orange-400" /> Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/account/orders")}
              className="rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 hover:border-orange-400 hover:shadow-lg transition-all p-6 text-left group"
            >
              <div className="flex items-center justify-between mb-3">
                <ShoppingBag size={24} className="text-orange-500" />
                <ChevronRight
                  size={18}
                  className="text-orange-400 group-hover:translate-x-1 transition-transform"
                />
              </div>
              <h3 className="font-semibold text-slate-900">My Orders</h3>
              <p className="text-sm text-slate-600 mt-1">
                Track and manage your orders
              </p>
            </button>

            <button
              onClick={() => navigate("/account/inquiries")}
              className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 hover:border-blue-400 hover:shadow-lg transition-all p-6 text-left group"
            >
              <div className="flex items-center justify-between mb-3">
                <HelpCircle size={24} className="text-blue-500" />
                <ChevronRight
                  size={18}
                  className="text-blue-400 group-hover:translate-x-1 transition-transform"
                />
              </div>
              <h3 className="font-semibold text-slate-900">My Inquiries</h3>
              <p className="text-sm text-slate-600 mt-1">
                View your submitted inquiries
              </p>
            </button>
          </div>
        </div>

        {/* ── Order History ── */}
        <div className="rounded-xl bg-white border border-orange-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <ShoppingBag size={16} className="text-orange-400" /> Recent Orders
          </h2>

          <div className="space-y-3">
            {showOrderSkeleton ? (
              <>
                <OrderSkeleton />
                <OrderSkeleton />
              </>
            ) : orders.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/50 p-8 text-center">
                <UtensilsCrossed
                  size={24}
                  className="mx-auto text-orange-400 mb-2"
                />
                <h3 className="font-semibold text-slate-800">No orders yet</h3>
                <p className="text-sm text-slate-500 mt-1 mb-4">
                  Your first order is just a few clicks away
                </p>
                <button
                  onClick={() => navigate("/menu")}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2 text-sm font-semibold text-white hover:shadow-md transition-all"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {[...orders]
                  .reverse()
                  .slice(0, 5)
                  .map((order) => {
                    const id = order?._id || order?.orderId || "";
                    const shortId =
                      typeof id === "string"
                        ? id.slice(-6).toUpperCase()
                        : "ORDER";
                    const displayStatus = getDisplayStatus(order.status);
                    const { cls, icon: StatusIcon } =
                      getStatusStyle(displayStatus);

                    return (
                      <button
                        key={order._id || shortId}
                        type="button"
                        onClick={() => id && navigate(`/orders/${id}`)}
                        className="w-full text-left rounded-lg border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-200 p-4 transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500">
                              #{shortId}
                            </p>
                            <p className="text-sm font-medium text-slate-900 mt-1">
                              ₹{order.totalAmount}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {formatOrderDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${cls}`}
                            >
                              <StatusIcon size={10} />
                              {displayStatus || "Processing"}
                            </span>
                            <ChevronRight
                              size={16}
                              className="text-slate-400 group-hover:text-orange-500 transition-colors"
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Account;

// ─── Exported helpers ─────────────────────────────────────────────────────────
export const ListAddresses = ({
  onChekout = false,
  addressList = [],
  newAddress = null,
  isAlreadySaved = null,
  tempAddress = null,
  setSelectedAddress = () => {},
  selectedAddress = null,
  shopsData = [],
  showAlert = false,
  setShowAlert = () => {},
  alertMessage = null,
  setAlertMessage = () => {},
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const DELIVERY_RANGE_KM = 3;

  // Get shop markers
  const shopMarkers = Array.isArray(shopsData)
    ? shopsData
    : (shopsData?.shops ?? []);

  const shops = shopMarkers
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

  if (!addressList.length && !newAddress) {
    return (
      <div className="rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/40 p-6 text-center">
        <div className="mx-auto w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-3">
          <MapPin size={18} className="text-orange-500" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1">
          No addresses saved
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          Add your first delivery address to get started.
        </p>
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

  return <div className="space-y-3" />;
};
