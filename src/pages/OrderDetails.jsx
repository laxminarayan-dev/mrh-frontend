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
  ChevronRight,
  Zap,
  MessageCircle,
} from "lucide-react";
import ConfirmOrderCancel from "../components/ConfirmOrderCancel";
import { cancelOrder, addReview } from "../store/cartSlice";
import { socket } from "../socket";
import { getDistanceKm } from "../components/Direction";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function capitalizeWords(text) {
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatOrderDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return {
    date: d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  };
}

function getAddressText(address) {
  if (!address) return null;
  if (typeof address === "string") return address;
  if (address.formattedAddress?.trim()) return address.formattedAddress.trim();
  return (
    [
      address.street,
      address.apartment,
      address.landmark,
      address.city,
      address.state,
      address.zipCode,
    ]
      .filter(Boolean)
      .join(", ") || null
  );
}

function normalizeStatus(raw) {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");
}

function getDisplayStatus(raw) {
  const normalized = normalizeStatus(raw);
  return normalized === "ready" ? "accepted" : normalized;
}

function toLatLng(input) {
  if (!input) return null;
  if (Array.isArray(input) && input.length >= 2) {
    const a = Number(input[0]);
    const b = Number(input[1]);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
    if (Math.abs(a) <= 90 && Math.abs(b) <= 180) return [a, b];
    if (Math.abs(a) <= 180 && Math.abs(b) <= 90) return [b, a];
    return null;
  }
  if (typeof input === "object") {
    const lat = Number(input.lat ?? input.latitude);
    const lng = Number(input.lng ?? input.lon ?? input.long ?? input.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
    if (Array.isArray(input.coordinates)) return toLatLng(input.coordinates);
  }
  return null;
}

function getDeliveryCoords(order) {
  const rawAddress =
    order?.deliveryAddress?.[0] || order?.deliveryAddress || {};
  return (
    toLatLng(rawAddress?.coordinates) ||
    toLatLng(rawAddress?.location) ||
    toLatLng(rawAddress)
  );
}

function getRiderCoords(payload = {}) {
  return (
    toLatLng(payload?.location) ||
    toLatLng(payload?.riderLocation) ||
    toLatLng(payload?.coordinates) ||
    toLatLng(payload?.rider?.location) ||
    null
  );
}

function buildEtaLabel(distanceKm, speedKmph) {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) return null;
  const effectiveSpeed =
    Number.isFinite(speedKmph) && speedKmph >= 5 ? speedKmph : 20;
  const etaMinutes = Math.max(
    1,
    Math.round((distanceKm / effectiveSpeed) * 60),
  );
  return etaMinutes <= 1 ? "1 min" : `${etaMinutes} mins`;
}

const PIPELINE = [
  { key: "placed", label: "Placed", icon: ShoppingBag },
  { key: "accepted", label: "Accepted", icon: CheckCircle },
  { key: "assigned", label: "Rider Assigned", icon: Bike },
  { key: "out-for-delivery", label: "Out for Delivery", icon: Bike },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

// ─── STATUS CONFIG ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  placed: {
    label: "Order Placed",
    pill: "bg-blue-500/10 text-blue-600 border-blue-200",
    dot: "bg-blue-500",
  },
  accepted: {
    label: "Accepted",
    pill: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    dot: "bg-emerald-500",
  },
  assigned: {
    label: "Rider Assigned",
    pill: "bg-violet-500/10 text-violet-600 border-violet-200",
    dot: "bg-violet-500",
  },
  "out-for-delivery": {
    label: "Out for Delivery",
    pill: "bg-orange-500/10 text-orange-600 border-orange-200",
    dot: "bg-orange-500",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    pill: "bg-orange-500/10 text-orange-600 border-orange-200",
    dot: "bg-orange-500",
  },
  delivered: {
    label: "Delivered",
    pill: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    dot: "bg-emerald-500",
  },
  cancelled: {
    label: "Cancelled",
    pill: "bg-red-500/10 text-red-400 border-red-200",
    dot: "bg-red-400",
  },
  canceled: {
    label: "Cancelled",
    pill: "bg-red-500/10 text-red-400 border-red-200",
    dot: "bg-red-400",
  },
  rejected: {
    label: "Rejected",
    pill: "bg-red-500/10 text-red-400 border-red-200",
    dot: "bg-red-400",
  },
};

function getStatusConfig(status) {
  return (
    STATUS_CONFIG[status] || {
      label: capitalizeWords(status.replace(/-/g, " ")),
      pill: "bg-slate-100 text-slate-600 border-slate-200",
      dot: "bg-slate-400",
    }
  );
}

