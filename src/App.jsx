import { Fragment, useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Handbag } from "lucide-react";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState("Dosa");
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isSidebarOpen]);

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
  ];

  return (
    <Fragment>
      <Navbar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      {/* sidebar and main content */}
      <div className="bg-orange-200 pb-10">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <main className=" min-h-screen">
          {/* banner */}
          <div className="relative w-full h-64 sm:h-76 md:h-96 lg:h-112 xl:h-128 flex justify-start items-center px-10 overflow-hidden">
            <img
              src="/compBanner.jpg"
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
          </div>
          {/* Hero Section */}
          <header className="bg-gradient-to-b from-[#FFFBE9] to-orange-200">
            <div className="max-w-6xl mx-auto py-8 px-10">
              <h1 className="text-4xl md:text-5xl font-semibold text-[#F67401] ">
                Taste The Authenticity
              </h1>
              <p className="text-xl text-[#FF7407] mb-2">
                We server food made with love and tradition.
              </p>
              <p className="text-gray-700">
                Craving delicious dosa, uttapam, idli, pav bhaji & more? Order
                now!
              </p>
            </div>
          </header>

          <section className="py-4 text-center">
            <h1 className="font-semibold text-4xl border-b-4 border-[#FF7407] inline">
              Best Sellers
            </h1>

            <div
              className={` max-w-3xl ${mostSellers.length >= 4 ? "md:max-w-6xl" : "md:max-w-3xl"} mx-auto px-10 my-8 bg-transparent grid gap-2 place-items-center self-center `}
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              }}
            >
              {mostSellers.map((item, index) => (
                <div
                  key={index}
                  className="relative border-3 border-[#FF7407] rounded-2xl p-4 flex flex-col items-center text-left w-48 md:w-52 bg-orange-100 my-1"
                >
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Sale
                  </span>
                  {/* image */}
                  <img className="w-30 h-30" src={item.image} alt={item.name} />
                  {/* Name */}
                  <h1 className="self-start font-semibold text-md mt-2">
                    {item.name}
                  </h1>
                  {/* price */}
                  <span className="flex justify-start items-center gap-2 self-start">
                    <p className="line-through text-sm text-red-500">₹60</p>
                    <p className="font-semibold text-lg">₹40</p>
                  </span>

                  <button
                    aria-label="add-to-cart-btn"
                    className="absolute bottom-2 right-2 bg-red-500 text-white p-2 rounded-xl hover:bg-[#F67401] transition-colors"
                  >
                    <Handbag color="#fff" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Featured Items Section */}
          <section className="max-w-6xl mx-auto px-10 mb-8 bg-transparent pt-6 text-center">
            <h1 className="font-semibold text-4xl border-b-4 border-[#FF7407] inline">
              Our Specialties
            </h1>

            <div className="max-w-xl mx-auto grid grid-cols-4 mt-10 gap-4">
              {Specialties.map((specialty, index) => (
                <div
                  key={index}
                  className={`w-22 sm:w-26  p-2 ${selectedSpecialties === specialty.name ? "border-b-4 border-[#FF7407]" : ""} cursor-pointer`}
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

            <div className="hidden grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
              {/* Dosa Card */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-[#FF7407] to-[#F67401] h-32 flex items-center justify-center">
                  <span className="text-4xl">🥘</span>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-[#F67401] mb-2">
                    Masala Dosa
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Crispy dosa filled with spiced potato filling
                  </p>
                  <p className="text-lg font-bold text-[#FF7407]">₹120</p>
                </div>
              </div>

              {/* Uttapam Card */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-[#FF7407] to-[#F67401] h-32 flex items-center justify-center">
                  <span className="text-4xl">🥞</span>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-[#F67401] mb-2">
                    Onion Uttapam
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Thick pancake topped with fresh vegetables
                  </p>
                  <p className="text-lg font-bold text-[#FF7407]">₹100</p>
                </div>
              </div>

              {/* Idli Card */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-[#FF7407] to-[#F67401] h-32 flex items-center justify-center">
                  <span className="text-4xl">🍚</span>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-[#F67401] mb-2">
                    Sambar Idli
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Fluffy steamed cakes with hot sambar
                  </p>
                  <p className="text-lg font-bold text-[#FF7407]">₹80</p>
                </div>
              </div>

              {/* Pav Bhaji Card */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-[#FF7407] to-[#F67401] h-32 flex items-center justify-center">
                  <span className="text-4xl">🥔</span>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-[#F67401] mb-2">
                    Pav Bhaji
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Spiced vegetable curry with buttered bread
                  </p>
                  <p className="text-lg font-bold text-[#FF7407]">₹90</p>
                </div>
              </div>

              {/* Vada Card */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-[#FF7407] to-[#F67401] h-32 flex items-center justify-center">
                  <span className="text-4xl">🍩</span>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-[#F67401] mb-2">
                    Medu Vada
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Crispy lentil donuts with chutney
                  </p>
                  <p className="text-lg font-bold text-[#FF7407]">₹60</p>
                </div>
              </div>

              {/* Samosa Card */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-[#FF7407] to-[#F67401] h-32 flex items-center justify-center">
                  <span className="text-4xl">🥟</span>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-[#F67401] mb-2">
                    Samosa
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Crispy triangular pastry with spiced filling
                  </p>
                  <p className="text-lg font-bold text-[#FF7407]">₹40</p>
                </div>
              </div>
            </div>
          </section>
          {/* Why Choose Us */}
          <section className="max-w-6xl mx-auto px-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-8 border-l-4 border-[#FF7407]">
              <h2 className="text-2xl font-semibold mb-4 text-[#F67401]">
                Why Choose Us?
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Fresh ingredients prepared daily</li>
                <li>Authentic recipes passed down through generations</li>
                <li>Fast & reliable delivery service</li>
                <li>Affordable prices with premium quality</li>
                <li>Pure vegetarian food served</li>
                <li>No preservatives or artificial additives</li>
                <li>Eco-friendly packaging</li>
                <li>Hygienic preparation and handling</li>
              </ul>
            </div>
          </section>
        </main>
      </div>
    </Fragment>
  );
}

export default App;
