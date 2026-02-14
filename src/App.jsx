import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import { Outlet, useLocation } from "react-router-dom";
import { Book, House, Info, Phone } from "lucide-react";
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateCartData,
  fetchCartItems,
  addBulkItems,
} from "./store/cartSlice";
import Cookies from "js-cookie";
import { socket } from "./socket";
import { getShopData, setInRange } from "./store/shopSlice";
import LoaderComp from "./components/Loader";
import { getDistanceKm } from "./components/Direction";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items, synced } = useSelector((state) => state.cart);
  const timerRef = useRef(null);

  const links = [
    { name: "Home", url: "/", icon: <House /> },
    { name: "Menu", url: "/menu", icon: <Book /> },
    { name: "About Us", url: "/about-us", icon: <Info /> },
    { name: "Contact Us", url: "/contact-us", icon: <Phone /> },
  ];

  // useEffect(() => {
  //   if (!socket.connected) {
  //     socket.connect();
  //   }
  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);
  // useEffect(() => {
  //   socket.on("connect", () => {
  //     if (isAuthenticated && user?._id) {
  //       console.log("Joining private room:", user._id);
  //       socket.emit("join-user-room", user._id);
  //     } else {
  //       console.log("Leaving private room");
  //       socket.emit("leave-user-room");
  //     }
  //   });
  // }, [isAuthenticated, user]);

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
      dispatch(addBulkItems(storedCartItems));
      dispatch(updateCartData())
        .unwrap()
        .then(() => {
          dispatch(fetchCartItems()); // 👈 THIS IS MISSING
        });
    }
  }, [isAuthenticated]);

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

  // Setting Unsaved Cookies when login or signup
  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) return; // ❌ not logged in
    if (synced) return; // ❌ already synced

    // clear previous debounce
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // debounce 3s
    timerRef.current = setTimeout(() => {
      dispatch(updateCartData());
    }, 3000);

    return () => clearTimeout(timerRef.current);
  }, [items, synced, dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(fetchCartItems());
    }
  }, [isAuthenticated, user, dispatch]);

  const { tempAddress } = useSelector((state) => state.auth);
  const { loading: ShopLoading } = useSelector((state) => state.shop);
  const shopCoords = [
    { id: 1, name: "Narora Outlet", position: [28.203822, 78.374228] },
    { id: 2, name: "Debai Outlet 1", position: [28.203326, 78.267783] },
    { id: 3, name: "Debai Outlet 2", position: [28.207438, 78.253838] },
  ];
  const range = 10; // km

  // Finding nearest shop and verifying range
  useEffect(() => {
    if (tempAddress) {
      let nearest = shopCoords[0];
      let min = Infinity;
      for (const o of shopCoords) {
        const d = getDistanceKm(tempAddress.coordinates, o.position);
        if (d < min) {
          min = d;
          nearest = o;
        }
      }
      if (min > range) {
        dispatch(setInRange(false));
      } else {
        dispatch(setInRange(true));
      }
      console.log("nearest outlet ", nearest.name);
      dispatch(getShopData(nearest.position.join(",")));
    }
  }, [tempAddress]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#FFFBE9]">
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
