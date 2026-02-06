import { Fragment } from "react";
import CardOne from "../components/CardOne";
import Feedback from "../components/Feedback";
import ChooseUs from "../components/ChooseUs";
import Thali from "../components/Thali";
import CardSkeleton from "../components/CardSkeleton";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Specialities from "../components/Specialities";
import { useMemo } from "react";
import { selectBestSeller } from "../store/selectors/itemSelector";

function Index({}) {
  const { loading } = useSelector((state) => state.items);
  const mostSellers = useSelector(selectBestSeller);
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

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#FF7407] to-[#F6A51A] bg-clip-text text-transparent leading-tight">
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

              <div className="pt-4">
                <Link
                  to={"/menu"}
                  className="px-8 py-3 border-2 border-[#FF7407] text-[#FF7407] font-semibold rounded-full hover:bg-[#FFF0E6] transition-all"
                >
                  View Menu
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-10 pt-6 border-t border-orange-100">
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
                <img className="w-70 h-auto" src="/images/dosa.png" alt="" />
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* best seller */}

      <section className="max-w-6xl mx-auto py-4 text-center">
        <h1 className="font-semibold text-4xl border-b-4 border-[#FF7407] inline">
          Best Sellers
        </h1>
        <p className="text-gray-600 mt-3 px-2">
          Our most-loved dishes, picked by customers every day.
        </p>
        <div className="grid mx-auto w-[80vw] min-[440px]:w-full px-2 gap-4 mt-8 justify-start min-[440px]:justify-center [grid-template-columns:1fr] min-[410px]:[grid-template-columns:repeat(auto-fit,200px)]">
          {loading ? (
            <>
              {[1, 2, 3, 4].map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </>
          ) : (
            <>
              {mostSellers.length > 0 &&
                mostSellers.map((item, index) => (
                  <CardOne key={item._id || index} item={item} />
                ))}
            </>
          )}
        </div>
      </section>
      {/* Speciality Items Section */}
      <Specialities />
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
