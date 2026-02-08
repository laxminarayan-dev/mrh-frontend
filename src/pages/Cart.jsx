import { useState } from "react";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Handshake,
  CloudUpload,
  ShoppingBasket,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { addItem, removeItem, deleteItem } from "../store/cartSlice";

function Cart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);
  const { isLoggedIn, user = { cart: [] } } = useSelector(
    (state) => state.auth,
  );

  console.log("User in Cart:", user);
  const [isSyncing, setIsSyncing] = useState(false);

  const subtotal = items.reduce((sum, item) => {
    if (item.isSale) {
      return sum + item.discountPrice * item.quantity;
    } else {
      return sum + item.originalPrice * item.quantity;
    }
  }, 0);
  const tax = Math.round(subtotal * 0.05);
  const delivery = subtotal > 500 ? 0 : 30;
  const total = subtotal + tax + delivery;

  const handleSyncCart = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 900);
  };

  if (items.length === 0) {
    return (
      <div className="w-full bg-gradient-to-b from-[#FFFBE9] to-orange-200 min-h-[calc(100vh-4rem)]  flex items-center justify-center px-6">
        <div className="max-w-lg w-full text-center">
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
          {items.length} item{items.length !== 1 ? "s" : ""} in your cart
        </p>

        <div className="mt-8 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-3">
            {items.map((item) => (
              <div
                key={item._id}
                className="rounded-2xl border border-orange-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  <div className="h-24 w-24 flex-shrink-0 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-400 text-xs">
                    <img
                      src={item.images.url}
                      alt={item.name}
                      className="w-full h-full object-contain rounded-xl p-2"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {item.name}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {item.isSale
                            ? `₹${item.discountPrice} per item`
                            : `₹${item.originalPrice} each`}
                        </p>
                      </div>
                      <button
                        onClick={() => dispatch(deleteItem(item._id))}
                        className="text-slate-400 hover:text-red-600 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 p-1">
                        <button
                          onClick={() => dispatch(removeItem(item._id))}
                          className="p-1 hover:bg-orange-100 rounded transition"
                        >
                          <Minus size={16} className="text-orange-600" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => dispatch(addItem(item))}
                          className="p-1 hover:bg-orange-100 rounded transition"
                        >
                          <Plus size={16} className="text-orange-600" />
                        </button>
                      </div>
                      <p className="text-lg font-bold text-slate-900">
                        {item.isSale
                          ? `₹${item.discountPrice * item.quantity}`
                          : `₹${item.originalPrice * item.quantity}`}
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
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    navigate("/checkout");
                  }}
                  className="mt-6 w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:from-orange-600 hover:to-orange-700 transition-all"
                >
                  Proceed to Checkout
                </button>
              ) : (
                <button
                  onClick={() => {
                    navigate("/auth");
                  }}
                  className="mt-6 w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:from-orange-600 hover:to-orange-700 transition-all"
                >
                  Login to Checkout
                </button>
              )}

              {isLoggedIn && (
                <button
                  onClick={handleSyncCart}
                  className="mt-3 w-full rounded-lg border border-orange-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
                  disabled={isSyncing}
                >
                  <CloudUpload size={18} className="text-orange-600" />
                  {isSyncing ? "Syncing..." : "Sync Cart to Cloud"}
                </button>
              )}
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
