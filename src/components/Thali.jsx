import { ShoppingBasket } from "lucide-react";

function Thali() {
  const thaliDetails = {
    name: "Maa ki Thali",
    description: ["Chawal", "Dal", "Sabji", "Roti", "Raita", "Mithai"],
    offer: true,
    originalPrice: 110,
    offerPrice: 99,
    offerPercentage: 10,
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
        <div className="relative overflow-hidden p-8 px-10 mt-2 text-left  gap-6 h-80 md:h-86">
          {/* image */}
          <img
            src="./thali.png"
            alt="thali"
            loading="lazy"
            decoding="async"
            className="hidden min-[410px]:flex absolute right-1/2 left-1/2  translate-x-[-6rem] md:translate-x-[0rem] translate-y-[-1rem] md:translate-y-[-3rem] w-96 md:w-110 -z-0"
          />
          {thaliDetails.offer && (
            <div className="hidden min-[410px]:flex  absolute top-4 right-4 bg-yellow-300 p-2 rounded">
              <p>{thaliDetails.offerPercentage}% Off</p>
            </div>
          )}

          {/* name */}
          <h2 className="text-3xl font-semibold mb-4 text-white">
            {thaliDetails.name}
          </h2>
          {/* description */}
          <div className="relative flex gap-2 z-10">
            <ul className="list-disc list-inside text-white space-y-2">
              {thaliDetails.description.slice(0, 3).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <ul className="list-disc list-inside text-white space-y-2">
              {thaliDetails.description.slice(3).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          {/* price */}
          {thaliDetails.offer ? (
            <p className="mt-4">
              <span className="line-through text-white mr-2">
                ₹{thaliDetails.originalPrice}
              </span>
              <span className="text-xl text-white font-semibold text-yellow-200">
                ₹{thaliDetails.offerPrice}
              </span>
            </p>
          ) : (
            <p className="text-xl font-semibold mt-4 text-yellow-200">
              Only ₹{thaliDetails.originalPrice}
            </p>
          )}
          {/* button */}
          <button
            aria-label="order-now-btn"
            className="flex items-center  gap-2 text-md md:text-lg mt-4 px-6 py-2 bg-yellow-400 text-black font-semibold rounded hover:bg-yellow-500 transition-colors"
          >
            <ShoppingBasket />
            Add to Cart
          </button>
        </div>
      </section>
    </div>
  );
}

export default Thali;
