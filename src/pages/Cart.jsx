import { useEffect, useState } from "react";
import { Trash2, Plus, Minus, Handshake, CloudUpload } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { addItem, removeItem, deleteItem } from "../store/cartSlice";
import ImageWithLoader from "../components/ImageWithLoader";

function Cart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items } = useSelector((state) => state.cart);
  const { isLoggedIn } = useSelector((state) => state.auth);
  const { shopsData, deliveryShop } = useSelector((state) => state.shop);
  const [shop, setShop] = useState(null);
  const [isUnavailable, setIsUnavailable] = useState({
    status: false,
    message: "",
  });

  useEffect(() => {
    Array.isArray(shopsData) &&
      shopsData.forEach((shop) => {
        if (shop._id === deliveryShop?._id) {
          setShop(shop);
        }
      });
  }, [shopsData, deliveryShop]);

  useEffect(() => {
    if (shop) {
      const shopClose = shop.shopOpen;
      if (!shopClose) {
        setIsUnavailable({
          status: true,
          message: `Your nearest shop is currently closed. Sorry for the inconvenience. Please try again later.`,
        });
        return;
      }

      const unavailableItems = items.filter(
        (item) => !shop.menuItems.includes(item._id),
      );
      if (unavailableItems.length > 0) {
        setIsUnavailable({
          status: true,
          message: `Some items in your cart are not available at your nearest shop. Please remove them to proceed.`,
        });
      } else {
        setIsUnavailable({ status: false, message: "" });
      }
    }
  }, [shop, items]);

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

  if (items.length === 0) {
    return (
      <div className="w-full bg-gradient-to-b from-[#FFFBE9] to-orange-200 min-h-[calc(100vh-4rem)] flex items-center justify-center px-2 sm:px-4 md:px-6">
        <div className="max-w-lg w-full text-center">
          <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight px-1">
            Your cart is empty
          </h1>
          <p className="mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm md:text-base text-slate-600 px-1">
            Looks like you haven't added anything yet. Let's explore some
            delicious options.
          </p>
          <Link
            to="/"
            className="mt-4 sm:mt-5 md:mt-6 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold text-white shadow-md hover:from-orange-600 hover:to-orange-700 transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-b from-[#FFFBE9] via-orange-100 to-orange-200 min-h-[90vh]">
      <section className="max-w-6xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 py-6 sm:py-8 md:py-12 lg:py-16">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
          Shopping Cart
        </h1>
        <p className="mt-1 sm:mt-2 md:mt-3 text-xs sm:text-sm md:text-base text-slate-600">
          {items.length} item{items.length !== 1 ? "s" : ""} in your cart
        </p>

        <div className="mt-4 sm:mt-6 md:mt-8 grid md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          <div className="md:col-span-2 space-y-2 sm:space-y-2.5 md:space-y-3">
            {items.map((item) => (
              <div
                key={item._id}
                className={`relative rounded-2xl border  p-4 shadow-sm hover:shadow-md transition-shadow ${!shop?.menuItems.includes(item._id) ? "opacity-70 bg-red-100/40 border-red-500" : "bg-white border-orange-200"}`}
              >
                {!shop?.menuItems.includes(item._id) && (
                  <>
                    <div className="absolute -rotate-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-99 bg-red-500 text-white text-[10px] sm:text-xs md:text-sm px-2 py-1 rounded-full whitespace-nowrap">
                      Not Available
                    </div>
                  </>
                )}
                <div className="flex gap-2 sm:gap-3 md:gap-4">
                  <div className="h-16 sm:h-20 md:h-24 w-16 sm:w-20 md:w-24 flex-shrink-0 rounded-lg sm:rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-400 text-xs">
                    <ImageWithLoader
                      src={`${item.images.url}`}
                      alt={item.name}
                      className={"w-18"}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm md:text-lg font-semibold text-slate-900 truncate">
                          {item.name}
                        </h3>
                        <p className="text-[11px] sm:text-xs md:text-sm text-slate-600 mt-0.5 sm:mt-1">
                          {item.isSale
                            ? `₹${item.discountPrice} per item`
                            : `₹${item.originalPrice} each`}
                        </p>
                      </div>
                      <button
                        onClick={() => dispatch(deleteItem(item._id))}
                        className={`flex-shrink-0 hover:text-red-600 transition ${!shop?.menuItems.includes(item._id) ? "text-red-600" : "text-slate-400"}`}
                      >
                        <Trash2
                          size={16}
                          className="sm:w-4 md:w-5 sm:h-4 md:h-5"
                        />
                      </button>
                    </div>
                    <div
                      className={`mt-2 sm:mt-2.5 md:mt-4 flex items-center justify-between gap-2 ${!shop?.menuItems.includes(item._id) ? "pointer-events-none" : ""}`}
                    >
                      <div className="flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 p-0.5 sm:p-1">
                        <button
                          onClick={() => dispatch(removeItem(item._id))}
                          className="p-0.5 sm:p-1 hover:bg-orange-100 rounded transition"
                        >
                          <Minus
                            size={14}
                            className="sm:w-4 md:w-4 text-orange-600 sm:h-4 md:h-4"
                          />
                        </button>
                        <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => dispatch(addItem(item))}
                          className="p-0.5 sm:p-1 hover:bg-orange-100 rounded transition"
                        >
                          <Plus
                            size={14}
                            className="sm:w-4 md:w-4 text-orange-600 sm:h-4 md:h-4"
                          />
                        </button>
                      </div>
                      <p className="text-sm sm:text-base md:text-lg font-bold text-slate-900 flex-shrink-0">
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
            <div className="rounded-lg sm:rounded-xl md:rounded-2xl border border-orange-200 bg-gradient-to-br from-white to-orange-50/40 p-3 sm:p-4 md:p-5 lg:p-6 shadow-lg sticky top-14 sm:top-16 md:top-20 hover:shadow-xl transition-shadow">
              <h2 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900">
                Order Summary
              </h2>
              <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-2.5 border-b border-slate-200 pb-3 sm:pb-4">
                <div className="flex justify-between text-[11px] sm:text-xs md:text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium text-slate-900">
                    ₹{subtotal}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] sm:text-xs md:text-sm">
                  <span className="text-slate-600">Tax (5%)</span>
                  <span className="font-medium text-slate-900">₹{tax}</span>
                </div>
                <div className="flex justify-between text-[11px] sm:text-xs md:text-sm">
                  <span className="text-slate-600">Delivery</span>
                  <span className="font-medium text-slate-900">
                    {delivery === 0 ? "FREE" : `₹${delivery}`}
                  </span>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex justify-between">
                <span className="font-semibold text-slate-900 text-sm sm:text-base">
                  Total
                </span>
                <span className="text-base sm:text-lg md:text-xl font-bold text-orange-600">
                  ₹{total}
                </span>
              </div>
              {isUnavailable.status ? (
                <p className="mt-3 sm:mt-4 text-red-600 px-2 sm:px-3 py-2 text-[11px] sm:text-xs md:text-sm rounded-lg bg-red-100/50">
                  {isUnavailable.message}
                </p>
              ) : (
                <>
                  {isLoggedIn ? (
                    <button
                      onClick={() => {
                        navigate("/checkout");
                      }}
                      className="mt-3 sm:mt-4 md:mt-6 w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold text-white shadow-md hover:from-orange-600 hover:to-orange-700 transition-all"
                    >
                      Proceed to Checkout
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        navigate("/auth");
                      }}
                      className="mt-3 sm:mt-4 md:mt-6 w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold text-white shadow-md hover:from-orange-600 hover:to-orange-700 transition-all"
                    >
                      Login to Checkout
                    </button>
                  )}
                  <Link
                    to="/"
                    className="mt-2 sm:mt-2.5 md:mt-3 block w-full text-center rounded-lg border border-orange-200 bg-white px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold text-orange-600 hover:bg-orange-50 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </>
              )}

              {subtotal <= 500 && (
                <p className="mt-3 sm:mt-4 text-orange-700 px-2 sm:px-3 py-2 text-[11px] sm:text-xs md:text-sm flex items-center justify-start gap-1 bg-orange-100/40 rounded-lg">
                  <Handshake
                    size={16}
                    className="sm:w-4 md:w-5 sm:h-4 md:h-5 flex-shrink-0"
                  />{" "}
                  Add ₹{500 - subtotal} more for free delivery!
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
