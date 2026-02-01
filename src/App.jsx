import { Fragment, useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import {
  Camera,
  Facebook,
  IndianRupee,
  Instagram,
  Motorbike,
  PlaySquare,
  Share2,
  ShoppingBag,
  ShoppingBasket,
  Youtube,
} from "lucide-react";
import CardOne from "./components/CardOne";
import CardGrid from "./components/CardGrid";
import Footer from "./components/Footer";
import Feedback from "./components/Feedback";
import ChooseUs from "./components/ChooseUs";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState("Dosa");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [specialtyStartIndex, setSpecialtyStartIndex] = useState(0);
  const [specialtyVisibleCount, setSpecialtyVisibleCount] = useState(5);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isSidebarOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
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

  const mostSellers = [
    {
      name: "Paper Dosa",
      image: "/dosa-comp.png",
      originalPrice: 60,
      discountedPrice: 40,
    },
    {
      name: "Pav Bhaji",
      image: "/pavbhaji-comp.png",
      originalPrice: 100,
      discountedPrice: 70,
    },
    {
      name: "uttapam",
      image: "/uttapam-comp.png",
      originalPrice: 80,
      discountedPrice: 50,
    },

    // Add more items as needed
  ];
  const Specialties = [
    {
      name: "Dosa",
      image: "/dosa-icon.png",
    },
    {
      name: "Idli",
      image: "/idli-icon.png",
    },
    {
      name: "Pav Bhaji",
      image: "/pavbhaji-icon.png",
    },
    {
      name: "Noodles",
      image: "/noodles-icon.png",
    },
    {
      name: "Idli",
      image: "/idli-icon.png",
    },
    {
      name: "Pav Bhaji",
      image: "/pavbhaji-icon.png",
    },
    {
      name: "Noodles",
      image: "/noodles-icon.png",
    },
  ];
  const totalSpecialties = Specialties.length;
  const specialtyMaxStart = Math.max(
    0,
    totalSpecialties - specialtyVisibleCount,
  );
  const visibleSpecialties = Specialties.slice(
    specialtyStartIndex,
    specialtyStartIndex + specialtyVisibleCount,
  );
  const itemsBySpecialty = {
    Dosa: [
      { name: "Masala Dosa", image: "/dosa.png", originalPrice: 120 },
      { name: "Rava Dosa", image: "/masala-dosa-comp.png", originalPrice: 100 },
      { name: "Paper Dosa", image: "/dosa-comp.png", originalPrice: 60 },
      { name: "Onion Dosa", image: "/dosa.png", originalPrice: 90 },
      { name: "Cheese Dosa", image: "/dosa.png", originalPrice: 130 },
    ],
    Idli: [{ name: "Sambar Idli", image: "/idli-comp.png", originalPrice: 80 }],
    "Pav Bhaji": [
      { name: "Classic Pav Bhaji", image: "/pavbhaji.png", originalPrice: 110 },
      { name: "Cheese Pav Bhaji", image: "/pavbhaji.png", originalPrice: 130 },
    ],
    Noodles: [
      { name: "Veg Hakka Noodles", image: "/noodles.png", originalPrice: 95 },
    ],
  };

  const thaliDetails = {
    name: "Maa ki Thali",
    description: ["Chawal", "Dal", "Sabji", "Roti", "Raita", "Mithai"],
    offer: true,
    originalPrice: 110,
    offerPrice: 99,
    offerPercentage: 10,
  };

  return (
    <div className="min-h-screen  bg-[#FFFBE9]">
      <Navbar
        isSidebarOpen={isSidebarOpen}
        isLoggedIn={isLoggedIn}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      {/* sidebar and main content */}
      <div className="bg-orange-200">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          isLoggedIn={isLoggedIn}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <main className=" min-h-screen">
          {/* banner */}
          {/* <div className="relative w-full h-64 sm:h-76 md:h-96 lg:h-112 xl:h-128 flex justify-start items-center px-10 overflow-hidden">
            <img
              src="/banner.jpg"
              alt="Mr Halwai banner"
              className="absolute inset-0 w-full h-full object-cover object-center"
              fetchPriority="high"
              decoding="async"
            />

            <div className="relative md:pl-20 ">
              <h1 className="text-4xl md:text-6xl font-semibold">Mr Halwai</h1>
              <h2 className="text-lg md:text-xl ">
                Authentic Indian & Fast Food
              </h2>
              <button
                aria-label="order-now-btn"
                className="text-md md:text-xl mt-4 px-6 py-2 bg-[#FF7407] text-white font-semibold rounded hover:bg-[#F67401] transition-colors mt-2 md:mt-8"
              >
                Order Now
              </button>
            </div>
          </div> */}
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
                    Authentic Indian & Fast Food made with love and tradition.
                    Every bite tells a story of care and quality.
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
              className={
                mostSellers.length >= 4 ? "md:max-w-6xl" : "md:max-w-3xl"
              }
            >
              {mostSellers.map((item, index) => (
                <CardOne key={index} sale={true} item={item} />
              ))}
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

                <div className="flex gap-4 flex-1 justify-center">
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
                </div>

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
                itemsBySpecialty[selectedSpecialties].length >= 4
                  ? "md:max-w-6xl"
                  : "md:max-w-3xl"
              }
            >
              {itemsBySpecialty[selectedSpecialties].map((item, index) => (
                <CardOne key={index} item={item} />
              ))}
            </CardGrid>
            <p className="text-xs sm:text-sm text-gray-500 mt-4">
              Tap a category to view its signature dishes.
            </p>
          </section>
          {/* Deal of the Week */}
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
                  className=" absolute right-1/2 left-1/2  translate-x-[-6rem] md:translate-x-[0rem] translate-y-[-1rem] md:translate-y-[-3rem] w-96 md:w-110 -z-0"
                />
                {thaliDetails.offer && (
                  <div className="absolute top-4 right-4 bg-yellow-300 p-2 rounded">
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
          {/* Why Choose Us */}
          <ChooseUs />
          {/* Customer Feedback Section */}
          <Feedback />
          {/* Footer */}
          <Footer />
        </main>
      </div>
    </div>
  );
}

export default App;
