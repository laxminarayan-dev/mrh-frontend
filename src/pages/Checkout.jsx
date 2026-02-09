import React, { useEffect, useState, useMemo } from "react";
import { placeOrder } from "../store/authSlice";
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
} from "lucide-react";
import { ListAddresses } from "./Account";
import { useSelector } from "react-redux";

function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    paymentMethod: "cash",
  });
  const { user, placingOrder, orderPlaced } = useSelector(
    (state) => state.auth,
  );
  const { items } = useSelector((state) => state.cart);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const tax = 6;
  const delivery = 30;
  const subTotal = useMemo(() => {
    return items.reduce((total, item) => {
      const price = item.isSale ? item.discountPrice : item.originalPrice;

      return total + price * item.quantity;
    }, 0);
  }, [items]);
  const total = subTotal + tax + delivery;
  const [orderDetail, setOrderDetail] = useState({
    userDetail: {},
    orderItems: [],
    subtotal: subTotal,
    deliveryFee: delivery,
    discount: 0,
    totalAmount: total,
    paymentMethod: "",
    deliveryAddress: {},
  });

  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      const defaultAddress = user.addresses.find((addr) => addr.isDefault);
      setSelectedAddress(
        defaultAddress ? defaultAddress._id : user.addresses[0]._id,
      );
    }
  }, [user]);

  useEffect(() => {
    if (user && items.length > 0) {
      const selectedAddr = user.addresses.find(
        (addr) => addr._id === selectedAddress,
      );
      setOrderDetail({
        userDetail: {
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
        },
        orderItems: items.map((item) => ({
          name: item.name,
          price: item.isSale ? item.discountPrice : item.originalPrice,
          quantity: item.quantity,
        })),
        paymentMethod: formData.paymentMethod,
        deliveryAddress: selectedAddr,
        subtotal: subTotal,
        deliveryFee: delivery,
        discount: 0,
        totalAmount: total,
      });
    }
  }, [selectedAddress, items]);

  return (
    <div className="w-full bg-gradient-to-b from-[#FFFBE9] to-orange-100 min-h-[90vh]">
      <section className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
          Checkout
        </h1>
        <p className="mt-2 text-slate-600">Complete your order in seconds</p>

        <div className="mt-8 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {/* Delivery Details */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Truck className="text-orange-600" size={24} />
                <h2 className="text-lg font-semibold text-slate-900">
                  Delivery Details
                </h2>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <p className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all">
                    {user?.fullName || "Full Name"}
                  </p>
                  <p className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all">
                    {user?.email || "Email Address"}
                  </p>
                  <p className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all">
                    {user?.phone || "Phone Number"}
                  </p>
                </div>
                <ListAddresses
                  onChekout={true}
                  addressList={user?.addresses}
                  setSelectedAddress={setSelectedAddress}
                  selectedAddress={selectedAddress}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-3xl border border-slate-300 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-md">
                    <Shield className="text-white" size={20} />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Payment Method
                  </h2>
                </div>
                <span className="text-xs text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                  Secure
                </span>
              </div>
              <div className="space-y-3">
                {[
                  {
                    id: "cash",
                    label: "Cash on Delivery",
                    description: "Pay when you receive",
                    available: true,
                    Icon: Banknote,
                    gradient: "from-emerald-500 to-teal-600",
                    bgGradient: "from-emerald-50 to-teal-50/50",
                  },
                  {
                    id: "upi",
                    label: "UPI Payment",
                    description: "Google Pay, PhonePe, Paytm",
                    available: false,
                    Icon: Wallet,
                    gradient: "from-purple-500 to-indigo-600",
                    bgGradient: "from-purple-50 to-indigo-50/50",
                  },
                  {
                    id: "card",
                    label: "Card Payment",
                    description: "Credit or Debit card",
                    available: false,
                    Icon: CreditCard,
                    gradient: "from-blue-500 to-cyan-600",
                    bgGradient: "from-blue-50 to-cyan-50/50",
                  },
                ].map((method) => (
                  <label
                    key={method.id}
                    className={`group relative flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                      formData.paymentMethod === method.id
                        ? `border-orange-500 bg-orange-50 shadow-md scale-[1.02]`
                        : "border-slate-300 bg-white "
                    } ${!method.available ? "opacity-50 !cursor-not-allowed" : "hover:border-slate-300 hover:shadow-sm hover:scale-[1.01]"}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={formData.paymentMethod === method.id}
                      onChange={(e) =>
                        method.available ? handleInputChange(e) : null
                      }
                      className="sr-only"
                    />
                    <div className="flex items-center flex-1 gap-4">
                      <div
                        className={`p-3 rounded-xl bg-gradient-to-br ${method.gradient} shadow-md ${method.available ? "group-hover:scale-110" : ""} transition-transform`}
                      >
                        <method.Icon className="text-white" size={22} />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">
                          {method.label}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {method.description}
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          formData.paymentMethod === method.id
                            ? "border-orange-500 bg-orange-500"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {formData.paymentMethod === method.id && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <Lock className="text-slate-400" size={16} />
                <p className="text-xs text-slate-600">
                  Your payment information is encrypted and secure
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          {items.length > 0 ? (
            <div className="md:col-span-1">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sticky top-20">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 pb-6 border-b border-slate-200">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-slate-600">{item.name}</span>
                      <span className="font-medium text-slate-900">
                        {item.isSale ? (
                          <>
                            ₹ {item.discountPrice} × {item.quantity}
                          </>
                        ) : (
                          <>
                            ₹ {item.originalPrice} × {item.quantity}
                          </>
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-3 border-b border-slate-200 pb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-medium text-slate-900">
                      ₹{subTotal}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tax (5%)</span>
                    <span className="font-medium text-slate-900">₹{tax}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Delivery</span>
                    <span className="font-medium text-slate-900">
                      ₹{delivery}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex justify-between mb-6">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="text-2xl font-bold text-orange-600">
                    ₹{total}
                  </span>
                </div>

                <button
                  className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2"
                  onClick={() => {
                    dispatch(placeOrder(orderDetail))
                      .unwrap()
                      .then(() => {
                        navigate("/account");
                      })
                      .catch(() => {
                        console.error(
                          "Failed to place order. Please try again.",
                        );
                      });
                  }}
                >
                  {placingOrder && !orderPlaced ? (
                    <>
                      <Loader className="animate-spin" size={18} /> Placing
                      Order...
                    </>
                  ) : !placingOrder && !orderPlaced ? (
                    <>
                      <CheckCircle2 size={18} /> Place Order
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} /> Order Placed
                    </>
                  )}
                </button>

                <p className="mt-4 text-xs text-slate-500 text-center">
                  By placing an order, you agree to our Terms of Service
                </p>
              </div>
            </div>
          ) : (
            <div className="md:col-span-1 flex flex-col items-center gap-4 p-8 border border-slate-200 rounded-3xl bg-white">
              <CheckCircle2 className="text-green-500" size={48} />
              <h3 className="text-lg font-semibold text-slate-900">
                Your cart is empty
              </h3>
              <p className="text-sm text-slate-600">
                Add some delicious meals to your cart and come back here to
                place your order!
              </p>
              <button
                className="mt-4 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:from-orange-600 hover:to-orange-700 transition-all"
                onClick={() => {
                  setTimeout(() => {
                    navigate("/menu");
                  }, 1200);
                }}
              >
                Explore Menu
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Checkout;
