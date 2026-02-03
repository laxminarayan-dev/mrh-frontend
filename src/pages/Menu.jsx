import React, { useMemo, useState } from "react";
import CardGrid from "../components/CardGrid";
import CardOne from "../components/CardOne";

const MENU_ITEMS = [
  {
    id: 1,
    name: "Masala Dosa",
    type: "South Indian",
    description: "Crispy dosa with spicy potato masala.",
    originalPrice: 110,
    discountedPrice: 90,
    image: "/dosa.png",
  },
  {
    id: 2,
    name: "Idli Sambar",
    type: "South Indian",
    description: "Soft idlis served with sambar & chutney.",
    originalPrice: 90,
    discountedPrice: 70,
    image: "/idli.png",
  },
  {
    id: 3,
    name: "Paneer Butter Masala",
    type: "North Indian",
    description: "Creamy tomato gravy with paneer cubes.",
    originalPrice: 190,
    discountedPrice: 160,
    image: "/paneer.png",
  },
  {
    id: 4,
    name: "Dal Tadka",
    type: "North Indian",
    description: "Yellow lentils tempered with garlic & spices.",
    originalPrice: 140,
    discountedPrice: 120,
    image: "/dal.png",
  },
  {
    id: 5,
    name: "Veg Biryani",
    type: "Rice Bowls",
    description: "Aromatic basmati rice with veggies.",
    originalPrice: 170,
    discountedPrice: 140,
    image: "/biryani.png",
  },
  {
    id: 6,
    name: "Jeera Rice",
    type: "Rice Bowls",
    description: "Fragrant rice with cumin & ghee.",
    originalPrice: 110,
    discountedPrice: 90,
    image: "/jeera-rice.png",
  },
  {
    id: 7,
    name: "Veg Momos",
    type: "Starters",
    description: "Steamed dumplings with spicy dip.",
    originalPrice: 130,
    discountedPrice: 110,
    image: "/momos.png",
  },
  {
    id: 8,
    name: "Chilli Paneer",
    type: "Starters",
    description: "Indo-Chinese paneer with peppers.",
    originalPrice: 180,
    discountedPrice: 150,
    image: "/chilli-paneer.png",
  },
  {
    id: 9,
    name: "Thali Special",
    type: "Combos",
    description: "Complete meal with 6 items & sweet.",
    originalPrice: 229,
    discountedPrice: 199,
    image: "/thali.png",
  },
  {
    id: 10,
    name: "Roti (4 pcs)",
    type: "Breads",
    description: "Soft whole wheat rotis.",
    originalPrice: 80,
    discountedPrice: 60,
    image: "/roti.png",
  },
  {
    id: 11,
    name: "Butter Naan (2 pcs)",
    type: "Breads",
    description: "Tandoor baked naan with butter.",
    originalPrice: 90,
    discountedPrice: 70,
    image: "/naan.png",
  },
  {
    id: 12,
    name: "Gulab Jamun",
    type: "Desserts",
    description: "Soft milk dumplings in sugar syrup.",
    originalPrice: 100,
    discountedPrice: 80,
    image: "/gulab-jamun.png",
  },
];

const CATEGORY_CARDS = [
  {
    name: "All",
    description: "Everything we serve",
    emoji: "🍽️",
    accent: "from-orange-400 to-orange-600",
    soft: "bg-orange-50",
  },
  {
    name: "South Indian",
    description: "Crispy dosas & idlis",
    emoji: "🥞",
    accent: "from-amber-400 to-orange-500",
    soft: "bg-amber-50",
  },
  {
    name: "North Indian",
    description: "Gravy classics",
    emoji: "🍛",
    accent: "from-red-400 to-orange-500",
    soft: "bg-red-50",
  },
  {
    name: "Rice Bowls",
    description: "Aromatic rice meals",
    emoji: "🍚",
    accent: "from-emerald-400 to-green-500",
    soft: "bg-emerald-50",
  },
  {
    name: "Starters",
    description: "Bites to begin",
    emoji: "🥟",
    accent: "from-fuchsia-400 to-pink-500",
    soft: "bg-fuchsia-50",
  },
  {
    name: "Breads",
    description: "Freshly baked",
    emoji: "🫓",
    accent: "from-yellow-400 to-amber-500",
    soft: "bg-yellow-50",
  },
  {
    name: "Desserts",
    description: "Sweet endings",
    emoji: "🍮",
    accent: "from-purple-400 to-indigo-500",
    soft: "bg-purple-50",
  },
  {
    name: "Combos",
    description: "Complete meals",
    emoji: "🍱",
    accent: "from-sky-400 to-cyan-500",
    soft: "bg-sky-50",
  },
];

