import { Image, ShoppingBasket, Star } from "lucide-react";
import { useState } from "react";
function CardOne({ item, sale }) {
  const [error, setError] = useState(false);
  return (
    <div className="mx-auto max-w-[80vw] min-[440px]:max-w-[210px] group relative bg-white rounded-3xl px-5 py-2 m-1 flex flex-col items-center w-full shadow-sm border border-orange-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden">
      {/* Background Gradient on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Badge */}
      {sale ? (
        <span className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-semibold z-10 shadow-md z-20">
          Sale
        </span>
      ) : (
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur px-2 py-1 rounded-full shadow-sm z-20 border border-gray-200">
          <Star fill="#FFB800" className="text-yellow-400 w-3 h-3" />
          <p className="text-xs font-bold text-gray-700">4.5</p>
        </div>
      )}

      {/* Image Container */}
      <div className="relative w-full h-full my-3 z-10 flex items-center justify-center">
        {!error ? (
          <img
            className="w-30 h-30 object-cover rounded-2xl group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
            decoding="async"
            src={item.image}
            alt={item.name}
            onError={() => setError(true)}
          />
        ) : (
          <div className="w-full h-30 flex items-center justify-center rounded-2xl border-2 border-orange-300 text-gray-500">
            <Image size={48} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="w-full z-10 text-left">
        {/* Name */}
        <h1 className="font-bold text-base text-gray-900 line-clamp-1">
          {item.name.toUpperCase()}
        </h1>

        {/* Price */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {sale ? (
              <>
                <p className="line-through text-xs text-gray-400">
                  ₹{item.originalPrice}
                </p>
                <p className="font-bold text-lg text-[#FF7407]">
                  ₹{item.discountedPrice}
                </p>
              </>
            ) : (
              <p className="font-bold text-lg text-[#FF7407]">
                ₹{item.originalPrice}
              </p>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            aria-label="add-to-cart-btn"
            className="bg-[#FF7407] text-white p-2.5 rounded-xl hover:bg-[#F67401] hover:scale-110 transition-all shadow-md hover:shadow-lg"
          >
            <ShoppingBasket size={18} color="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CardOne;
