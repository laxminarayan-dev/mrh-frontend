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
    <section className="max-w-6xl mx-auto mb-8 bg-transparent pt-6 text-center">
      <div className="inline-flex flex-col items-center">
        <span className="text-xs uppercase tracking-[0.3em] text-[#F67401] font-semibold bg-slate-900 px-3 py-1 rounded-full border border-orange-100">
          Our Menu Picks
        </span>
        <h2 className="mt-3 text-4xl sm:text-5xl md:text-5xl font-semibold bg-gradient-to-r from-[#FF7407] to-[#F6A51A] bg-clip-text text-transparent">
          Our specialties
        </h2>
      </div>
      <p className="text-gray-600 mt-3 px-2">
        Explore handcrafted favorites across every craving.
      </p>
      <div className="max-w-fit mx-auto mt-10 px-4">
        <div className="flex items-center justify-between gap-3">
          <button
            aria-label="previous-specialties"
            className="h-10 w-10 rounded-full border border-orange-100 bg-white shadow-sm hover:shadow-md transition-all disabled:opacity-40"
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
                className="w-24 sm:w-28 md:w-32 p-3 animate-pulse"
              >
                {/* Image skeleton */}
                <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 mt-6 bg-slate-300 rounded-full"></div>
                {/* Name skeleton */}
                <div className="mx-auto h-4 w-16 sm:w-20 mt-2 bg-slate-300 rounded"></div>
              </div>
            ))
          ) : (
            <>
              {visibleSpecialties.map((specialty) => {
                return (
                  <div
                    key={specialty}
                    className={`w-28 sm:w-32 md:w-36 p-3 transition-all hover:-translate-y-1 ${
                      selectedSpecialties === specialty
                        ? "border-b-4 border-[#FF7407]"
                        : ""
                    } cursor-pointer`}
                    onClick={() => setSelectedSpecialties(specialty)}
                  >
                    <img
                      src={`/images/image-icons/${specialty.toLowerCase()}.png`}
                      alt={specialty}
                      className="mx-auto h-auto w-38  mt-6"
                    />
                    <p className="text-md sm:text-lg font-semibold pt-2">
                      {specialty}
                    </p>
                  </div>
                );
              })}
            </>
          )}

          <button
            aria-label="next-specialties"
            className="h-10 w-10 rounded-full border border-orange-100 bg-white shadow-sm hover:shadow-md transition-all disabled:opacity-40"
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
      <p className="text-xs sm:text-sm text-gray-500 mt-4">
        Tap a category to view its signature dishes.
      </p>
    </section>
  );
}

export default Specialties;
