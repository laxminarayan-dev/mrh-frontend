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
import Reviews from "./pages/Reviews";

function Routing() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

  return (
    <Routes>
      <Route element={<App isLoggedIn={isLoggedIn} />}>
        <Route path="/" element={<Index />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<Contact />} />
        <Route path="/menu" element={<Menu />} />
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
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default Routing;