function Menu() {
  const [activeType, setActiveType] = useState("All");

  const filteredItems = useMemo(() => {
    if (activeType === "All") {
      return MENU_ITEMS;
    }
    return MENU_ITEMS.filter((item) => item.type === activeType);
  }, [activeType]);

  const categoryCounts = useMemo(() => {
    const counts = MENU_ITEMS.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});
    return {
      ...counts,
      All: MENU_ITEMS.length,
    };
  }, []);

  return (
    <div className="bg-gradient-to-b from-[#FFFBE9] via-orange-100 to-orange-200 min-h-screen">
      <section className="max-w-6xl mx-auto px-6 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-semibold bg-gradient-to-r from-[#FF7407] to-[#F6A51A] bg-clip-text text-transparent">
          Explore Our Menu
        </h1>
        <p className="mt-3 text-gray-600">
          Tap a category to see matching items.
        </p>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {CATEGORY_CARDS.map((category) => {
            const isActive = category.name === activeType;
            return (
              <button
                key={category.name}
                type="button"
                onClick={() => setActiveType(category.name)}
                className={`group relative overflow-hidden text-left rounded-3xl border p-5 transition-all shadow-sm hover:shadow-lg hover:-translate-y-1 bg-white/95 ${isActive
                    ? "border-[#FF7407] ring-2 ring-[#FF7407]/30"
                    : "border-orange-100"
                  }`}
              >
                <div
                  className={`absolute -top-10 -right-10 h-24 w-24 rounded-full blur-2xl opacity-40 transition-all group-hover:opacity-70 ${category.soft}`}
                ></div>
                <div className="relative z-10 flex items-start justify-between">
                  <div
                    className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${category.accent} flex items-center justify-center text-2xl shadow-md`}
                  >
                    <span className="drop-shadow-sm">{category.emoji}</span>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${isActive
                        ? "bg-[#FF7407] text-white"
                        : "bg-orange-100 text-[#FF7407]"
                      }`}
                  >
                    {categoryCounts[category.name] || 0} items
                  </span>
                </div>
                <div className="relative z-10 mt-4">
                  <p className="text-base font-semibold text-gray-900">
                    {category.name}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {category.description}
                  </p>
                </div>
                <div
                  className={`mt-4 h-1 w-full rounded-full bg-gradient-to-r transition-all ${isActive
                      ? "from-[#FF7407] to-[#F6A51A]"
                      : "from-orange-100 to-orange-50"
                    }`}
                ></div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="py-4 text-center max-w-6xl mx-auto">
        <CardGrid>
          <div className="col-span-full w-full max-w-6xl flex items-center justify-between flex-wrap gap-3 ">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
                {activeType} Items
              </h2>
              <p className="text-gray-600">
                {filteredItems.length} items available
              </p>
            </div>
            <span className="text-sm px-4 py-2 rounded-full bg-white border border-orange-100 text-gray-700 shadow-sm">
              Freshly prepared • 100% Veg
            </span>
          </div>
          {filteredItems.map((item) => (
            <CardOne key={item.id} item={item} sale={true} />
          ))}
        </CardGrid>
      </section>
    </div>
  );
}

export default Menu;
