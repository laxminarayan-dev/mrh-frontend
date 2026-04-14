import { ShoppingBasket, Loader, Check, Store, PackageX } from "lucide-react";
import { useSelector } from "react-redux";
import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { addItem } from "../store/cartSlice";

function Thali() {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.items);
  const { deliveryShop } = useSelector((state) => state.shop);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const thalis = useMemo(
    () => items?.filter((item) => item?.category === "thali") ?? [],
    [items],
  );

  const thaliDetails = thalis.length > 0 ? thalis[0] : {};

  const isShopClosed = !deliveryShop?.shopOpen;
  const isNotAvailable =
    deliveryShop?.shopOpen &&
    !deliveryShop?.menuItems?.includes(thaliDetails?._id);

  const renderActionArea = () => {
    if (isShopClosed) {
      return (
        <div className="mt-3 sm:mt-4 md:mt-6 inline-flex items-center gap-1.5 sm:gap-2 bg-black/30 border border-white/20 backdrop-blur-sm text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs md:text-sm font-medium">
          <Store size={14} className="sm:w-4 md:w-4 text-yellow-300" />
          <span>Shop is currently closed</span>
        </div>
      );
    }

    if (isNotAvailable) {
      return (
        <div className="mt-3 sm:mt-4 md:mt-6 inline-flex items-center gap-1.5 sm:gap-2 bg-black/30 border border-white/20 backdrop-blur-sm text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs md:text-sm font-medium">
          <PackageX size={14} className="sm:w-4 md:w-4 text-yellow-300" />
          <span>Not available at current shop</span>
        </div>
      );
    }

    return (
      <button
        onClick={() => {
          if (adding) return;
          dispatch(addItem(thaliDetails));
          setAdded(false);
          setAdding(true);
          setTimeout(() => {
            setAdding(false);
            setAdded(true);
          }, 500);
          setTimeout(() => setAdded(false), 1000);
        }}
        aria-label="add-to-cart-btn"
        className="bg-yellow-300 text-black p-1.5 sm:p-2 md:p-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl hover:bg-yellow-400 hover:scale-105 active:scale-95 transition-all shadow-md hover:shadow-lg mt-3 sm:mt-4 md:mt-6 inline-flex items-center gap-1.5 sm:gap-2 font-medium text-xs sm:text-sm md:text-base"
      >
        {adding ? (
          <Loader size={14} className="sm:w-4 md:w-5 animate-spin text-black" />
        ) : added ? (
          <>
            <Check size={14} className="sm:w-4 md:w-5" color="#000" />
            <span>Added!</span>
          </>
        ) : (
          <>
            <ShoppingBasket size={14} className="sm:w-4 md:w-5" color="#000" />
            <span>Add to Cart</span>
          </>
        )}
      </button>
    );
  };

  return (
    <div className="w-full bg-[#ed274a]">
      <section className="max-w-2xl md:max-w-3xl mx-auto px-2 sm:px-4  text-center pt-4 py-4 sm:py-6 md:py-8">
        <h1 className="font-semibold text-white text-2xl sm:text-3xl md:text-4xl border-b-4 border-yellow-400 inline">
          Thali
        </h1>
        <p className="text-yellow-100 mt-2 sm:mt-3 text-xs sm:text-sm md:text-base">
          A wholesome plate with balanced flavors, perfect for lunch.
        </p>
        <div className="relative overflow-hidden p-3 sm:p-4 md:p-8 md:px-10 mt-2 text-left gap-3 sm:gap-4 md:gap-6">
          {/* image */}
          <img
            src={`${import.meta.env.VITE_BACKEND_API}${thaliDetails?.images?.url}`}
            alt="thali"
            loading="lazy"
            decoding="async"
            className="absolute right-1/2 left-1/2 w-[50vw] sm:w-72 md:w-96 lg:w-110 -z-0"
          />

          <div className="backdrop-blur-[1px] min-[440px]:backdrop-blur-[0px]">
            {/* name */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 sm:mb-3 md:mb-4 text-white">
              {thaliDetails?.name}
            </h2>
            {/* description */}
            <div className="relative flex gap-1.5 sm:gap-2 md:gap-3 z-10">
              <ul className="list-disc list-inside text-white space-y-1 sm:space-y-1.5 md:space-y-2 text-xs sm:text-sm md:text-base">
                {(thaliDetails?.includes?.slice(0, 3) || []).map(
                  (item, index) => (
                    <li key={index}>{item}</li>
                  ),
                )}
              </ul>
              <ul className="list-disc list-inside text-white space-y-1 sm:space-y-1.5 md:space-y-2 text-xs sm:text-sm md:text-base">
                {(thaliDetails?.includes?.slice(3) || []).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            {/* price */}
            {thaliDetails?.isSale ? (
              <p className="mt-2 sm:mt-3 md:mt-4 gap-2">
                <span className="line-through text-white mr-1 sm:mr-2 text-sm sm:text-base md:text-lg">
                  Only for ₹{thaliDetails?.originalPrice}
                </span>
                <span className="text-base sm:text-lg md:text-xl font-semibold text-yellow-200">
                  Only for ₹{thaliDetails?.discountPrice}
                </span>
              </p>
            ) : (
              <p className="text-base sm:text-lg md:text-xl font-semibold mt-2 sm:mt-3 md:mt-4 text-yellow-200">
                Only for ₹{thaliDetails?.originalPrice}
              </p>
            )}
            {/* button / status */}
            {renderActionArea()}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Thali;
