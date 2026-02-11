import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  MapPin,
  ReceiptIndianRupee,
  UtensilsCrossed,
  Bike,
  Phone,
  User,
} from "lucide-react";

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

function formatStatus(value) {
  if (!value) return "Processing";
  return String(value)
    .trim()
    .replace(/_/g, "-")
    .split("-")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function getAddressLines(address) {
  if (!address) return [];
  if (typeof address === "string") return [address];
  if (
    typeof address.formattedAddress === "string" &&
    address.formattedAddress.trim()
  ) {
    return [address.formattedAddress];
  }

  const parts = [
    address.street,
    address.apartment,
    address.landmark,
    address.city,
    address.state,
    address.zipCode,
  ].filter((part) => typeof part === "string" && part.trim());

  if (parts.length === 0) return [];
  return [parts.join(", ")];
}

const OrderDetails = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { orders } = useSelector((state) => state.cart);

  const order = useMemo(() => {
    if (!orderId) return null;
    return orders.find((entry) => {
      const entryId = entry?._id || entry?.orderId;
      if (!entryId) return false;
      if (String(entryId) === String(orderId)) return true;
      return (
        String(entryId).slice(-6).toUpperCase() ===
        String(orderId).toUpperCase()
      );
    });
  }, [orderId, orders]);

  if (!order) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFBE9] to-orange-200 min-h-screen">
        <div className="relative mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-xs font-semibold text-orange-600 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={14} />
            Go back
          </button>

          <div className="mt-6 rounded-3xl border border-orange-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50">
              <UtensilsCrossed size={22} className="text-orange-500" />
            </div>
            <h1 className="mt-4 text-xl font-semibold text-slate-900">
              Order not found
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              We could not find this order in your account. Please check your
              order list and try again.
            </p>
            <button
              type="button"
              onClick={() => navigate("/account")}
              className="mt-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Back to Account
            </button>
          </div>
        </div>
      </section>
    );
  }

  const items = Array.isArray(order.orderItems) ? order.orderItems : [];
  const itemCount = items.reduce(
    (total, item) => total + (item?.quantity || 0),
    0,
  );
  const addressLines = getAddressLines(order.deliveryAddress[0]);
  const totalAmount = Number(order.totalAmount || 0);
  const subtotal = Number(order.subtotal || 0);
  const deliveryFee = Number(order.deliveryFee || 0);
  const discount = Number(order.discount || 0);
  const normalizedStatus = String(order.status || "")
    .trim()
    .toLowerCase();
  const isAccepted = ["accepted", "confirmed"].includes(normalizedStatus);
  const isOutForDelivery = [
    "out-for-delivery",
    "out for delivery",
    "out_for_delivery",
  ].includes(normalizedStatus);
  const rider = order.rider || order.deliveryPartner || {};
  const riderName = rider.name || rider.fullName || "Rider assigned";
  const riderPhone = rider.phone || rider.mobile || "Contact info pending";
  const riderVehicle = rider.vehicleNumber || rider.vehicle || "Bike";
  const riderEta = rider.eta || rider.estimatedArrival || null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFBE9] to-orange-200 min-h-screen">
      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-xs font-semibold text-orange-600 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={14} />
          Back to orders
        </button>

        <header className="mt-6 rounded-3xl border border-orange-100 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
                Order #
                {String(order._id || order.orderId || "ORDER")
                  .slice(-6)
                  .toUpperCase()}
              </p>
              <h1 className="mt-2 text-2xl font-serif font-semibold text-slate-900">
                {itemCount} items • ₹{totalAmount}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {formatOrderDate(order.createdAt)}
              </p>
            </div>
            <span className="rounded-full bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
              {formatStatus(order.status)}
            </span>
          </div>
          {(isAccepted || isOutForDelivery) && (
            <div className="mt-5 rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 via-white to-amber-50 p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <Bike size={18} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
                      Rider status
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {isOutForDelivery
                        ? "Rider on the way"
                        : "Rider will be assigned soon"}
                    </p>
                  </div>
                </div>
                {isOutForDelivery && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Live tracking
                  </span>
                )}
              </div>

              {isOutForDelivery ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-orange-100 bg-white p-3 shadow-sm">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <User size={14} />
                      Rider
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {riderName}
                    </p>
                  </div>
                  <div className="rounded-xl border border-orange-100 bg-white p-3 shadow-sm">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Phone size={14} />
                      Contact
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {riderPhone}
                    </p>
                  </div>
                  <div className="rounded-xl border border-orange-100 bg-white p-3 shadow-sm">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Bike size={14} />
                      Vehicle
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {riderVehicle}
                    </p>
                  </div>
                  {riderEta && (
                    <div className="sm:col-span-3 rounded-xl border border-amber-100 bg-amber-50/60 p-3 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                      ETA {riderEta}
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-600">
                  We are assigning the best rider for your order. You will see
                  live tracking once the rider is on the way.
                </p>
              )}
            </div>
          )}
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                  <UtensilsCrossed size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Ordered items
                  </h2>
                  <p className="text-xs text-slate-500">
                    {itemCount} items in this order
                  </p>
                </div>
              </div>

              <div className="mt-4 divide-y divide-slate-100 border-b border-slate-200 mb-4">
                {items.map((item, index) => (
                  <div
                    key={`${order._id || order.orderId}-item-${index}`}
                    className="flex items-center justify-between py-3 text-sm"
                  >
                    <div>
                      <p className="text-md font-semibold text-slate-900">
                        {item.name || "Item"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        ₹{item.price || 0} × {item.quantity || 0}
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      ₹{(item.price || 0) * (item.quantity || 0)}
                    </div>
                  </div>
                ))}
              </div>

              {order.notes && (
                <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Notes
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">{order.notes}</p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <ReceiptIndianRupee size={18} />
                </div>
                <div>
                  <h2 className="text-md font-semibold text-slate-900">
                    Payment summary
                  </h2>
                  <p className="text-xs text-slate-500">
                    Method: {order.paymentMethod || "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delivery fee</span>
                  <span>₹{deliveryFee}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Discount</span>
                  <span>-₹{discount}</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
                  <span>Total</span>
                  <span>₹{totalAmount}</span>
                </div>
              </div>

              {order.paymentStatus && (
                <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Payment {formatStatus(order.paymentStatus)}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                  <MapPin size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Delivery address
                  </h2>
                  <p className="text-xs text-slate-500">
                    Delivered to your saved address
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50/40 p-4 text-sm text-slate-700">
                {addressLines.length > 0 ? (
                  addressLines.map((line, index) => (
                    <p key={`address-line-${index}`}>{line}</p>
                  ))
                ) : (
                  <p>Address details not available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderDetails;
