import { useState, useEffect, lazy } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route } from "react-router-dom";
import { loadItems } from "./store/itemsSlice.js";
import App from "./App";
import Index from "./pages/Index";
import { fetchReviews } from "./store/Reviews.js";

const AboutUs = lazy(() => import("./pages/AboutUs"));
const Cart = lazy(() => import("./pages/Cart"));
const Orders = lazy(() => import("./pages/Orders"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Contact = lazy(() => import("./pages/Contact"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Menu = lazy(() => import("./pages/Menu"));
const Signup = lazy(() => import("./components/Signup"));
const Login = lazy(() => import("./components/Login"));
const ForgotPasswordForm = lazy(() => import("./components/ForgotPass"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Reviews = lazy(() => import("./pages/Reviews"));

function Routing() {
  const { items } = useSelector((state) => state.items);
  const dispatch = useDispatch();

  useEffect(() => {
    if (items.length === 0) {
      dispatch(fetchReviews());
      dispatch(loadItems());
    }
  }, [items]);

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
