import React, { useMemo, useState } from "react";
import CardGrid from "../components/CardGrid";
import CardOne from "../components/CardOne";
import { useSelector } from "react-redux";
import { ArrowBigDown, ArrowDown, ChevronDown } from "lucide-react";

function Menu() {
  const [activeType, setActiveType] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { items, categories } = useSelector((state) => state.items);


  const filteredItems = useMemo(() => {
    if (activeType === "All") {
      return items;
    }
    return items.filter((item) => item.category === activeType);
  }, [activeType, items]);

  const categoryCounts = useMemo(() => {
    const counts = items.reduce((acc, item) => {

      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});
    return {
      ...counts,
      All: items.length,
    };
  }, [items]);

  const handleCategorySelect = (categoryName) => {
    setActiveType(categoryName);
    setIsDropdownOpen(false);
  };

  return (
    <div className="bg-gradient-to-b from-[#FFFBE9] via-orange-100 to-orange-200 min-h-screen">
      <section className="max-w-6xl mx-auto px-6 py-2">
        <div className="text-center mb-4">
          <h1 className="text-4xl md:text-5xl font-semibold bg-gradient-to-r from-[#FF7407] to-[#F6A51A] bg-clip-text text-transparent">
            Explore Our Menu
          </h1>
          <p className="mt-3 text-gray-600">
            Select a category to filter items.
          </p>
        </div>

        <div className="flex justify-center mb-10">
          <div className="relative w-full max-w-xs">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-5 py-3 bg-white border-2 border-[#FF7407] rounded-2xl shadow-md hover:shadow-lg transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {activeType === "All" ? ("") : (
                    <img
                      className="w-12"
                      src={`/images/image-icons/${activeType}.png`}
                      alt={activeType}
                    />
                  )}
                </span>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Category</p>
                  <p className="text-base font-semibold text-gray-900">
                    {activeType.charAt(0).toUpperCase() + activeType.slice(1)}
                  </p>
                </div>
              </div>
              <ChevronDown className={`w-6 h-6 text-[#FF7407] transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-[#FF7407] rounded-2xl shadow-xl z-50 overflow-hidden">
                {categories.map((category) => {
                  console.log(category);

                  const isSelected = category === activeType;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleCategorySelect(category)}
                      className={`w-full px-5 py-3 flex items-center justify-between transition-colors border-b border-orange-100 last:border-b-0 ${isSelected ? "bg-orange-50" : "hover:bg-orange-50/50"
                        }`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <span className="text-2xl">
                          {category === "All" ? "" : (
                            <img
                              className="w-12"
                              src={`/images/image-icons/${category}.png`}
                              alt={category}
                            />)}
                        </span>
                        <div>
                          <p
                            className={`font-semibold ${isSelected ? "text-[#FF7407]" : "text-gray-900"}`}
                          >
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${isSelected
                          ? "bg-[#FF7407] text-white"
                          : "bg-orange-100 text-[#FF7407]"
                          }`}
                      >
                        {categoryCounts[category] || 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="text-center max-w-6xl mx-auto mb-8">
        <CardGrid>
          <div className="w-[80vw] mx-auto col-span-full min-[440px]:w-full max-w-6xl flex items-center justify-start min-[440px]:justify-between flex-wrap gap-3 ">
            <div className="text-left pl-1">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
                {activeType !== "All" ? activeType.charAt(0).toUpperCase() + activeType.slice(1).replace(/s$/, "") + "'s Menu" : "Menu"}
              </h2>
              <p className="text-gray-600">
                {filteredItems.length} items available
              </p>
            </div>
            <span className="text-sm px-4 py-2 rounded-full bg-white border border-orange-100 text-gray-700 shadow-sm">
              Freshly prepared • 100% vegetarian
            </span>
          </div>
          {filteredItems.map((item) => {
            return <CardOne key={item.images.url + item.name} item={item} />;
          })}
        </CardGrid>
      </section>
    </div>
  );
}

export default Menu;
