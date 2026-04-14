import { useMemo } from "react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { extractUniqueCategories } from "../store/helper/items";
import CardGrid from "./CardGrid.jsx";
import CardOne from "./CardOne.jsx";
import CardSkeleton from "./CardSkeleton.jsx";
import {
  selectSpecialItems,
  selectSpecialCategories,
  makeSelectItemsByCategory,
} from "../store/selectors/itemSelector.js";

function Specialties() {
  const [selectedSpecialties, setSelectedSpecialties] = useState("");
  const [specialtyStartIndex, setSpecialtyStartIndex] = useState(0);
  const [specialtyVisibleCount, setSpecialtyVisibleCount] = useState(5);

  const { loading } = useSelector((state) => state.items);

  const specialItems = useSelector(selectSpecialItems);
  const specialties = useSelector(selectSpecialCategories);

  const selectCategoryItems = useMemo(
    () => makeSelectItemsByCategory(selectedSpecialties),
    [selectedSpecialties],
  );

  const categoryItems = useSelector(selectCategoryItems);

  useEffect(() => {
    if (specialties.length > 0 && !specialties.includes(selectedSpecialties)) {
      setSelectedSpecialties(specialties[0]);
    }
  }, [specialties, selectedSpecialties]);

  const totalSpecialties = specialties.length;
  const specialtyMaxStart = Math.max(
    0,
    totalSpecialties - specialtyVisibleCount,
  );

  const visibleSpecialties = specialties.slice(
    specialtyStartIndex,
    specialtyStartIndex + specialtyVisibleCount,
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 440) {
        setSpecialtyVisibleCount(2);
      } else if (window.innerWidth < 1024) {
        setSpecialtyVisibleCount(3);
      } else if (window.innerWidth < 1280) {
        setSpecialtyVisibleCount(4);
      } else {
        setSpecialtyVisibleCount(5);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="max-w-6xl mx-auto mb-4 sm:mb-6 md:mb-8 bg-transparent pt-4 sm:pt-6 md:pt-8 px-2 sm:px-4 text-center">
      <div className="inline-flex flex-col items-center">
        <span className="text-[9px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[#F67401] font-semibold bg-slate-900 px-2 sm:px-3 py-1 rounded-full border border-orange-100">
          Our Menu Picks
        </span>
        <h2 className="mt-2 sm:mt-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold bg-gradient-to-r from-[#FF7407] to-[#F6A51A] bg-clip-text text-transparent line-clamp-2">
          Our specialties
        </h2>
      </div>
      <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-2 sm:mt-3 px-2">
        Explore handcrafted favorites across every craving.
      </p>
      <div className="max-w-fit mx-auto mt-6 sm:mt-8 md:mt-10 px-2 sm:px-4 w-full">
        <div className="flex items-center justify-between gap-2 sm:gap-3 overflow-x-auto">
          <button
            aria-label="previous-specialties"
            className="h-8 sm:h-10 w-8 sm:w-10 rounded-full border border-orange-100 bg-white shadow-sm hover:shadow-md transition-all disabled:opacity-40 flex-shrink-0 text-sm sm:text-base"
            onClick={() =>
              setSpecialtyStartIndex((prev) => Math.max(0, prev - 1))
            }
            disabled={specialtyStartIndex === 0}
          >
            ‹
          </button>

          {loading ? (
            [1, 2, 3].map((_, index) => (
              <div
                key={index}
                className="w-20 sm:w-24 md:w-28 p-2 sm:p-3 animate-pulse flex-shrink-0"
              >
                {/* Image skeleton */}
                <div className="mx-auto h-10 w-10 sm:h-14 sm:w-14 md:h-16 md:w-16 mt-3 sm:mt-4 bg-slate-300 rounded-full"></div>
                {/* Name skeleton */}
                <div className="mx-auto h-3 w-14 sm:w-16 mt-2 bg-slate-300 rounded"></div>
              </div>
            ))
          ) : (
            <>
              {visibleSpecialties.map((specialty) => {
                return (
                  <div
                    key={specialty}
                    className={`w-20 sm:w-24 md:w-28 lg:w-32 p-2 sm:p-3 transition-all hover:-translate-y-0.5 sm:hover:-translate-y-1 flex-shrink-0 ${
                      selectedSpecialties === specialty
                        ? "border-b-4 border-[#FF7407]"
                        : ""
                    } cursor-pointer`}
                    onClick={() => setSelectedSpecialties(specialty)}
                  >
                    <img
                      src={`/images/image-icons/${specialty.toLowerCase()}.png`}
                      alt={specialty}
                      className="mx-auto h-auto w-14 sm:w-16 md:w-20 lg:w-24 mt-2 sm:mt-3 md:mt-4"
                    />
                    <p className="text-xs sm:text-sm md:text-base font-semibold pt-1 sm:pt-2 line-clamp-1">
                      {specialty}
                    </p>
                  </div>
                );
              })}
            </>
          )}

          <button
            aria-label="next-specialties"
            className="h-8 sm:h-10 w-8 sm:w-10 rounded-full border border-orange-100 bg-white shadow-sm hover:shadow-md transition-all disabled:opacity-40 flex-shrink-0 text-sm sm:text-base"
            onClick={() =>
              setSpecialtyStartIndex((prev) =>
                Math.min(specialtyMaxStart, prev + 1),
              )
            }
            disabled={specialtyStartIndex >= specialtyMaxStart}
          >
            ›
          </button>
        </div>
      </div>
      <CardGrid>
        {loading ? (
          <>
            {[1, 2, 3, 4].map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </>
        ) : (
          <>
            {categoryItems.map((item) => (
              <CardOne key={item._id ?? item.name} item={item} />
            ))}
          </>
        )}
      </CardGrid>
      <p className="text-[11px] sm:text-xs md:text-sm text-gray-500 mt-3 sm:mt-4 px-2">
        Tap a category to view its signature dishes.
      </p>
    </section>
  );
}

export default Specialties;
