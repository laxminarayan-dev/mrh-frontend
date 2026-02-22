import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  MapPin,
  UtensilsCrossed,
  Bike,
  Phone,
  User,
  Clock,
  CheckCircle,
  Package,
  AlertCircle,
  ShoppingBag,
  XCircle,
  Printer,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatOrderDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return {
    date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }),
    time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  };
}

function getAddressText(address) {
  if (!address) return null;
  if (typeof address === "string") return address;
  if (address.formattedAddress?.trim()) return address.formattedAddress.trim();
  return [address.street, address.apartment, address.landmark, address.city, address.state, address.zipCode]
    .filter(Boolean).join(", ") || null;
}

function normalizeStatus(raw) {
  return String(raw || "").trim().toLowerCase().replace(/[\s_]+/g, "-");
}

// ─── Status pipeline config ───────────────────────────────────────────────────
const PIPELINE = [
  { key: "placed", label: "Order Placed", icon: ShoppingBag },
  { key: "accepted", label: "Accepted", icon: CheckCircle },
  { key: "ready", label: "Ready for Pickup", icon: Package },
  { key: "out-for-delivery", label: "Out for Delivery", icon: Bike },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

const STATUS_META = {
  placed: { color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", dot: "bg-blue-500" },
  accepted: { color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200", dot: "bg-indigo-500" },
  ready: { color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500" },
  "out-for-delivery": { color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200", dot: "bg-purple-500" },
  delivered: { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500" },
  canceled: { color: "text-red-700", bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500" },
  rejected: { color: "text-red-700", bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500" },
};

function getStatusMeta(status) {
  return STATUS_META[status] || { color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", dot: "bg-slate-400" };
}

function formatStatusLabel(status) {
  const map = {
    placed: "Order Placed", accepted: "Accepted", ready: "Ready for Pickup",
    "out-for-delivery": "Out for Delivery", delivered: "Delivered",
    canceled: "Canceled", rejected: "Rejected",
  };
  return map[status] || String(status).replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusPipeline({ status }) {
  const isCanceled = ["canceled", "rejected"].includes(status);
  if (isCanceled) return null;

  const currentIdx = PIPELINE.findIndex(s => s.key === status);

  return (
    <div className="flex items-center gap-0 w-full">
      {PIPELINE.map((step, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
                ${done ? "bg-slate-800 border-slate-800 text-white" :
                  active ? "bg-white border-slate-800 text-slate-800" :
                    "bg-white border-slate-200 text-slate-300"}`}>
                <Icon size={14} />
              </div>
              <span className={`text-[10px] font-semibold uppercase tracking-wider text-center leading-tight max-w-[60px]
                ${done || active ? "text-slate-700" : "text-slate-300"}`}>
                {step.label}
              </span>
            </div>
            {idx < PIPELINE.length - 1 && (
              <div className={`flex-1 h-px mx-1 mb-5 transition-all ${done ? "bg-slate-800" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function RiderPanel({ status, rider }) {
  const norm = normalizeStatus(status);
  const riderName = rider?.name || rider?.fullName || null;
  const riderPhone = rider?.phone || rider?.mobile || null;
  const riderVehicle = rider?.vehicleNumber || rider?.vehicle || null;
  const riderEta = rider?.eta || rider?.estimatedArrival || null;

  // Between accepted and ready — rider not yet assigned
  if (norm === "accepted") {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
            <Bike size={16} className="text-slate-400" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Delivery Partner</p>
            <p className="text-sm font-semibold text-slate-700 mt-0.5">Rider will be assigned soon</p>
          </div>
          <div className="ml-auto flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500 leading-relaxed border-t border-slate-200 pt-3">
          Your order is confirmed. We are assigning the nearest available delivery partner.
        </p>
      </div>
    );
  }

  // Ready — rider being assigned
  if (norm === "ready") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center">
            <Bike size={16} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">Delivery Partner</p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">Order ready — assigning rider</p>
          </div>
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-100 border border-amber-200 rounded-full px-2 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending
          </span>
        </div>
        <p className="mt-3 text-xs text-slate-600 leading-relaxed border-t border-amber-100 pt-3">
          Your food is packed and ready. A rider is being assigned and will pick up shortly.
        </p>
      </div>
    );
  }

  // Out for delivery — show full rider card
  if (norm === "out-for-delivery") {
    return (
      <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center">
              <Bike size={16} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-purple-600">Delivery Partner</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">On the way to you</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-purple-700 bg-purple-100 border border-purple-200 rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            Live
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-purple-100 pt-4">
          {riderName && (
            <div className="rounded-lg bg-white border border-purple-100 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
                <User size={10} /> Rider
              </div>
              <p className="text-sm font-semibold text-slate-900">{riderName}</p>
            </div>
          )}
          {riderPhone && (
            <div className="rounded-lg bg-white border border-purple-100 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
                <Phone size={10} /> Contact
              </div>
              <a href={`tel:${riderPhone}`} className="text-sm font-semibold text-purple-700 hover:underline">{riderPhone}</a>
            </div>
          )}
          {riderVehicle && (
            <div className="rounded-lg bg-white border border-purple-100 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
                <Bike size={10} /> Vehicle
              </div>
              <p className="text-sm font-semibold text-slate-900">{riderVehicle}</p>
            </div>
          )}
          {riderEta && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-amber-600 mb-1">
                <Clock size={10} /> ETA
              </div>
              <p className="text-sm font-semibold text-slate-900">{riderEta}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Delivered — show who delivered
  if (norm === "delivered" && riderName) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center">
            <CheckCircle size={16} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Delivered by</p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">{riderName}</p>
          </div>
          {riderPhone && (
            <a href={`tel:${riderPhone}`} className="ml-auto text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1">
              <Phone size={11} /> {riderPhone}
            </a>
          )}
        </div>
      </div>
    );
  }

  return null;
}

function CanceledBanner({ status }) {
  const isCanceled = ["canceled", "rejected"].includes(status);
  if (!isCanceled) return null;

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
      <XCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-red-800 capitalize">{status === "rejected" ? "Order Rejected" : "Order Canceled"}</p>
        <p className="text-xs text-red-600 mt-0.5 leading-relaxed">
          {status === "rejected"
            ? "The restaurant was unable to accept your order. You will receive a full refund if payment was made."
            : "This order has been canceled. If you were charged, a refund will be processed within 3–5 business days."}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const OrderDetails = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { orders } = useSelector((s) => s.cart);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    const found = orders.find((e) => {
      const id = e?._id;
      if (!id) return false;
      return String(id) === String(orderId) ||
        String(id).slice(-6).toUpperCase() === String(orderId).toUpperCase();
    });
    setOrder(found || null);
  }, [orderId, orders]);

  // ── Not found ──
  if (!order) {
    return (
      <section className="min-h-screen bg-[#F8F7F4]">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <UtensilsCrossed size={32} className="text-slate-300 mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-slate-800">Order not found</h1>
          <p className="text-sm text-slate-500 mt-2 mb-6">We couldn't locate this order in your account.</p>
          <button onClick={() => navigate("/account")}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors">
            <ArrowLeft size={14} /> Back to Account
          </button>
        </div>
      </section>
    );
  }

  // ── Data ──
  const items = Array.isArray(order.orderItems) ? order.orderItems : [];
  const itemCount = items.reduce((t, i) => t + (i?.quantity || 0), 0);
  const addressText = getAddressText(order.deliveryAddress?.[0] || order.deliveryAddress);
  const totalAmount = Number(order.totalAmount || 0);
  const tax = Number(order.tax || 0);
  const subtotal = Number(order.subtotal || totalAmount);
  const deliveryFee = Number(order.deliveryFee || 0);
  const discount = Number(order.discount || 0);
  const status = normalizeStatus(order.status);
  const meta = getStatusMeta(status);
  const statusLabel = formatStatusLabel(status);
  const rider = order.rider || order.riderInfo || order.deliveryPartner || {};
  const invoiceNo = String(order._id || order.orderId || "").slice(-8).toUpperCase();
  const dateTime = formatOrderDate(order.createdAt);

  return (
    <section className="min-h-screen bg-[#F8F7F4]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={13} /> Back
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Printer size={13} /> Print Invoice
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">

          {/* ── Left: Invoice panel ── */}
          <div className="space-y-4">

            {/* Invoice header */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              {/* Dark header strip */}
              <div className="bg-slate-900 px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Tax Invoice</p>
                  <h1 className="text-2xl font-bold text-white tracking-tight">#{invoiceNo}</h1>
                  {dateTime && (
                    <p className="text-xs text-slate-400 mt-1">{dateTime.date} at {dateTime.time}</p>
                  )}
                </div>
                <div className="text-left sm:text-right">
                  <span className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-widest border ${meta.bg} ${meta.color} ${meta.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${meta.dot}`} />
                    {statusLabel}
                  </span>
                  <p className="text-xs text-slate-400 mt-2">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
                </div>
              </div>

              {/* Progress pipeline */}
              {!["canceled", "rejected"].includes(status) && (
                <div className="px-6 py-5 border-b border-slate-100">
                  <StatusPipeline status={status} />
                </div>
              )}

              {/* Canceled / Rejected banner */}
              {["canceled", "rejected"].includes(status) && (
                <div className="px-6 py-4 border-b border-slate-100">
                  <CanceledBanner status={status} />
                </div>
              )}

              {/* Delivery address */}
              <div className="px-6 py-5 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <MapPin size={15} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Delivery Address</p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {addressText || "Address not available"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rider panel */}
              {["accepted", "ready", "out-for-delivery", "delivered"].includes(status) && (
                <div className="px-6 py-5">
                  <RiderPanel status={status} rider={rider} />
                </div>
              )}
            </div>

            {/* Items table */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Order Items</h2>
                <span className="text-xs text-slate-400">{itemCount} items</span>
              </div>

              {/* Table head */}
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-2.5 bg-slate-50 border-b border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Item</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Qty</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Amount</p>
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-3.5 items-center">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.name || "Item"}</p>
                      <p className="text-xs text-slate-400 mt-0.5">₹{item.price || 0} per unit</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 text-center w-8">×{item.quantity || 0}</p>
                    <p className="text-sm font-bold text-slate-900 text-right">₹{(item.price || 0) * (item.quantity || 0)}</p>
                  </div>
                ))}
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="px-6 py-4 bg-amber-50 border-t border-amber-100">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">Order Note</p>
                  <p className="text-sm text-slate-700">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Payment summary ── */}
          <div className="space-y-4">

            {/* Summary card */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Payment Summary</h2>
              </div>

              <div className="px-5 py-4 space-y-3">
                {[
                  { label: "Subtotal", value: `₹${subtotal}` },
                  { label: "Delivery Fee", value: deliveryFee > 0 ? `₹${deliveryFee}` : "Free" },
                  ...(tax > 0 ? [{ label: "Tax & Charges", value: `₹${tax}` }] : []),
                  ...(discount > 0 ? [{ label: "Discount", value: `-₹${discount}`, highlight: true }] : []),
                ].map(({ label, value, highlight }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">{label}</span>
                    <span className={`text-sm font-semibold ${highlight ? "text-emerald-600" : "text-slate-800"}`}>{value}</span>
                  </div>
                ))}

                <div className="border-t border-slate-200 pt-3 mt-1 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">Total</span>
                  <span className="text-lg font-bold text-slate-900">₹{totalAmount}</span>
                </div>
              </div>

              {/* Payment method + status */}
              <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Payment Method</span>
                  <span className="text-xs font-bold text-slate-800">{order.paymentMethod || "N/A"}</span>
                </div>
                {order.paymentStatus && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Payment Status</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest rounded-full px-2 py-0.5 border
                      ${order.paymentStatus.toLowerCase() === "paid"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Help card */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={14} className="text-slate-400" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Need Help?</p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                For issues with this order, please contact the restaurant or reach our support team with your order number <span className="font-semibold text-slate-700">#{invoiceNo}</span>.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderDetails;