import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AboutUs from "./pages/AboutUs";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Auth from "./pages/Auth";
import App from "./App";
import NotFound from "./pages/NotFound";
import Contact from "./pages/Contact";
import Checkout from "./pages/Checkout";
import Menu from "./pages/Menu";
import Signup from "./components/Signup";
import Login from "./components/Login";
import { useEffect, useState } from "react";
import ForgotPasswordForm from "./components/ForgotPass";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";

function Routing() {
  const [selectedSpecialties, setSelectedSpecialties] = useState("Dosa");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [specialtyStartIndex, setSpecialtyStartIndex] = useState(0);
  const [specialtyVisibleCount, setSpecialtyVisibleCount] = useState(5);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 440) {
        setSpecialtyVisibleCount(2);
      }
      else if (window.innerWidth < 1024) {
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

  return (
    <Routes>
      <Route element={<App isLoggedIn={isLoggedIn} />}>
        <Route
          path="/"
          element={
            <Index
              mostSellers={mostSellers}
              Specialties={Specialties}
              itemsBySpecialty={itemsBySpecialty}
              selectedSpecialties={selectedSpecialties}
              setSelectedSpecialties={setSelectedSpecialties}
              specialtyStartIndex={specialtyStartIndex}
              specialtyVisibleCount={specialtyVisibleCount}
              setSpecialtyStartIndex={setSpecialtyStartIndex}
              specialtyMaxStart={specialtyMaxStart}
              visibleSpecialties={visibleSpecialties}
            />
          }
        />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route
          path="/orders/:orderId"
          element={<div>Order Details Page</div>}
        />
        <Route path="checkout" element={<Checkout />} />
        <Route path="/account" element={<div>Account Page</div>} />
        <Route path="/auth" element={<Auth />}>
          <Route index element={<Login />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="forgot-password" element={<ForgotPasswordForm />} />
        </Route>
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default Routing;
