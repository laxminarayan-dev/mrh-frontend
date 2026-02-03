import {
  ShoppingBag,
  Motorbike,
  IndianRupee,
  ShoppingBasket,
} from "lucide-react";

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
    <section className="max-w-6xl mx-auto px-4 mb-8 pt-12">
      <div className="text-center">
        <p className="text-sm uppercase tracking-widest text-[#F67401] font-semibold">
          Why Choose Us
        </p>
        <h1 className="font-semibold text-4xl md:text-5xl text-gray-900 mt-2">
          Modern taste. Traditional soul.
        </h1>
        <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
          Clean ingredients, fast delivery, and a menu crafted with love.
        </p>
      </div>

      <div className="mt-10 rounded-3xl bg-gradient-to-br from-orange-100 via-orange-300 to-orange-100 border border-orange-100 p-6 sm:p-8">
        <div className="grid grid-cols-1 min-[410px]:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyChooseUs.map(({ title, description, Icon, accent }) => (
            <div
              key={title}
              className="group bg-white/30 backdrop-blur rounded-2xl p-6 shadow-sm border border-orange-100/70 hover:-translate-y-1 hover:shadow-xl transition-all"
            >
              <div
                className={`h-12 w-12 rounded-2xl bg-slate-900 ${accent} flex items-center justify-center text-[#F67401] mb-4 group-hover:scale-105 transition-transform`}
              >
                <Icon size={22} color="#ffd6a7" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <p className="text-gray-900 font-semibold">
            Made fresh, packed with care, and delivered with a smile.
          </p>
          <p className="text-gray-600 text-sm mt-1">
            No preservatives • Eco-friendly packaging • Hygienic kitchen
          </p>
        </div>
        <button
          aria-label="order-now-btn"
          className="px-6 py-2 bg-[#FF7407] text-white font-semibold rounded-full hover:bg-[#F67401] transition-colors"
        >
          View Menu
        </button>
      </div>
    </section>
  );
}

export default ChooseUs;
