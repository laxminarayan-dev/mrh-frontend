import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store.js";
import { fetchReviews } from "./store/reviewSlice.js";
import { loadItems } from "./store/itemsSlice.js";
import { fetchCartItems } from "./store/cartSlice.js";
import { startInitialAuth } from "./store/authSlice.js";
import Routing from "./Routing.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

store.dispatch(startInitialAuth());
store.dispatch(fetchReviews());
store.dispatch(loadItems());
store.dispatch(fetchCartItems());

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter>
      <ScrollToTop />
      <Routing />
    </BrowserRouter>
  </Provider>,
);
