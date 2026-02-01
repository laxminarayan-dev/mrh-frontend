import React, { Fragment } from "react";
import CardOne from "../components/CardOne";
import CardGrid from "../components/CardGrid";
import Feedback from "../components/Feedback";
import ChooseUs from "../components/ChooseUs";
import Thali from "../components/Thali";
import CardSkeleton from "../components/CardSkeleton";

function Index({
  mostSellers = [],
  itemsBySpecialty = [],
  selectedSpecialties = () => {},
  setSelectedSpecialties = () => {},
  specialtyStartIndex = 0,
  specialtyMaxStart = 0,
  visibleSpecialties = [],
  setSpecialtyStartIndex = () => {},
  isLoading = false,
}) {
  return (
    <Fragment>
      {/* Hero Section */}
      <header className="bg-gradient-to-b from-[#FFFBE9] via-orange-100 to-orange-200 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-[#FF7407] rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-10 w-96 h-96 bg-orange-300 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-6xl mx-auto py-12 md:py-20 px-10 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white border-2 border-orange-300 backdrop-blur border border-orange-100 px-4 py-2 rounded-full">
                <span className="text-sm text-[#F67401] font-semibold">
                  Homemade Goodness
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#FF7407] to-[#F6A51A] bg-clip-text text-transparent leading-tight">
                Taste The Authenticity
              </h1>

              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                Authentic Indian & Fast Food made with love and tradition. Every
                bite tells a story of care and quality.
              </p>

              <div className="flex flex-wrap gap-3 pt-4">
                {[
                  { icon: "✓", text: "Fresh Daily" },
                  { icon: "✓", text: "100% Vegetarian" },
                ].map((item, index) => (
                  <span
                    key={index}
                    className="text-sm px-4 py-2 rounded-full bg-white border border-orange-100 text-gray-700 font-medium flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span className="text-[#FF7407] font-bold">
                      {item.icon}
                    </span>
                    {item.text}
                  </span>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <button className="px-8 py-3 bg-[#FF7407] text-white font-semibold rounded-full hover:bg-[#F67401] transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                  Order Now
                </button>
                <button className="px-8 py-3 border-2 border-[#FF7407] text-[#FF7407] font-semibold rounded-full hover:bg-[#FFF0E6] transition-all">
                  View Menu
                </button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-6 border-t border-orange-100">
                {[
                  { number: "500+", label: "Happy Customers" },
                  { number: "4.4★", label: "Rating" },
                  { number: "20 min", label: "Avg Delivery" },
                ].map((stat, index) => (
                  <div key={index}>
                    <p className="text-2xl md:text-3xl font-bold text-[#FF7407]">
                      {stat.number}
                    </p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual */}
            <div className="hidden md:flex justify-center items-center relative">
              <div className="w-80 h-80 bg-gradient-to-br from-[#FF7407] to-[#F6A51A] rounded-3xl shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform duration-300 flex items-center justify-center text-6xl">
                <img className="w-50 h-50" src="/dosa.png" alt="" />
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* best seller */}

      <section className="py-4 text-center">
        <h1 className="font-semibold text-4xl border-b-4 border-[#FF7407] inline">
          Best Sellers
        </h1>
        <p className="text-gray-600 mt-3">
          Our most-loved dishes, picked by customers every day.
        </p>

        <CardGrid
          className={mostSellers.length >= 4 ? "md:max-w-6xl" : "md:max-w-3xl"}
        >
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </>
          ) : (
            <>
              {mostSellers.map((item, index) => (
                <CardOne key={index} sale={true} item={item} />
              ))}
            </>
          )}
        </CardGrid>
      </section>
      {/* Speciality Items Section */}
      <section className="max-w-6xl mx-auto mb-8 bg-transparent pt-6 text-center">
        <div className="inline-flex flex-col items-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[#F67401] font-semibold bg-slate-900 px-3 py-1 rounded-full border border-orange-100">
            Our Menu Picks
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-semibold bg-gradient-to-r from-[#FF7407] to-[#F6A51A] bg-clip-text text-transparent">
            Our Specialties
          </h2>
        </div>
        <p className="text-gray-600 mt-3">
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

            {isLoading ? (
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
                {visibleSpecialties.map((specialty, index) => (
                  <div
                    key={index}
                    className={`w-24 sm:w-28 md:w-32 p-3 transition-all hover:-translate-y-1 ${
                      selectedSpecialties === specialty.name
                        ? "border-b-4 border-[#FF7407]"
                        : ""
                    } cursor-pointer`}
                    onClick={() => setSelectedSpecialties(specialty.name)}
                  >
                    <img
                      src={specialty.image}
                      alt={specialty.name}
                      className="mx-auto h-12 w-12 sm:h-16 sm:w-16 mt-6"
                    />
                    <p className="text-md sm:text-lg font-semibold pt-2">
                      {specialty.name}
                    </p>
                  </div>
                ))}
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
        <CardGrid
          className={
            Object.keys(itemsBySpecialty).length > 0 &&
            itemsBySpecialty[selectedSpecialties].length >= 4
              ? "md:max-w-6xl"
              : "md:max-w-3xl"
          }
        >
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </>
          ) : (
            <>
              {Object.keys(itemsBySpecialty).length > 0 &&
                itemsBySpecialty[selectedSpecialties].map((item, index) => (
                  <CardOne key={index} item={item} />
                ))}
            </>
          )}
        </CardGrid>
        <p className="text-xs sm:text-sm text-gray-500 mt-4">
          Tap a category to view its signature dishes.
        </p>
      </section>
      {/* Thali */}
      <Thali />
      {/* Why Choose Us */}
      <ChooseUs />
      {/* Customer Feedback Section */}
      <Feedback />
    </Fragment>
  );
}

export default Index;
