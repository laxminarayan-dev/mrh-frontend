import { useState, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import App from "./App";
import Index from "./pages/Index";

import AboutUs from "./pages/AboutUs";
import Cart from "./pages/Cart";
import Auth from "./pages/Auth";
import Contact from "./pages/Contact";
import Menu from "./pages/Menu";
import Login from "./components/Login";

const Signup = lazy(() => import("./components/Signup"));
const Orders = lazy(() => import("./pages/Orders"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Checkout = lazy(() => import("./pages/Checkout"));
const ForgotPasswordForm = lazy(() => import("./components/ForgotPass"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Reviews = lazy(() => import("./pages/Reviews"));

function Routing() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
