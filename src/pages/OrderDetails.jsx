import { memo, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
  CircleOff,
  Star,
  Send,
} from "lucide-react";
import ConfirmOrderCancel from "../components/ConfirmOrderCancel";
import { cancelOrder, addReview } from "../store/cartSlice";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function capitalizeWords(text) {
  return text.replace(/\b\w/g, char => char.toUpperCase());
}


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

const PIPELINE = [
  { key: "placed", label: "Order Placed", icon: ShoppingBag },
  { key: "accepted", label: "Accepted", icon: CheckCircle },
  { key: "ready", label: "Ready for Pickup", icon: Package },
  { key: "out-for-delivery", label: "Out for Delivery", icon: Bike },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

const STATUS_META = {
  placed: { color: "text-blue-700", bg: "bg-blue-100", border: "border-blue-200", dot: "bg-blue-500" },
  accepted: { color: "text-emerald-700", bg: "bg-emerald-100", border: "border-green-200", dot: "bg-green-500" },
  ready: { color: "text-amber-700", bg: "bg-amber-100", border: "border-amber-200", dot: "bg-amber-500" },
  "out-for-delivery": { color: "text-purple-700", bg: "bg-purple-100", border: "border-purple-200", dot: "bg-purple-500" },
  "out_for_delivery": { color: "text-purple-700", bg: "bg-purple-100", border: "border-purple-200", dot: "bg-purple-500" },
  delivered: { color: "text-emerald-700", bg: "bg-emerald-100", border: "border-emerald-200", dot: "bg-emerald-500" },
  canceled: { color: "text-red-700", bg: "bg-red-100", border: "border-red-200", dot: "bg-red-500" },
  rejected: { color: "text-red-700", bg: "bg-red-100", border: "border-red-200", dot: "bg-red-500" },
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

// ─── Sub-components (screen only) ─────────────────────────────────────────────
function StatusPipeline({ status }) {
  const isCanceled = ["canceled", "rejected"].includes(status);
  if (isCanceled) return null;
  const currentIdx = PIPELINE.findIndex(s => s.key === status);
  return (
    <div className="flex items-center gap-0 w-full">
      {PIPELINE.map((step, idx) => {
        const done = currentIdx === 4 ? true : idx < currentIdx;
        const active = currentIdx !== 4 && idx === currentIdx;
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
  const riderName = rider?.name || rider?.fullName || "Rajesh Kumar";
  const riderPhone = rider?.phone || rider?.mobile || "9876543210";
  const riderVehicle = rider?.vehicleNumber || rider?.vehicle || "bike";
  const riderEta = rider?.eta || rider?.estimatedArrival || "10 mins";

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
      </div>
    );
  }
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
        </div>
      </div>
    );
  }
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
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" /> Live
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 border-t border-purple-100 pt-4">
          {riderName && (
            <div className="rounded-lg bg-white border border-purple-300 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1"><User size={10} /> Rider</div>
              <p className="text-sm font-semibold text-slate-900">{riderName}</p>
            </div>
          )}
          {riderPhone && (
            <div className="rounded-lg bg-white border border-purple-300 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1"><Phone size={10} /> Contact</div>
              <a href={`tel:${riderPhone}`} className="text-sm font-semibold text-purple-700 hover:underline">{riderPhone}</a>
            </div>
          )}
          {riderVehicle && (
            <div className="rounded-lg bg-white border border-purple-300 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1"><Bike size={10} /> Vehicle</div>
              <p className="text-sm font-semibold text-slate-900">{riderVehicle}</p>
            </div>
          )}
          {riderEta && (
            <div className="rounded-lg bg-amber-50 border border-amber-300 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-amber-600 mb-1"><Clock size={10} /> ETA</div>
              <p className="text-sm font-semibold text-slate-900">{riderEta}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
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
  if (!["canceled", "rejected"].includes(status)) return null;
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
      <XCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-red-600 capitalize">{status === "rejected" ? "Order Rejected" : "Order Canceled"}</p>
        <p className="text-xs text-red-600 mt-0.5 leading-relaxed">
          {status === "rejected"
            ? "The restaurant was unable to accept your order. You will receive a full refund if payment was made."
            : "You have canceled this order. If you were charged, a refund will be processed within 3–5 business days."}
        </p>
      </div>
    </div>
  );
}

// ─── Print Invoice (only visible when printing) ───────────────────────────────

// Review Panel (delivered orders only)
function ReviewPanel({ order }) {
  const dispatch = useDispatch();
  const [hovered, setHovered] = useState(0);
  const [rating, setRating] = useState(order?.review?.rating || 0);
  const [comment, setComment] = useState(order?.review?.comment || "");
  const [submitted, setSubmitted] = useState(order?.review?.submitted || false);
  const [submitting, setSubmitting] = useState(false);
  const LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

  useEffect(() => {
    if (order?.review?.submitted) {
      setRating(order.review.rating || 0);
      setComment(order.review.comment || "");
      setSubmitted(true);
    }
  }, [order]);

  const handleSubmit = () => {
    if (!rating) return;
    setSubmitting(true);
    dispatch(addReview({ ...order, review: { rating, comment } }));
    setTimeout(() => {
      setSubmitting(false);
    }, 800);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 flex flex-col items-center gap-3 text-center">
        <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <CheckCircle size={20} className="text-emerald-500" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">Thanks for your feedback!</p>
          <p className="text-xs text-slate-400 mt-1">Your review helps us improve.</p>
        </div>
        <div className="flex  items-center gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={16}
              className={s <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}
            />
          ))}
        </div>
        {comment && (
          <p className="text-xs text-slate-500 italic mt-2">"{capitalizeWords(comment)}"</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <Star size={14} className="text-amber-400 fill-amber-400" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Rate Your Order</h2>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Star selector */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(s)}
                className="transition-transform hover:scale-110 active:scale-95"
                aria-label={`Rate ${s} star`}
              >
                <Star
                  size={28}
                  className={`transition-colors duration-100 ${s <= (hovered || rating)
                    ? "text-amber-400 fill-amber-400"
                    : "text-slate-200 fill-slate-200"
                    }`}
                />
              </button>
            ))}
          </div>
          <span className={`text-xs font-semibold transition-all duration-150 ${rating ? "text-amber-500" : "text-slate-300"}`}>
            {LABELS[hovered || rating] || "Tap to rate"}
          </span>
        </div>

        {/* Comment box */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Tell us about your experience... "
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-700 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-all"
        />

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!rating || !comment.trim() || submitting}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2.5 text-[14px]  font-light text-white transition-all"
        >
          {!rating ? "Please select a rating" : !comment.trim() ? "Please add a comment" : submitting ? (
            <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
          ) : (
            <><Send size={13} /> Submit Review</>
          )}
        </button>
      </div>
    </div>
  );
}

