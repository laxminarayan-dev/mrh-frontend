import { memo, useState } from "react";
import { Check, Loader, ShoppingBasket, Star, Lock, Clock } from "lucide-react";
import ImageWithLoader from "./ImageWithLoader";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../store/cartSlice";

function CardOne({ item }) {
  const dispatch = useDispatch();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { deliveryShop } = useSelector((state) => state.shop);

  const isShopClosed = deliveryShop && !deliveryShop.shopOpen;
  const isUnavailable = deliveryShop?.shopOpen && !deliveryShop?.menuItems?.includes(item._id);
  const isDisabled = isShopClosed || isUnavailable;

  return (
    <div
      className={`
        mx-auto min-w-[75vw] max-w-[75vw] min-[440px]:min-w-[210px] min-[440px]:max-w-[210px]
        group relative bg-white rounded-3xl px-5 py-2 m-1 flex flex-col items-center w-full
        shadow-sm border border-orange-100
        transition-all duration-300
        ${isDisabled ? "pointer-events-none" : "hover:shadow-2xl hover:-translate-y-2"}
      `}
    >
      {/* ── Disabled Overlay ───────────────────────────────────────────── */}
      {isDisabled && (
        <div className="absolute inset-0 z-30 rounded-3xl overflow-hidden">
          {/* Frosted blur + dark tint */}
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[3px] rounded-3xl" />

          {/* Subtle noise texture for depth */}
          <div
            className="absolute inset-0 rounded-3xl opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Pill badge — centered */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div
              className={`
                flex items-center gap-2 px-4 py-2 rounded-2xl shadow-lg
                text-xs font-bold tracking-wide uppercase
                ${isShopClosed
                  ? "bg-gray-900 text-white"
                  : "bg-red-500 text-white"
                }
              `}
            >
              {isShopClosed ? (
                <Clock size={13} strokeWidth={2.5} />
              ) : (
                <Lock size={13} strokeWidth={2.5} />
              )}
              <span>{isShopClosed ? "Shop Closed" : "Unavailable"}</span>
            </div>

            {/* Subtext */}
            <p className="text-[10px] text-gray-700 font-medium">
              {isShopClosed ? "Opens tomorrow" : "Not on today's menu"}
            </p>
          </div>
        </div>
      )}

      {/* Background Gradient on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />

      {/* Badge */}
      {item.isSale ? (
        <span className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md z-20">
          % Sale
        </span>
      ) : (
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur px-2 py-1 rounded-full shadow-sm z-20 border border-gray-200">
          <Star fill="#FFB800" className="text-yellow-400 w-3 h-3" />
          <p className="text-xs font-bold text-gray-700">4.5</p>
        </div>
      )}

      {/* Image */}
      <div className="relative w-full h-full min-h-34 my-3 z-10 flex items-center justify-center">
        <ImageWithLoader
          className="w-30 h-30 object-cover rounded-2xl group-hover:scale-110 transition-transform duration-300"
          src={item.images.url}
          alt={item.name}
        />
      </div>

      {/* Content */}
      <div className="w-full z-10 text-left">
        <h1 className="font-bold text-base text-gray-900 line-clamp-1">
          {item.name.toUpperCase()}
        </h1>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {item.isSale ? (
              <>
                <p className="line-through text-xs text-gray-400">₹{item.originalPrice}</p>
                <p className="font-bold text-lg text-[#FF7407]">₹{item.discountPrice}</p>
              </>
            ) : (
              <p className="font-bold text-lg text-[#FF7407]">₹{item.originalPrice}</p>
            )}
          </div>

          <button
            onClick={() => {
              if (adding) return;
              dispatch(addItem(item));
              setAdded(false);
              setAdding(true);
              setTimeout(() => { setAdding(false); setAdded(true); }, 500);
              setTimeout(() => setAdded(false), 1000);
            }}
            aria-label="add-to-cart-btn"
            className="bg-[#FF7407] text-white p-2.5 rounded-xl hover:bg-[#F67401] hover:scale-110 transition-all shadow-md hover:shadow-lg"
          >
            {adding ? (
              <Loader size={18} className="animate-spin text-white" />
            ) : added ? (
              <Check size={18} color="#fff" />
            ) : (
              <ShoppingBasket size={18} color="#fff" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(CardOne);