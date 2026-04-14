import {
  ShoppingBag,
  Motorbike,
  IndianRupee,
  ShoppingBasket,
} from "lucide-react";
import { Link } from "react-router-dom";

function ChooseUs() {
  const whyChooseUs = [
    {
      title: "Fresh Ingredients",
      description: "Prepared daily with farm-fresh produce and spices.",
      Icon: ShoppingBag,
      accent: "from-orange-100 to-orange-50",
    },
    {
      title: "Fast Delivery",
      description: "Hot and delicious food delivered right on time.",
      Icon: Motorbike,
      accent: "from-amber-100 to-amber-50",
    },
    {
      title: "Great Value",
      description: "Premium quality meals at pocket-friendly prices.",
      Icon: IndianRupee,
      accent: "from-yellow-100 to-yellow-50",
    },
    {
      title: "Pure Veg",
      description: "100% vegetarian kitchen with hygienic prep.",
      Icon: ShoppingBasket,
      accent: "from-orange-100 to-orange-50",
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-2 sm:px-4 mb-4 sm:mb-6 md:mb-8 pt-6 sm:pt-8 md:pt-12">
      <div className="text-center">
        <p className="text-[9px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-widest text-[#F67401] font-semibold">
          Why Choose Us
        </p>
        <h1 className="font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-900 mt-2 sm:mt-3 leading-tight px-2">
          Modern taste. Traditional soul.
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-2 sm:mt-3 max-w-2xl mx-auto px-2">
          Clean ingredients, fast delivery, and a menu crafted with love.
        </p>
      </div>

      <div className="mt-6 sm:mt-8 md:mt-10 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-orange-100 via-orange-300 to-orange-100 border border-orange-100 p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {whyChooseUs.map(({ title, description, Icon, accent }) => (
            <div
              key={title}
              className="group bg-white/30 backdrop-blur rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-sm border border-orange-100/70 hover:-translate-y-0.5 sm:hover:-translate-y-1 hover:shadow-xl transition-all"
            >
              <div
                className={`h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-xl sm:rounded-2xl bg-slate-900 ${accent} flex items-center justify-center text-[#F67401] mb-2 sm:mb-3 md:mb-4 group-hover:scale-105 transition-transform`}
              >
                <Icon
                  size={16}
                  className="sm:w-5 md:w-6 lg:w-6"
                  color="#ffd6a7"
                />
              </div>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-900">
                {title}
              </p>
              <p className="text-[11px] sm:text-xs md:text-sm text-gray-700 mt-1 sm:mt-2 line-clamp-2">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 sm:mt-6 md:mt-8 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-2 sm:gap-3 md:gap-4 shadow-sm">
        <div className="px-2 md:px-0">
          <p className="text-xs sm:text-sm md:text-base text-gray-900 font-semibold">
            Made fresh, packed with care, and delivered with a smile.
          </p>
          <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 mt-1">
            No preservatives • Eco-friendly packaging • Hygienic kitchen
          </p>
        </div>
        <Link
          to="/menu"
          className="px-4 sm:px-6 py-1.5 sm:py-2 md:py-2.5 bg-[#FF7407] text-white text-xs sm:text-sm md:text-base font-semibold rounded-full hover:bg-[#F67401] transition-colors flex-shrink-0"
        >
          View Menu
        </Link>
      </div>
    </section>
  );
}

export default ChooseUs;
