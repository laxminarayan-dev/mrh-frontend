import { Fragment, useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import {
  Car,
  Handbag,
  IndianRupee,
  Motorbike,
  ShoppingBag,
  ShoppingBasket,
} from "lucide-react";
import CardOne from "./components/CardOne";
import CardGrid from "./components/CardGrid";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState("Dosa");
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
    <Fragment>
      <Navbar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      {/* sidebar and main content */}
      <div className="bg-orange-200">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
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
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <h3 className="text-lg font-semibold text-gray-900">
                      {title}
                    </h3>
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
                Order Now
              </button>
            </div>
          </section>

          {/* Customer Feedback Section */}
          <section className="max-w-6xl mx-auto px-4 mb-8 pt-12">
            <div className="text-center mb-12">
              <p className="text-sm uppercase tracking-widest text-[#F67401] font-semibold">
                Customer Love
              </p>
              <h2 className="font-semibold text-4xl md:text-5xl text-gray-900 mt-2">
                What Our Customers Say
              </h2>
              <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
                Join thousands of happy customers enjoying authentic flavors
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: "Priya Sharma",
                  initial: "P",
                  rating: 5,
                  feedback:
                    "Best dosa I've ever had! Fresh, crispy, and absolutely delicious. Will definitely order again!",
                },
                {
                  name: "Rajesh Kumar",
                  initial: "R",
                  rating: 5,
                  feedback:
                    "Fast delivery and hot food. The thali is amazing value for money. Highly recommended!",
                },
                {
                  name: "Anjali Patel",
                  initial: "A",
                  rating: 4,
                  feedback:
                    "Great authentic taste, friendly service. The Pav Bhaji is outstanding. 10/10!",
                },
              ].map((feedback, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#FF7407] to-[#F6A51A] flex items-center justify-center text-white font-bold text-lg">
                      {feedback.initial}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {feedback.name}
                      </h4>
                      <div className="flex gap-0.5">
                        {[...Array(feedback.rating)].map((_, i) => (
                          <span key={i} className="text-yellow-400">
                            ⭐
                          </span>
                        ))}
                        {[...Array(5 - feedback.rating)].map((_, i) => (
                          <span key={i} className="text-gray-300">
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    "{feedback.feedback}"
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <button className="px-8 py-3 bg-[#FF7407] text-white font-semibold rounded-full hover:bg-[#F67401] transition-colors shadow-sm">
                View All Reviews
              </button>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-gray-900 text-gray-300 mt-16">
            <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                {/* Brand */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white">Mr Halwai</h3>
                  <p className="text-sm text-gray-400">
                    Authentic Indian & Fast Food, crafted with love and
                    tradition.
                  </p>
                  <div className="flex gap-3 pt-2">
                    {[
                      { name: "Facebook", icon: "f" },
                      { name: "Instagram", icon: "ig" },
                      { name: "Twitter", icon: "tw" },
                    ].map((social) => (
                      <button
                        key={social.name}
                        className="h-9 w-9 rounded-full bg-[#FF7407] hover:bg-[#F67401] transition-colors flex items-center justify-center text-white"
                        aria-label={social.name}
                      >
                        {social.icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Links */}
                <div>
                  <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                  <ul className="space-y-2">
                    {[
                      "About Us",
                      "Our Menu",
                      "Delivery Info",
                      "Contact Us",
                    ].map((link) => (
                      <li key={link}>
                        <a
                          href="#"
                          className="text-sm hover:text-[#FF7407] transition-colors"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Support */}
                <div className="hidden">
                  <h4 className=" text-white font-semibold mb-4">Support</h4>
                  <ul className="space-y-2">
                    {["FAQ", "Track Order", "Returns", "Feedback"].map(
                      (link) => (
                        <li key={link}>
                          <a
                            href="#"
                            className="text-sm hover:text-[#FF7407] transition-colors"
                          >
                            {link}
                          </a>
                        </li>
                      ),
                    )}
                  </ul>
                </div>

                {/* Contact */}
                <div>
                  <h4 className="text-white font-semibold mb-4">
                    Get in Touch
                  </h4>
                  <ul className="space-y-3 text-sm">
                    <li className="flex gap-2">
                      <span className="text-[#FF7407]">📞</span>
                      <span>+91 98765 43210</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#FF7407]">📧</span>
                      <span>hello@mrhalwai.com</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#FF7407]">📍</span>
                      <span>123 Food Street, Delhi</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#FF7407]">⏰</span>
                      <span>11 AM - 11 PM</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="border-t border-gray-700 py-6 mb-6">
                <p className="text-sm text-gray-400 mb-3">
                  We accept cash only
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="px-4 py-2 bg-[#FF7407] border border-orange-400 rounded-full text-sm font-semibold text-slate-900">
                    Cash
                  </div>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                <p>© 2026 Mr Halwai. All rights reserved.</p>
                <div className="flex gap-4 mt-4 md:mt-0">
                  <a
                    href="#"
                    className="hover:text-[#FF7407] transition-colors"
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="#"
                    className="hover:text-[#FF7407] transition-colors"
                  >
                    Terms & Conditions
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </Fragment>
  );
}

export default App;