// ─── StatusPipeline ───────────────────────────────────────────────────────────
function StatusPipeline({ status }) {
  const isCanceled = ["canceled", "cancelled", "rejected"].includes(status);
  if (isCanceled) return null;
  const currentIdx = PIPELINE.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center w-full gap-0">
      {PIPELINE.map((step, idx) => {
        const done =
          currentIdx === PIPELINE.length - 1 ? true : idx < currentIdx;
        const active = currentIdx !== PIPELINE.length - 1 && idx === currentIdx;
        const Icon = step.icon;
        return (
          <div
            key={step.key}
            className="flex items-center flex-1 last:flex-none"
          >
            <div className="flex flex-col items-center gap-1 sm:gap-1.5 md:gap-2">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-2xl flex items-center justify-center transition-all duration-300
                  ${
                    done
                      ? "bg-slate-900 text-white shadow-sm shadow-slate-900/20"
                      : active
                        ? "bg-white border-2 border-slate-900 text-slate-900 shadow-sm"
                        : "bg-slate-100 text-slate-300 border border-slate-200"
                  }`}
              >
                <Icon size={12} className="sm:w-3.5 md:w-4" />
              </div>
              <span
                className={`text-[7px] sm:text-[8px] md:text-[9px] font-semibold uppercase tracking-widest text-center leading-tight max-w-[48px] sm:max-w-[54px]
                ${done || active ? "text-slate-700" : "text-slate-300"}`}
              >
                {step.label}
              </span>
            </div>
            {idx < PIPELINE.length - 1 && (
              <div
                className={`flex-1 h-px mx-0.5 sm:mx-0.75 md:mx-1 mb-3 sm:mb-4 md:mb-5 transition-all duration-500
                ${done ? "bg-slate-900" : "bg-slate-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── RiderPanel ──────────────────────────────────────────────────────────────
function RiderPanel({ status, rider }) {
  const norm = normalizeStatus(status);
  const riderName = rider?.name || rider?.fullName || "Rajesh Kumar";
  const riderPhone = rider?.phone || rider?.mobile || "9876543210";
  const riderVehicle =
    rider?.vehicleNumber || rider?.vehicle || "DL 5S BC 9234";
  const riderEta = rider?.eta || rider?.estimatedArrival || "10 mins";

  if (norm === "accepted") {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-2.5 sm:p-3 md:p-4">
        <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm flex-shrink-0">
            <Bike size={14} className="sm:w-4 md:w-4 text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Delivery Partner
            </p>
            <p className="text-xs sm:text-sm md:text-sm font-semibold text-slate-600 mt-0.5">
              Finding you a rider…
            </p>
          </div>
          <div className="flex gap-0.75 sm:gap-1 flex-shrink-0">
            {[0, 150, 300].map((d) => (
              <span
                key={d}
                className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                style={{ animationDelay: `${d}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (norm === "assigned" || norm === "out-for-delivery") {
    const isOFD = norm === "out-for-delivery";
    return (
      <div
        className={`rounded-2xl border p-4 ${isOFD ? "border-orange-200 bg-orange-50/40" : "border-violet-200 bg-violet-50/40"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2.5 sm:mb-3 md:mb-4 gap-2 sm:gap-2.5">
          <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 min-w-0">
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-2xl flex items-center justify-center border flex-shrink-0 ${isOFD ? "bg-orange-100 border-orange-200" : "bg-violet-100 border-violet-200"}`}
            >
              <Bike
                size={14}
                className={`sm:w-4 md:w-4 ${isOFD ? "text-orange-600" : "text-violet-600"}`}
              />
            </div>
            <div className="min-w-0">
              <p
                className={`text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${isOFD ? "text-orange-500" : "text-violet-500"}`}
              >
                Delivery Partner
              </p>
              <p className="text-xs sm:text-sm md:text-sm font-semibold text-slate-900 mt-0.5 truncate">
                {isOFD ? "On the way to you" : "Rider Assigned"}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-widest rounded-full px-2 sm:px-2.5 md:px-3 py-0.75 sm:py-1 border flex-shrink-0 whitespace-nowrap
            ${isOFD ? "bg-orange-100 text-orange-700 border-orange-200" : "bg-violet-100 text-violet-700 border-violet-200"}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full animate-pulse ${isOFD ? "bg-orange-500" : "bg-violet-500"}`}
            />
            {isOFD ? "Live" : "Assigned"}
          </span>
        </div>

        {/* Grid */}
        <div
          className={`grid grid-cols-2 gap-1.5 sm:gap-2 md:gap-2 border-t pt-2.5 sm:pt-3 md:pt-4 ${isOFD ? "border-orange-100" : "border-violet-100"}`}
        >
          {[
            { icon: User, label: "Rider", val: riderName, link: null },
            {
              icon: Phone,
              label: "Contact",
              val: riderPhone,
              link: `tel:${riderPhone}`,
            },
            { icon: Bike, label: "Vehicle", val: riderVehicle, link: null },
            {
              icon: Clock,
              label: "ETA",
              val: riderEta,
              link: null,
              isEta: true,
            },
          ].map(({ icon: Icon, label, val, link, isEta }) => (
            <div
              key={label}
              className={`rounded-xl bg-white border p-2 sm:p-2.5 md:p-3
              ${isEta ? "border-amber-200" : isOFD ? "border-orange-100" : "border-violet-100"}`}
            >
              <div
                className={`flex items-center gap-0.75 sm:gap-1 text-[8px] sm:text-[9px] md:text-[10px] font-semibold uppercase tracking-widest mb-0.5 sm:mb-1
                ${isEta ? "text-amber-500" : "text-slate-400"}`}
              >
                <Icon size={9} className="sm:w-2.5 md:w-3" /> {label}
              </div>
              {link ? (
                <a
                  href={link}
                  className={`text-xs sm:text-sm md:text-sm font-semibold hover:underline truncate ${isOFD ? "text-orange-700" : "text-violet-700"}`}
                >
                  {val}
                </a>
              ) : (
                <p
                  className={`text-xs sm:text-sm md:text-sm font-semibold truncate ${isEta ? "text-amber-700" : "text-slate-900"}`}
                >
                  {val}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (norm === "delivered" && riderName) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-2.5 sm:p-3 md:p-4 flex items-center gap-2 sm:gap-2.5 md:gap-3">
        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0">
          <CheckCircle size={14} className="sm:w-4 md:w-4 text-emerald-600" />
        </div>
        <div className="min-w-0">
          <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-emerald-600">
            Delivered by
          </p>
          <p className="text-xs sm:text-sm md:text-sm font-semibold text-slate-900 mt-0.5 truncate">
            {riderName}
          </p>
        </div>
      </div>
    );
  }
  return null;
}

// ─── CanceledBanner ───────────────────────────────────────────────────────────
function CanceledBanner({ status }) {
  if (!["canceled", "cancelled", "rejected"].includes(status)) return null;
  const isRejected = status === "rejected";
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-3 sm:p-4 md:p-5
      ${isRejected ? "border-red-200 bg-red-50/60" : "border-rose-200 bg-rose-50/60"}`}
    >
      <div className="flex items-start gap-2.5 sm:gap-3 md:gap-4">
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-2xl border flex items-center justify-center flex-shrink-0
          ${isRejected ? "bg-red-100 border-red-200 text-red-600" : "bg-rose-100 border-rose-200 text-rose-600"}`}
        >
          <XCircle size={16} className="sm:w-4 md:w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={`text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${isRejected ? "text-red-500" : "text-rose-500"}`}
          >
            Order Closed
          </p>
          <p className="text-xs sm:text-sm md:text-sm font-semibold text-slate-900 mt-1">
            {isRejected ? "Order Rejected by Restaurant" : "Order Cancelled"}
          </p>
          <p className="text-[9px] sm:text-xs md:text-xs text-slate-500 mt-1.5 sm:mt-2 leading-relaxed">
            {isRejected
              ? "The restaurant could not accept this order. Any successful payment will be fully refunded."
              : "This order was cancelled. If payment was completed, a refund has been initiated."}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── ReviewPanel ──────────────────────────────────────────────────────────────
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
    if (!rating || !comment.trim()) return;
    setSubmitting(true);
    dispatch(addReview({ ...order, review: { rating, comment } }));
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-3 sm:p-4 md:p-5 flex flex-col items-center gap-2.5 sm:gap-3 md:gap-3 text-center">
        <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
          <CheckCircle size={19} className="sm:w-5 md:w-6 text-emerald-500" />
        </div>
        <div>
          <p className="text-xs sm:text-sm md:text-sm font-bold text-slate-900">
            Thanks for your feedback!
          </p>
          <p className="text-[9px] sm:text-xs md:text-xs text-slate-400 mt-0.5 sm:mt-1">
            Your review helps us serve you better.
          </p>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={13}
              className={`sm:w-4 md:w-4 ${
                s <= rating
                  ? "text-amber-400 fill-amber-400"
                  : "text-slate-200 fill-slate-200"
              }`}
            />
          ))}
        </div>
        {comment && (
          <p className="text-[9px] sm:text-xs md:text-xs text-slate-500 italic bg-slate-50 rounded-xl px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 w-full truncate">
            "{capitalizeWords(comment)}"
          </p>
        )}
      </div>
    );
  }

  const activeLabel = LABELS[hovered || rating] || "Tap to rate";
  const canSubmit = !!rating && comment.trim().length > 0;

  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-3 sm:px-4 md:px-5 py-3 sm:py-3.5 md:py-4 border-b border-slate-100 flex items-center gap-1.5 sm:gap-2 md:gap-2.5">
        <div className="w-6 h-6 sm:w-6.5 sm:h-6.5 md:w-7 md:h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
          <Star
            size={11}
            className="sm:w-3 md:w-3.5 text-amber-400 fill-amber-400"
          />
        </div>
        <h2 className="text-[9px] sm:text-xs md:text-xs font-bold uppercase tracking-widest text-slate-500">
          Rate Your Order
        </h2>
      </div>

      <div className="px-3 sm:px-4 md:px-5 py-3 sm:py-4 md:py-5 space-y-3 sm:space-y-3.5 md:space-y-4">
        {/* Stars */}
        <div className="flex flex-col items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-0.75 sm:gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(s)}
                className="transition-all hover:scale-110 active:scale-95"
                aria-label={`Rate ${s} star`}
              >
                <Star
                  size={24}
                  className={`transition-colors duration-100 sm:w-7 md:w-8 ${
                    s <= (hovered || rating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-200 fill-slate-200"
                  }`}
                />
              </button>
            ))}
          </div>
          <span
            className={`text-[9px] sm:text-xs md:text-xs font-semibold transition-all ${rating ? "text-amber-500" : "text-slate-300"}`}
          >
            {activeLabel}
          </span>
        </div>

        {/* Comment */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Tell us about your experience…"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 sm:px-3 md:px-3.5 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-sm text-slate-700
            placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300
            focus:border-amber-300 transition-all leading-relaxed"
        />

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="w-full inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-slate-900
            hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed px-3 sm:px-4 md:px-4 py-2 sm:py-2.5 md:py-3
            text-xs sm:text-sm md:text-sm font-semibold text-white transition-all"
        >
          {submitting ? (
            <>
              <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting…
            </>
          ) : !rating ? (
            "Select a rating first"
          ) : !comment.trim() ? (
            "Add a comment to submit"
          ) : (
            <>
              <Send size={11} className="sm:w-3 md:w-3.5" /> Submit Review
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── PrintInvoice ─────────────────────────────────────────────────────────────
function PrintInvoice({
  order,
  items,
  invoiceNo,
  dateTime,
  addressText,
  totalAmount,
  subtotal,
  tax,
  deliveryFee,
  discount,
  statusLabel,
}) {
  return (
    <div id="print-invoice">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-invoice, #print-invoice * { visibility: visible; }
          #print-invoice { position: fixed; top: 0; left: 0; width: 100%; }
          @page { size: A4; margin: 12mm 14mm; }
        }
        @media screen { #print-invoice { display: none; } }
      `}</style>
      <div
        style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: "11px",
          color: "#111",
          lineHeight: "1.5",
          maxWidth: "680px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottom: "2px solid #111",
            paddingBottom: "12px",
            marginBottom: "16px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: "700",
                letterSpacing: "-0.5px",
              }}
            >
              TAX INVOICE
            </div>
            <div style={{ fontSize: "11px", color: "#555", marginTop: "3px" }}>
              {dateTime ? `${dateTime.date} at ${dateTime.time}` : "—"}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "13px", fontWeight: "700" }}>
              Order #{invoiceNo}
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "#555",
                marginTop: "3px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Status: {statusLabel}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "40px", marginBottom: "20px" }}>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "9px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "#888",
                marginBottom: "4px",
              }}
            >
              Delivery Address
            </div>
            <div style={{ fontSize: "11px", color: "#111" }}>
              {addressText || "Not provided"}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "9px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "#888",
                marginBottom: "4px",
              }}
            >
              Payment Method
            </div>
            <div style={{ fontSize: "11px", color: "#111" }}>
              {order.paymentMethod || "N/A"}
            </div>
          </div>
        </div>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "0",
          }}
        >
          <thead>
            <tr
              style={{
                borderTop: "1px solid #ddd",
                borderBottom: "1px solid #ddd",
              }}
            >
              {["#", "Item", "Qty", "Unit Price", "Amount"].map((h, i) => (
                <th
                  key={h}
                  style={{
                    textAlign:
                      i === 0
                        ? "left"
                        : i <= 1
                          ? "left"
                          : i === 2
                            ? "center"
                            : "right",
                    padding: "6px 8px",
                    fontSize: "9px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#888",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                <td
                  style={{
                    padding: "8px 8px",
                    fontSize: "11px",
                    color: "#888",
                  }}
                >
                  {idx + 1}
                </td>
                <td
                  style={{
                    padding: "8px 8px",
                    fontSize: "11px",
                    fontWeight: "600",
                  }}
                >
                  {item.name || "Item"}
                </td>
                <td
                  style={{
                    padding: "8px 8px",
                    fontSize: "11px",
                    textAlign: "center",
                  }}
                >
                  {item.quantity || 0}
                </td>
                <td
                  style={{
                    padding: "8px 8px",
                    fontSize: "11px",
                    textAlign: "right",
                    color: "#555",
                  }}
                >
                  ₹{item.price || 0}
                </td>
                <td
                  style={{
                    padding: "8px 8px",
                    fontSize: "11px",
                    fontWeight: "600",
                    textAlign: "right",
                  }}
                >
                  ₹{(item.price || 0) * (item.quantity || 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div
          style={{
            marginLeft: "auto",
            width: "220px",
            marginTop: "12px",
            paddingTop: "12px",
            borderTop: "1px solid #ddd",
          }}
        >
          {[
            { label: "Subtotal", value: `₹${subtotal}` },
            {
              label: "Delivery Fee",
              value: deliveryFee > 0 ? `₹${deliveryFee}` : "Free",
            },
            ...(tax > 0 ? [{ label: "Tax & Charges", value: `₹${tax}` }] : []),
            ...(discount > 0
              ? [{ label: "Discount", value: `-₹${discount}` }]
              : []),
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "5px",
                fontSize: "11px",
                color: "#555",
              }}
            >
              <span>{label}</span>
              <span>{value}</span>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: "2px solid #111",
              paddingTop: "8px",
              marginTop: "6px",
              fontSize: "13px",
              fontWeight: "700",
            }}
          >
            <span>TOTAL</span>
            <span>₹{totalAmount}</span>
          </div>
        </div>
        <div
          style={{
            borderTop: "1px solid #ddd",
            marginTop: "28px",
            paddingTop: "10px",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "9px",
            color: "#aaa",
          }}
        >
          <span>
            Generated on{" "}
            {new Date().toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>
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
  const [liveRiderEta, setLiveRiderEta] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    const found = orders.find((e) => {
      const id = e?._id;
      if (!id) return false;
      return (
        String(id) === String(orderId) ||
        String(id).slice(-6).toUpperCase() === String(orderId).toUpperCase()
      );
    });
    setOrder(found || null);
  }, [orderId, orders]);

  useEffect(() => {
    if (!socket || !order?._id) return;
    const handle = (updatedOrder) => {
      if (String(updatedOrder._id) === String(order._id))
        setOrder(updatedOrder);
    };
    socket.on("payment-updated", handle);
    return () => socket.off("payment-updated", handle);
  }, [order?._id]);

  useEffect(() => {
    if (!socket || !order?._id) return;
    const handle = (payload = {}) => {
      const pid = payload.orderId || payload?.order?._id;
      if (
        pid &&
        String(pid) !== String(order._id) &&
        String(pid).slice(-6).toUpperCase() !==
          String(order._id).slice(-6).toUpperCase()
      )
        return;
      const riderCoords = getRiderCoords(payload);
      const deliveryCoords = getDeliveryCoords(order);
      if (!riderCoords || !deliveryCoords) return;
      const distanceKm = getDistanceKm(riderCoords, deliveryCoords);
      const eta = buildEtaLabel(distanceKm, Number(payload.speedKmph));
      if (eta) setLiveRiderEta(eta);
    };
    socket.on("rider-location-update", handle);
    return () => socket.off("rider-location-update", handle);
  }, [order]);

  // ── Not found ──
  if (!order) {
    return (
      <section className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#FFFBE9] to-orange-50 flex items-center justify-center">
        <div className="mx-auto max-w-md px-3 sm:px-4 md:px-6 py-12 sm:py-14 md:py-16 text-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mx-auto mb-4 sm:mb-5">
            <UtensilsCrossed
              size={20}
              className="sm:w-6 md:w-6 text-slate-400"
            />
          </div>
          <h1 className="text-base sm:text-lg md:text-lg font-bold text-slate-900">
            Order Data not found
          </h1>
          <p className="text-xs sm:text-sm md:text-sm text-slate-500 mt-2 mb-6 sm:mb-7 leading-relaxed">
            We couldn't locate this order in your account. It may have been
            removed or the link is incorrect.
          </p>
          <button
            onClick={() => navigate("/account")}
            className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl bg-slate-900 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={12} className="sm:w-3.5 md:w-4" /> Back to Account
          </button>
        </div>
      </section>
    );
  }

  // ── Data ──
  const items = Array.isArray(order.orderItems) ? order.orderItems : [];
  const itemCount = items.reduce((t, i) => t + (i?.quantity || 0), 0);
  const addressText = getAddressText(
    order.deliveryAddress?.[0] || order.deliveryAddress,
  );
  const totalAmount = Number(order.totalAmount || 0);
  const tax = Number(order.tax || 0);
  const subtotal = Number(order.subtotal || totalAmount);
  const deliveryFee = Number(order.deliveryFee || 0);
  const discount = Number(order.discount || 0);
  const status = getDisplayStatus(order.status);
  const {
    label: statusLabel,
    pill: pillClass,
    dot: dotClass,
  } = getStatusConfig(status);
  const isCanceled = ["canceled", "cancelled", "rejected"].includes(status);
  const isDelivered = status === "delivered";
  const showRider = [
    "accepted",
    "assigned",
    "out-for-delivery",
    "delivered",
  ].includes(status);
  const paymentWatermark =
    status === "rejected" ? "REJECTED" : isCanceled ? "CANCELLED" : null;

  const rider = order.rider || order.riderInfo || order.deliveryPartner || {};
  const riderWithLiveEta =
    liveRiderEta &&
    !["delivered", "canceled", "cancelled", "rejected"].includes(status)
      ? { ...rider, eta: liveRiderEta }
      : rider;

  const invoiceNo = String(order._id || order.orderId || "")
    .slice(-6)
    .toUpperCase();
  const dateTime = formatOrderDate(order.createdAt);

  const handleCancelOrder = () => setShowCancelConfirm(true);
  const confirmCancelOrder = () => {
    dispatch(cancelOrder(order))
      .unwrap()
      .then(() => setShowCancelConfirm(false))
      .catch(() => console.error("Failed to cancel order"));
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#FFFBE9] to-orange-50">
      {/* Print invoice */}
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
        <ConfirmOrderCancel
          onConfirm={confirmCancelOrder}
          onCancel={() => setShowCancelConfirm(false)}
        />
      )}

      <div className="mx-auto max-w-5xl px-3 sm:px-4 md:px-6 py-6 sm:py-7 md:py-8">
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between mb-5 sm:mb-6 md:mb-7 gap-2 sm:gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl border border-slate-200 bg-white px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5
              text-[10px] sm:text-xs md:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300
              transition-all shadow-sm shadow-slate-900/5 flex-shrink-0"
          >
            <ArrowLeft size={12} className="sm:w-3.5 md:w-4" /> Back
          </button>
          <div className="flex items-center gap-2 sm:gap-2.5">
            {order.status === "placed" && (
              <button
                onClick={handleCancelOrder}
                className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2
                  text-[8px] sm:text-xs md:text-sm font-semibold text-red-600 hover:bg-red-100 transition-all shadow-sm shadow-red-900/5"
              >
                <CircleOff size={14} /> Cancel Order
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2
                text-[8px] sm:text-xs md:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300
                transition-all shadow-sm shadow-slate-900/5"
            >
              <Printer size={14} /> Print Invoice
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:gap-4 md:gap-5 lg:grid-cols-[1fr_360px]">
          {/* ══ LEFT COLUMN ══ */}
          <div className="space-y-3 sm:space-y-4 md:space-y-5">
            {/* ── Hero card ── */}
            <div className="rounded-3xl bg-white border border-slate-100 shadow-sm shadow-slate-900/5 overflow-hidden">
              {/* Header */}
              <div className="relative overflow-hidden bg-slate-900 px-3 sm:px-4 md:px-5 lg:px-6 py-4 sm:py-5 md:py-6">
                {/* Decorative circles */}
                <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/[0.03]" />
                <div className="pointer-events-none absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/[0.03]" />

                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 md:gap-4">
                  <div className="min-w-0">
                    <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 mb-1">
                      Tax Invoice
                    </p>
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-3xl font-bold text-white tracking-tight truncate">
                      #{invoiceNo}
                    </h1>
                    {dateTime && (
                      <p className="text-[9px] sm:text-xs md:text-sm text-slate-400 mt-2 sm:mt-2.5 flex items-center gap-1">
                        <Clock size={10} className="sm:w-3 md:w-3.5" />
                        <span className="truncate">
                          {dateTime.date} · {dateTime.time}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col sm:items-end gap-1.5 sm:gap-2 flex-shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-xl px-2.5 sm:px-3 md:px-3.5 py-1.5 sm:py-1.5 md:py-2 text-[8px] sm:text-[9px] md:text-xs font-bold
                      uppercase tracking-wider border backdrop-blur-sm ${pillClass}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full animate-pulse ${dotClass}`}
                      />
                      {statusLabel}
                    </span>
                    <p className="text-[8px] sm:text-[9px] md:text-xs text-slate-500 whitespace-nowrap">
                      {itemCount} item{itemCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pipeline */}
              {!isCanceled && (
                <div className="px-3 sm:px-4 md:px-5 lg:px-6 py-3 sm:py-4 md:py-5 border-b border-slate-100">
                  <StatusPipeline status={status} />
                </div>
              )}

              {/* Cancelled banner */}
              {isCanceled && (
                <div className="px-3 sm:px-4 md:px-5 lg:px-6 py-3 sm:py-3.5 md:py-4 border-b border-slate-100">
                  <CanceledBanner status={status} />
                </div>
              )}

              {/* Delivery address */}
              <div className="px-3 sm:px-4 md:px-5 lg:px-6 py-3 sm:py-4 md:py-5 border-b border-slate-100">
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin
                      size={13}
                      className="sm:w-4 md:w-4 text-slate-500"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                      Delivery Address
                    </p>
                    <p className="text-xs sm:text-sm md:text-sm text-slate-700 leading-relaxed line-clamp-3">
                      {addressText || "Address not available"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rider panel */}
              {showRider && (
                <div className="px-3 sm:px-4 md:px-5 lg:px-6 py-3 sm:py-4 md:py-5">
                  <RiderPanel status={status} rider={riderWithLiveEta} />
                </div>
              )}
            </div>

            {/* ── Items card ── */}
            <div className="rounded-3xl bg-white border border-slate-100 shadow-sm shadow-slate-900/5 overflow-hidden">
              <div className="px-3 sm:px-4 md:px-5 lg:px-6 py-3 sm:py-3.5 md:py-4 border-b border-slate-100 flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 min-w-0">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag
                      size={12}
                      className="sm:w-3 md:w-3.5 text-orange-500"
                    />
                  </div>
                  <h2 className="text-xs sm:text-sm md:text-sm font-bold text-slate-900 truncate">
                    Order Items
                  </h2>
                </div>
                <span className="text-[8px] sm:text-[9px] md:text-xs text-slate-400 bg-slate-100 rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 font-semibold flex-shrink-0 whitespace-nowrap">
                  {itemCount} items
                </span>
              </div>

              {/* Table header */}
              <div className="grid grid-cols-[1fr_auto_auto] gap-2 sm:gap-3 md:gap-4 px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2.5 md:py-3 bg-slate-50 border-b border-slate-100">
                <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Item
                </p>
                <p className="w-7 text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">
                  Qty
                </p>
                <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right min-w-[48px] sm:min-w-[56px] flex-shrink-0">
                  Amount
                </p>
              </div>

              <div className="divide-y divide-slate-50">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-[1fr_auto_auto] gap-2 sm:gap-3 md:gap-4 px-3 sm:px-4 md:px-5 lg:px-6 py-2.5 sm:py-3 md:py-4 items-center hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm md:text-sm font-semibold text-slate-900 truncate">
                        {item.name || "Item"}
                      </p>
                      <p className="text-[9px] sm:text-xs md:text-xs text-slate-400 mt-0.5">
                        ₹{item.price || 0} per unit
                      </p>
                    </div>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] sm:text-xs font-bold text-slate-700 flex-shrink-0">
                      {item.quantity || 0}
                    </div>
                    <p className="text-xs sm:text-sm md:text-sm font-bold text-slate-900 text-right min-w-[48px] sm:min-w-[56px] flex-shrink-0">
                      ₹{(item.price || 0) * (item.quantity || 0)}
                    </p>
                  </div>
                ))}
              </div>

              {order.notes && (
                <div className="px-3 sm:px-4 md:px-5 lg:px-6 py-3 sm:py-3.5 md:py-4 bg-amber-50/60 border-t border-amber-100 flex items-start gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
                    <MessageCircle
                      size={11}
                      className="sm:w-3 md:w-3.5 text-amber-600"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">
                      Order Note
                    </p>
                    <p className="text-xs sm:text-sm md:text-sm text-slate-700 line-clamp-2">
                      {order.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ══ RIGHT COLUMN ══ */}
          <div className="space-y-3 sm:space-y-4 md:space-y-5">
            {/* ── Payment summary ── */}
            <div className="relative rounded-3xl bg-white border border-slate-100 shadow-sm shadow-slate-900/5 overflow-hidden">
              {/* Watermark for cancelled/rejected */}
              {paymentWatermark && (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-red-50/50" />
                  <span
                    className="select-none rotate-[-12deg] border-[2.5px] border-red-700/20 rounded-xl
                    px-3 sm:px-4 py-1.5 sm:py-2 text-lg sm:text-xl md:text-2xl font-extrabold uppercase tracking-[0.25em] text-red-800/15"
                  >
                    {paymentWatermark}
                  </span>
                </div>
              )}

              <div className="relative z-20 px-3 sm:px-4 md:px-5 lg:px-6 py-3 sm:py-3.5 md:py-4 border-b border-slate-100 flex items-center gap-1.5 sm:gap-2 md:gap-2.5">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Zap size={11} className="sm:w-3 md:w-3.5 text-emerald-500" />
                </div>
                <h2 className="text-[9px] sm:text-xs md:text-xs font-bold uppercase tracking-widest text-slate-500">
                  Payment Summary
                </h2>
              </div>

              <div className="relative z-20 px-3 sm:px-4 md:px-5 lg:px-6 py-3 sm:py-3.5 md:py-4 space-y-2 sm:space-y-2.5">
                {[
                  {
                    label: "Subtotal",
                    value: `₹${subtotal}`,
                    highlight: false,
                  },
                  {
                    label: "Delivery Fee",
                    value: deliveryFee > 0 ? `₹${deliveryFee}` : "Free",
                    highlight: false,
                  },
                  ...(tax > 0
                    ? [
                        {
                          label: "Tax & Charges",
                          value: `₹${tax}`,
                          highlight: false,
                        },
                      ]
                    : []),
                  ...(discount > 0
                    ? [
                        {
                          label: "Discount",
                          value: `-₹${discount}`,
                          highlight: true,
                        },
                      ]
                    : []),
                ].map(({ label, value, highlight }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="text-xs sm:text-sm md:text-sm text-slate-500">
                      {label}
                    </span>
                    <span
                      className={`text-xs sm:text-sm md:text-sm font-semibold whitespace-nowrap ${highlight ? "text-emerald-600" : "text-slate-800"}`}
                    >
                      {value}
                    </span>
                  </div>
                ))}

                <div className="border-t border-slate-100 pt-2 sm:pt-2.5 md:pt-3 mt-1 flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm md:text-sm font-bold text-slate-900">
                    Total
                  </span>
                  <span className="text-xl sm:text-2xl md:text-2xl font-bold text-slate-900 tracking-tight whitespace-nowrap">
                    ₹{totalAmount}
                  </span>
                </div>
              </div>

              {!paymentWatermark && (
                <div className="relative z-20 px-3 sm:px-4 md:px-5 lg:px-6 py-3 sm:py-3.5 md:py-4 bg-slate-50 border-t border-slate-100 space-y-2 sm:space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[8px] sm:text-[9px] md:text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Payment Method
                    </span>
                    <span className="text-[8px] sm:text-[9px] md:text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-2 sm:px-2.5 py-0.5 sm:py-1 whitespace-nowrap">
                      {order.paymentMethod?.toUpperCase() || "N/A"}
                    </span>
                  </div>
                  {order.paymentStatus && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[8px] sm:text-[9px] md:text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Payment Status
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[6px] md:text-[9px] font-bold uppercase tracking-widest
                        rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 border flex-shrink-0 whitespace-nowrap
                        ${
                          order.paymentStatus.toLowerCase() === "paid"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-600 border-amber-200"
                        }`}
                      >
                        {order.paymentStatus.toLowerCase() === "paid" && (
                          <CheckCircle size={9} />
                        )}
                        {order.paymentStatus}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Review panel (delivered only) ── */}
            {orders && isDelivered && <ReviewPanel order={order} />}

            {/* ── Help card ── */}
            <div className="rounded-3xl bg-white border border-slate-100 shadow-sm shadow-slate-900/5 p-3 sm:p-4 md:p-5 lg:p-5">
              <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle
                    size={13}
                    className="sm:w-4 md:w-4 text-slate-400"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] sm:text-xs md:text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                    Need Help?
                  </p>
                  <p className="text-xs sm:text-sm md:text-sm text-slate-500 leading-relaxed">
                    For issues with this order, reach out to support with order
                    number{" "}
                    <span className="font-semibold text-slate-800">
                      #{invoiceNo}
                    </span>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(OrderDetails);
