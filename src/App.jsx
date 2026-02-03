import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import { Outlet } from "react-router-dom";
import {
  Book,
  House,
  Info,
  Phone,
  ShoppingCart,
  UserRound,
} from "lucide-react";

function App({ isLoggedIn = false }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const links = [
    { name: "Home", url: "/", icon: <House /> },
    { name: "Menu", url: "/menu", icon: <Book /> },
    { name: "About Us", url: "/about-us", icon: <Info /> },
    { name: "Contact Us", url: "/contact-us", icon: <Phone /> },
    { name: "Cart", url: "/cart", icon: <ShoppingCart /> },
    { name: "Account", url: "/account", icon: <UserRound /> },
  ];
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isSidebarOpen]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#FFFBE9]">
      <Navbar
        isSidebarOpen={isSidebarOpen}
        isLoggedIn={isLoggedIn}
        setIsSidebarOpen={setIsSidebarOpen}
        links={links}
      />
      {/* sidebar and main content */}
      <div className="bg-orange-200 flex-1">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          isLoggedIn={isLoggedIn}
          setIsSidebarOpen={setIsSidebarOpen}
          links={links}
        />
        <main>
          <Outlet />
        </main>
        {/* Footer */}
      </div>
      <Footer />
    </div>
  );
}

export default App;
