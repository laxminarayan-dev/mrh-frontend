import { Bike, ShoppingBasket, Star } from "lucide-react";

function CardOne({ item, sale }) {
  return (
    <div className="relative border-3 border-[#FF7407] rounded-2xl p-4 flex flex-col items-center text-left w-48 md:w-52 bg-linear-to-b from-orange-100 to-orange-300 my-1 transition-all hover:-translate-y-1 hover:shadow-xl">
      {sale ? (
        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          Sale
        </span>
      ) : (
        <>
          <Star fill="#fff" className="absolute top-2 left-2 text-red-400" />
          <p className="absolute top-2 left-8 text-red-400 text-xs font-semibold pl-1">
            3.4
          </p>
        </>
      )}
      {/* image */}
      <img className="w-30 h-30" src={item.image} alt={item.name} />
      {/* Name */}
      <h1 className="self-start font-semibold text-md mt-2">{item.name}</h1>
      {/* price */}
      <span className="flex justify-start items-center gap-2 self-start">
        {sale ? (
          <>
            <p className="line-through text-sm text-red-500">
              ₹{item.originalPrice}
            </p>
            <p className="font-semibold text-lg">₹{item.discountedPrice}</p>
          </>
        ) : (
          <p className="font-semibold text-lg">₹{item.originalPrice}</p>
        )}
      </span>

      <button
        aria-label="add-to-cart-btn"
        className="absolute bottom-2 right-2 bg-red-500 text-white p-2 rounded-xl hover:bg-[#F67401] transition-colors"
      >
        <ShoppingBasket color="#fff" />
      </button>
    </div>
  );
}

export default CardOne;