function PrintInvoice({ order, items, invoiceNo, dateTime, addressText, totalAmount, subtotal, tax, deliveryFee, discount, statusLabel }) {
  return (
    <div id="print-invoice">
      <style>{`
        @media print {
          /* Hide the entire React root */
          body * { visibility: hidden; }

          /* Show only the invoice and everything inside it */
          #print-invoice,
          #print-invoice * { visibility: visible; }

          /* Pull invoice to top-left of the page */
          #print-invoice {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
          }

          @page {
            size: A4;
            margin: 12mm 14mm;
          }
        }

        /* On screen: hide the print invoice entirely */
        @media screen {
          #print-invoice { display: none; }
        }
      `}</style>

      {/* ── Invoice layout ── */}
      <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: "11px", color: "#111", lineHeight: "1.5", maxWidth: "680px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #111", paddingBottom: "12px", marginBottom: "16px" }}>
          <div>
            <div style={{ fontSize: "20px", fontWeight: "700", letterSpacing: "-0.5px" }}>TAX INVOICE</div>
            <div style={{ fontSize: "11px", color: "#555", marginTop: "3px" }}>
              {dateTime ? `${dateTime.date} at ${dateTime.time}` : "—"}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "13px", fontWeight: "700" }}>Order #{invoiceNo}</div>
            <div style={{ fontSize: "10px", color: "#555", marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Status: {statusLabel}
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div style={{ display: "flex", gap: "40px", marginBottom: "20px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "9px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.12em", color: "#888", marginBottom: "4px" }}>Delivery Address</div>
            <div style={{ fontSize: "11px", color: "#111" }}>{addressText || "Not provided"}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "9px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.12em", color: "#888", marginBottom: "4px" }}>Payment Method</div>
            <div style={{ fontSize: "11px", color: "#111" }}>{order.paymentMethod || "N/A"}</div>
          </div>
        </div>

        {/* Items table */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "0" }}>
          <thead>
            <tr style={{ borderTop: "1px solid #ddd", borderBottom: "1px solid #ddd" }}>
              <th style={{ textAlign: "left", padding: "6px 0", fontSize: "9px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: "#888" }}>#</th>
              <th style={{ textAlign: "left", padding: "6px 8px", fontSize: "9px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: "#888" }}>Item</th>
              <th style={{ textAlign: "center", padding: "6px 8px", fontSize: "9px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: "#888" }}>Qty</th>
              <th style={{ textAlign: "right", padding: "6px 8px", fontSize: "9px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: "#888" }}>Unit Price</th>
              <th style={{ textAlign: "right", padding: "6px 0", fontSize: "9px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: "#888" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "8px 0", fontSize: "11px", color: "#888" }}>{idx + 1}</td>
                <td style={{ padding: "8px 8px", fontSize: "11px", fontWeight: "600" }}>{item.name || "Item"}</td>
                <td style={{ padding: "8px 8px", fontSize: "11px", textAlign: "center" }}>{item.quantity || 0}</td>
                <td style={{ padding: "8px 8px", fontSize: "11px", textAlign: "right", color: "#555" }}>₹{item.price || 0}</td>
                <td style={{ padding: "8px 0", fontSize: "11px", fontWeight: "600", textAlign: "right" }}>₹{(item.price || 0) * (item.quantity || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ marginLeft: "auto", width: "220px", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #ddd" }}>
          {[
            { label: "Subtotal", value: `₹${subtotal}` },
            { label: "Delivery Fee", value: deliveryFee > 0 ? `₹${deliveryFee}` : "Free" },
            ...(tax > 0 ? [{ label: "Tax & Charges", value: `₹${tax}` }] : []),
            ...(discount > 0 ? [{ label: "Discount", value: `-₹${discount}` }] : []),
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "11px", color: "#555" }}>
              <span>{label}</span><span>{value}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #111", paddingTop: "8px", marginTop: "6px", fontSize: "13px", fontWeight: "700" }}>
            <span>TOTAL</span><span>₹{totalAmount}</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid #ddd", marginTop: "28px", paddingTop: "10px", display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#aaa" }}>
          <span>Generated on {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</span>
          <span>Order #{invoiceNo} — Thank you for your order!</span>
        </div>
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
  const dispatch = useDispatch();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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

  if (!order) {
    return (
      <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <UtensilsCrossed size={32} className="text-slate-900 mx-auto mb-4" />
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
  const invoiceNo = String(order._id || order.orderId || "").slice(-6).toUpperCase();
  const dateTime = formatOrderDate(order.createdAt);

  const handleCancelOrder = () => setShowCancelConfirm(true);
  const confirmCancelOrder = () => {
    dispatch(cancelOrder(order)).unwrap()
      .then(() => setShowCancelConfirm(false))
      .catch(() => console.error("Failed to cancel order"));
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100">
      {/* ── Hidden print invoice (only appears on Ctrl+P) ── */}
      <PrintInvoice
        order={order}
        items={items}
        invoiceNo={invoiceNo}
        dateTime={dateTime}
        addressText={addressText}
        totalAmount={totalAmount}
        subtotal={subtotal}
        tax={tax}
        deliveryFee={deliveryFee}
        discount={discount}
        statusLabel={statusLabel}
      />

      {showCancelConfirm && (
        <ConfirmOrderCancel onConfirm={confirmCancelOrder} onCancel={() => setShowCancelConfirm(false)} />
      )}

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 transition-colors shadow-sm">
            <ArrowLeft size={13} /> Back
          </button>
          <div className="flex items-center gap-3">
            {order.status === "placed" && (
              <button onClick={handleCancelOrder}
                className="inline-flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors shadow-sm">
                <CircleOff size={13} /> Cancel Order
              </button>
            )}
            <button onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 transition-colors shadow-sm">
              <Printer size={13} /> Print Invoice
            </button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
          {/* ── Left ── */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-900 px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Tax Invoice</p>
                  <h1 className="text-2xl font-bold text-white tracking-tight">#{invoiceNo}</h1>
                  {dateTime && <p className="text-xs text-slate-400 mt-1">{dateTime.date} at {dateTime.time}</p>}
                </div>
                <div className="text-left sm:text-right">
                  <span className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-widest border ${meta.bg} ${meta.color} ${meta.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${meta.dot}`} />
                    {statusLabel}
                  </span>
                  <p className="text-xs text-slate-400 mt-2">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
                </div>
              </div>

              {!["canceled", "rejected"].includes(status) && (
                <div className="px-6 py-5 border-b border-slate-100">
                  <StatusPipeline status={status} />
                </div>
              )}

              {["canceled", "rejected"].includes(status) && (
                <div className="px-6 py-4 border-b border-slate-100">
                  <CanceledBanner status={status} />
                </div>
              )}

              <div className="px-6 py-5 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <MapPin size={15} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Delivery Address</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{addressText || "Address not available"}</p>
                  </div>
                </div>
              </div>

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
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-2.5 bg-slate-50 border-b border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Item</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Qty</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Amount</p>
              </div>
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
              {order.notes && (
                <div className="px-6 py-4 bg-amber-50 border-t border-amber-100">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">Order Note</p>
                  <p className="text-sm text-slate-700">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Right ── */}
          <div className="space-y-4">
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
              <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Payment Method</span>
                  <span className="text-xs font-bold text-slate-800">{order.paymentMethod?.toUpperCase() || "N/A"}</span>
                </div>
                {order.paymentStatus && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Payment Status</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest rounded-full px-2 py-0.5 border
                      ${order.paymentStatus.toLowerCase() === "paid"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-600 border-amber-300"}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Review panel — only for delivered orders */}
            {orders && status === "delivered" && (
              <ReviewPanel order={order} />
            )}

            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={14} className="text-slate-400" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Need Help?</p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                For issues with this order, contact us with order number <span className="font-semibold text-slate-700">#{invoiceNo}</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(OrderDetails);