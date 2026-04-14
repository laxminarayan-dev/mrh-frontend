import { useRef } from "react";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import { Book, House, Info, Phone } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateCartData,
  fetchCartItems,
  addBulkItems,
  updateOrderInStore,
} from "./store/cartSlice";
import {
  setInRange,
  setDeliveryShop,
  updateShopsData,
} from "./store/shopSlice";
import { loadItems } from "./store/itemsSlice";

import { socket } from "./socket";
import LoaderComp from "./components/Loader";
import { Outlet, useLocation } from "react-router-dom";
import { getDistanceKm } from "./components/Direction";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items, synced } = useSelector((state) => state.cart);
  const timerRef = useRef(null);
  const { tempAddress } = useSelector((state) => state.auth);
  const {
    loading: ShopLoading,
    shopsData,
    deliveryShop,
  } = useSelector((state) => state.shop);
  const [shopCoords, setShopCoords] = useState([]);

  const links = [
    { name: "Home", url: "/", icon: <House /> },
    { name: "Menu", url: "/menu", icon: <Book /> },
    { name: "About Us", url: "/about-us", icon: <Info /> },
    { name: "Contact Us", url: "/contact-us", icon: <Phone /> },
  ];

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    socket.on("connect", () => {
      if (isAuthenticated && user?._id) {
        console.log("Joining private room:", user._id);
        socket.emit("join-user-room", user._id);
      } else {
        console.log("Leaving private room");
        socket.emit("leave-user-room");
      }
    });
    socket.on("shop-updated", (updatedShop) => {
      dispatch(updateShopsData(updatedShop));
    });
    socket.on("order-updated", (updatedOrder) => {
      dispatch(updateOrderInStore(updatedOrder));
    });
    socket.on("payment-updated", (updatedOrder) => {
      console.log("💳 Payment updated globally:", updatedOrder.paymentStatus);
      dispatch(updateOrderInStore(updatedOrder));
    });
    socket.on("item-updated", () => {
      dispatch(loadItems());
    });
    socket.on("item-deleted", () => {
      dispatch(loadItems());
    });

    return () => {
      socket.off("connect");
      socket.off("shop-updated");
      socket.off("order-updated");
      socket.off("payment-updated");
      socket.off("item-updated");
      socket.off("item-deleted");
    };
  }, [isAuthenticated, user, dispatch]);

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      let storedCartItems = [];
      try {
        const raw = localStorage.getItem("cartData");
        storedCartItems = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(storedCartItems)) {
          storedCartItems = [];
        }
      } catch (error) {
        storedCartItems = [];
      }
      // dispatch(addBulkItems(storedCartItems));
      // dispatch(updateCartData())
      // .unwrap()
      // .then(() => {
      // dispatch(fetchCartItems());
      // });
    }
  }, [isAuthenticated, user, dispatch]);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isSidebarOpen]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Setting Unsaved Token when login or signup
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return; // ❌ not logged in
    if (synced) return; // ❌ already synced

    // clear previous debounce
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // debounce 3s
    // timerRef.current = setTimeout(() => {
    //   dispatch(updateCartData());
    // }, 3000);

    return () => clearTimeout(timerRef.current);
  }, [items, synced, dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(fetchCartItems());
    }
  }, [isAuthenticated, user, dispatch]);

  useEffect(() => {
    // Handle both array and { shops: Array } structure
    const shops = Array.isArray(shopsData)
      ? shopsData
      : (shopsData?.shops ?? []);
    if (shops.length > 0) {
      setShopCoords(shops);
    }
  }, [shopsData]);

  // Finding nearest shop and verifying range
  useEffect(() => {
    if (tempAddress) {
      if (shopCoords.length === 0) return;
      let nearest = shopCoords[0];
      let min = Infinity;
      for (const o of shopCoords) {
        const loc = o?.shopLocation;
        if (!loc?.coordinates && !(loc?.lat && loc?.lng)) continue;

        const coords = loc.coordinates
          ? [loc.coordinates[1], loc.coordinates[0]]
          : [loc.lat, loc.lng];

        const d = getDistanceKm(tempAddress.coordinates, coords);
        if (d < min) {
          min = d;
          nearest = o;
        }
      }

      const shopRange = nearest.shopDeliveryRange || DELIVERY_RANGE_KM;
      if (min > parseInt(shopRange)) {
        dispatch(setInRange(false));
      } else {
        dispatch(setInRange(true));
      }
      dispatch(setDeliveryShop(nearest));
    }
  }, [tempAddress, shopCoords, dispatch]);

  return (
    <div className="min-h-dvh flex flex-col bg-[#FFFBE9]">
      <Navbar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        links={links}
      />
      {/* sidebar and main content */}
      <div className="bg-orange-200 flex-1">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          links={links}
        />
        <main>
          {ShopLoading && <LoaderComp />}
          <Outlet />
        </main>
        {/* Footer */}
      </div>
      <Footer />
    </div>
  );
}

export default App;
