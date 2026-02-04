import React, { useState } from "react";
import { Trash2, Plus, Minus, ShoppingBag, Handshake } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Paper Dosa",
      price: 40,
      quantity: 1,
      image: "/dosa-comp.png",
    },
    {
      id: 2,
      name: "Pav Bhaji",
      price: 70,
      quantity: 2,
      image: "/pavbhaji-comp.png",
    },
  ]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }
    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = Math.round(subtotal * 0.05);
  const delivery = subtotal > 500 ? 0 : 30;
  const total = subtotal + tax + delivery;

  if (cartItems.length === 0) {
    return (
      <div className="w-full bg-gradient-to-b from-[#FFFBE9] to-orange-200 min-h-[calc(100vh-4rem)]  flex items-center justify-center px-6">
        <div className="max-w-lg w-full text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 shadow-sm">
            <ShoppingBag size={30} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Your cart is empty
          </h1>
          <p className="mt-3 text-slate-600">
            Looks like you haven't added anything yet. Let's explore some
            delicious options.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:from-orange-600 hover:to-orange-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-b from-[#FFFBE9] via-orange-100 to-orange-200 min-h-[90vh]">
      <section className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
          Shopping Cart
        </h1>
        <p className="mt-2 text-slate-600">
          {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your
          cart
        </p>

        <div className="mt-8 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-orange-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  <div className="h-24 w-24 flex-shrink-0 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-400 text-xs">
                    {item.name}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {item.name}
                        </h3>
                        <p className="text-sm text-slate-600">
                          ₹{item.price} per item
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-red-600 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 p-1">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="p-1 hover:bg-orange-100 rounded transition"
                        >
                          <Minus size={16} className="text-orange-600" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-1 hover:bg-orange-100 rounded transition"
                        >
                          <Plus size={16} className="text-orange-600" />
                        </button>
                      </div>
                      <p className="text-lg font-bold text-slate-900">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="md:col-span-1">
            <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-white to-orange-50/40 p-6 shadow-lg sticky top-20 hover:shadow-xl transition-shadow">
              <h2 className="text-lg font-semibold text-slate-900">
                Order Summary
              </h2>
              <div className="mt-4 space-y-3 border-b border-slate-200 pb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium text-slate-900">
                    ₹{subtotal}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax (5%)</span>
                  <span className="font-medium text-slate-900">₹{tax}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Delivery</span>
                  <span className="font-medium text-slate-900">
                    {delivery === 0 ? "FREE" : `₹${delivery}`}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex justify-between">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="text-lg font-bold text-orange-600">
                  ₹{total}
                </span>
              </div>
              <button
                onClick={() => {
                  navigate("/checkout");
                }}
                className="mt-6 w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:from-orange-600 hover:to-orange-700 transition-all"
              >
                Proceed to Checkout
              </button>
              <Link
                to="/"
                className="mt-3 block w-full text-center rounded-lg border border-orange-200 bg-white px-5 py-3 text-sm font-semibold text-orange-600 hover:bg-orange-50"
              >
                Continue Shopping
              </Link>
              {subtotal <= 500 && (
                <p className="mt-4 text-orange-700 px-3 py-2 text-sm flex items-center justify-start gap-1 ">
                  <Handshake size={20} /> Add ₹{500 - subtotal} more for free
                  delivery!
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Cart;
