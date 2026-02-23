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
        <div className="mt-6 inline-flex items-center gap-2 bg-black/30 border border-white/20 backdrop-blur-sm text-white px-4 py-2.5 rounded-xl text-sm font-medium">
          <Store size={16} className="text-yellow-300" />
          <span>Shop is currently closed</span>
        </div>
      );
    }

    if (isNotAvailable) {
      return (
        <div className="mt-6 inline-flex items-center gap-2 bg-black/30 border border-white/20 backdrop-blur-sm text-white px-4 py-2.5 rounded-xl text-sm font-medium">
          <PackageX size={16} className="text-yellow-300" />
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
        className="bg-yellow-300 text-black p-2.5 px-4 rounded-xl hover:bg-yellow-400 hover:scale-105 active:scale-95 transition-all shadow-md hover:shadow-lg mt-6 inline-flex items-center gap-2 font-medium"
      >
        {adding ? (
          <Loader size={18} className="animate-spin text-black" />
        ) : added ? (
          <>
            <Check size={18} color="#000" />
            <span>Added!</span>
          </>
        ) : (
          <>
            <ShoppingBasket size={18} color="#000" />
            <span>Add to Cart</span>
          </>
        )}
      </button>
    );
  };

  return (
    <div className="w-full bg-[#ed274a]">
      <section className="max-w-2xl md:max-w-3xl mx-auto px-4 mb-8 text-center pt-6">
        <h1 className="font-semibold text-white text-4xl border-b-4 border-yellow-400 inline">
          Thali
        </h1>
        <p className="text-yellow-100 mt-3">
          A wholesome plate with balanced flavors, perfect for lunch.
        </p>
        <div className="relative overflow-hidden p-8 px-10 mt-2 text-left gap-6 h-80 md:h-86">
          {/* image */}
          <img
            src={`${import.meta.env.VITE_BACKEND_API}${thaliDetails?.images?.url}`}
            alt="thali"
            loading="lazy"
            decoding="async"
            className="absolute right-1/2 left-1/2 translate-x-[-6rem] md:translate-x-[0rem] translate-y-[-1rem] md:translate-y-[-3rem] w-96 md:w-110 -z-0"
          />

          <div className="backdrop-blur-[1px] min-[440px]:backdrop-blur-[0px]">
            {/* name */}
            <h2 className="text-3xl font-semibold mb-4 text-white">
              {thaliDetails?.name}
            </h2>
            {/* description */}
            <div className="relative flex gap-2 z-10">
              <ul className="list-disc list-inside text-white space-y-2">
                {(thaliDetails?.includes?.slice(0, 3) || []).map(
                  (item, index) => (
                    <li key={index}>{item}</li>
                  ),
                )}
              </ul>
              <ul className="list-disc list-inside text-white space-y-2">
                {(thaliDetails?.includes?.slice(3) || []).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            {/* price */}
            {thaliDetails?.isSale ? (
              <p className="mt-4">
                <span className="line-through text-white mr-2">
                  ₹{thaliDetails?.originalPrice}
                </span>
                <span className="text-xl font-semibold text-yellow-200">
                  ₹{thaliDetails?.discountPrice}
                </span>
              </p>
            ) : (
              <p className="text-xl font-semibold mt-4 text-yellow-200">
                Only ₹{thaliDetails?.originalPrice}
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