import { useEffect, useState, useMemo } from "react";
import { placeOrder } from "../store/cartSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Lock,
  Truck,
  Wallet,
  CreditCard,
  Banknote,
  Shield,
  Loader,
  MapPin,
  User,
  Mail,
  Phone,
  ShoppingBag,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useSelector } from "react-redux";
import { clearCart } from "../store/cartSlice";

// ── Small helpers ──────────────────────────────────────────────────────────────
function InfoField({ icon: Icon, value, placeholder }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
      <Icon size={15} className="shrink-0 text-slate-400" />
      <span className="truncate">{value || <span className="text-slate-400">{placeholder}</span>}</span>
    </div>
  );
}

function SectionCard({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, title, accent }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`p-2 rounded-xl ${accent}`}>
        <Icon size={17} className="text-white" />
      </div>
      <h2 className="text-base font-semibold text-slate-800">{title}</h2>
    </div>
  );
}

const PAYMENT_METHODS = [
  {
    id: "Cash On Delivery",
    label: "Cash on Delivery",
    description: "Pay when your order arrives",
    available: true,
    Icon: Banknote,
    color: "bg-emerald-500",
    ring: "ring-emerald-400",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  {
    id: "upi",
    label: "UPI Payment",
    description: "Google Pay, PhonePe, Paytm",
    available: false,
    Icon: Wallet,
    color: "bg-violet-500",
    ring: "ring-violet-400",
    pill: "bg-violet-50 text-violet-700 border-violet-100",
  },
  {
    id: "card",
    label: "Card Payment",
    description: "Credit or Debit card",
    available: false,
    Icon: CreditCard,
    color: "bg-blue-500",
    ring: "ring-blue-400",
    pill: "bg-blue-50 text-blue-700 border-blue-100",
  },
];

// ── Main Component ─────────────────────────────────────────────────────────────
function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ paymentMethod: "Cash On Delivery" });
  const { user, tempAddress } = useSelector((state) => state.auth);
  const { deliveryShop } = useSelector((state) => state.shop);
  const { items, placingOrder, orderPlaced } = useSelector((state) => state.cart);

  const [selectedAddress, setSelectedAddress] = useState(null);

  const tax = 6;
  const delivery = 30;
  const subTotal = useMemo(
    () => items.reduce((total, item) => total + (item.isSale ? item.discountPrice : item.originalPrice) * item.quantity, 0),
    [items]
  );
  const total = subTotal + tax + delivery;

  const [orderDetail, setOrderDetail] = useState({
    userId: user?._id || null,
    orderItems: [],
    totalAmount: total,
    subtotal: subTotal,
    shopId: deliveryShop?._id || null,
    deliveryFee: delivery,
    discount: 0,
    tax,
    paymentMethod: "",
    deliveryAddress: {},
  });

  useEffect(() => {
    if (user?.addresses?.length > 0) {
      const def = user.addresses.find((a) => a.isDefault);
      setSelectedAddress(def || user.addresses[0]);
    }
  }, [user]);

  useEffect(() => {
    if (user && items.length > 0) {
      setOrderDetail({
        userId: user?._id || null,
        orderItems: items.map((item) => ({
          _id: item._id,
          name: item.name,
          price: item.isSale ? item.discountPrice : item.originalPrice,
          quantity: item.quantity,
        })),
        shopId: deliveryShop?._id || null,
        paymentMethod: formData.paymentMethod,
        deliveryAddress: tempAddress || "",
        subtotal: subTotal,
        deliveryFee: delivery,
        tax,
        discount: 0,
        totalAmount: total,
      });
    }
  }, [selectedAddress, items, deliveryShop, formData.paymentMethod]);

  // ── Empty cart state ─────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-[90vh] bg-gradient-to-b from-[#FFFBF0] to-orange-50 flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-5 max-w-sm text-center">
          <div className="w-20 h-20 rounded-3xl bg-orange-50 border border-orange-100 flex items-center justify-center">
            <ShoppingBag size={36} className="text-orange-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Your cart is empty</h3>
            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
              Add some delicious items to your cart and come back to place your order.
            </p>
          </div>
          <button
            onClick={() => { dispatch(clearCart()); setTimeout(() => navigate("/menu"), 300); }}
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200 transition-all hover:shadow-orange-300 hover:-translate-y-0.5 active:translate-y-0"
          >
            Explore Menu <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // ── Main checkout ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[90vh] bg-gradient-to-b from-[#FFFBF0] to-orange-50">
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-14">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Checkout</h1>
          <p className="mt-1 text-sm text-slate-500">Review your order and complete payment</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {/* ── Left column ──────────────────────────────────────────────────── */}
          <div className="md:col-span-2 space-y-5">

            {/* Delivery Details */}
            <SectionCard>
              <SectionTitle icon={Truck} title="Delivery Details" accent="bg-orange-500" />
              <div className="grid sm:grid-cols-2 gap-3">
                <InfoField icon={User} value={user?.fullName} placeholder="Full Name" />
                <InfoField icon={Mail} value={user?.email} placeholder="Email Address" />
                <InfoField icon={Phone} value={user?.phone} placeholder="Phone Number" />
                {tempAddress && (
                  <InfoField
                    icon={MapPin}
                    value={tempAddress.formattedAddress}
                    placeholder="Delivery Address"
                  />
                )}
              </div>
            </SectionCard>

            {/* Payment Method */}
            <SectionCard>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-800">
                    <Shield size={17} className="text-white" />
                  </div>
                  <h2 className="text-base font-semibold text-slate-800">Payment Method</h2>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                  <Lock size={10} /> Secure
                </span>
              </div>

              <div className="space-y-2.5">
                {PAYMENT_METHODS.map((method) => {
                  const isSelected = formData.paymentMethod === method.id;
                  return (
                    <label
                      key={method.id}
                      className={`
                        relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer
                        transition-all duration-200 select-none
                        ${isSelected
                          ? "border-orange-400 bg-orange-50/60 shadow-sm"
                          : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/60"
                        }
                        ${!method.available ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={isSelected}
                        onChange={() => method.available && setFormData({ paymentMethod: method.id })}
                        className="sr-only"
                      />

                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl ${method.color} flex items-center justify-center shrink-0 shadow-sm`}>
                        <method.Icon size={19} className="text-white" />
                      </div>

                      {/* Label */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{method.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{method.description}</p>
                      </div>

                      {/* Coming soon pill */}
                      {!method.available && (
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${method.pill}`}>
                          Soon
                        </span>
                      )}

                      {/* Radio indicator */}
                      {method.available && (
                        <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${isSelected ? "border-orange-500 bg-orange-500" : "border-slate-300"}`}>
                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <Lock size={13} className="text-slate-400 shrink-0" />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Your payment information is encrypted with 256-bit SSL security
                </p>
              </div>
            </SectionCard>
          </div>

          {/* ── Order Summary sidebar ─────────────────────────────────────────── */}
          <div className="md:col-span-1">
            <div className="rounded-2xl border border-slate-100 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden sticky top-20">

              {/* Summary header */}
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
                <h2 className="text-sm font-semibold text-slate-800">Order Summary</h2>
                <p className="text-xs text-slate-400 mt-0.5">{items.length} item{items.length > 1 ? "s" : ""}</p>
              </div>

              {/* Items */}
              <div className="px-5 py-4 space-y-3 max-h-48 overflow-y-auto border-b border-slate-100">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-md bg-orange-100 text-orange-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {item.quantity}
                      </span>
                      <span className="text-xs text-slate-600 truncate">{item.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-800 shrink-0">
                      ₹{(item.isSale ? item.discountPrice : item.originalPrice) * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing breakdown */}
              <div className="px-5 py-4 space-y-2.5 border-b border-slate-100">
                {[
                  { label: "Subtotal", value: `₹${subTotal}` },
                  { label: "Tax (5%)", value: `₹${tax}` },
                  { label: "Delivery", value: `₹${delivery}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-medium text-slate-700">{value}</span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="px-5 py-4">
                <div className="flex justify-between items-center mb-5">
                  <span className="text-sm font-semibold text-slate-800">Total</span>
                  <span className="text-2xl font-extrabold text-orange-500 tracking-tight">₹{total}</span>
                </div>

                {/* Place Order button */}
                <button
                  onClick={() => {
                    dispatch(placeOrder(orderDetail))
                      .unwrap()
                      .then((res) => navigate(`/orders/${res.order._id}`))
                      .catch(() => console.error("Failed to place order."));
                  }}
                  disabled={placingOrder}
                  className="
                    w-full rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700
                    px-5 py-3.5 text-sm font-semibold text-white
                    shadow-md shadow-orange-200 hover:shadow-orange-300
                    transition-all hover:-translate-y-0.5 active:translate-y-0
                    disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0
                    flex items-center justify-center gap-2
                  "
                >
                  {placingOrder && !orderPlaced ? (
                    <><Loader size={16} className="animate-spin" /> Placing Order…</>
                  ) : orderPlaced ? (
                    <><CheckCircle2 size={16} /> Order Placed!</>
                  ) : (
                    <><Sparkles size={16} /> Place Order</>
                  )}
                </button>

                <p className="mt-3 text-[10px] text-slate-400 text-center leading-relaxed">
                  By placing an order you agree to our{" "}
                  <span className="underline underline-offset-2 cursor-pointer">Terms of Service</span>
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

export default Checkout;