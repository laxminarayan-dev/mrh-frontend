import {
  Logs,
  X,
  House,
  Info,
  Phone,
  ShoppingCart,
  Package,
  UserRound,
  ChefHat,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function Navbar({ isSidebarOpen, isLoggedIn, setIsSidebarOpen }) {
  const navigate = useNavigate();
  const links = [
    { name: "Home", url: "/", icon: <House /> },
    { name: "About Us", url: "/about", icon: <Info /> },
    { name: "Contact Us", url: "/contact", icon: <Phone /> },
    { name: "Cart", url: "/cart", icon: <ShoppingCart /> },
    { name: "Account", url: "/account", icon: <UserRound /> },
  ];
  return (
    <nav className="w-full max-w-6xl mx-auto bg-[#FFFBE9] flex justify-between items-center px-8 py-2 h-16 relative z-100 ">
      <div className="flex justify-center items-center">
        <ChefHat color="#F67401" size={32} />
        <Link to="/" className="text-2xl font-semibold text-[#F67401] ml-2">
          Mr Halwai
        </Link>
      </div>
      <div>
        <ul className="hidden md:flex gap-6 text-[#F67401] font-medium">
          {links.map((link) => {
            if (link.name === "Account" && !isLoggedIn) {
              return (
                <button
                  key={link.name}
                  onClick={() => {
                    navigate("/auth");
                  }}
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-orange-600 transition-colors cursor-pointer"
                >
                  Login
                </button>
              );
            }
            return (
              <li
                key={link.name}
                onClick={() => navigate(link.url)}
                className="relative text-black cursor-pointer transition-colors flex items-center gap-2 pb-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#F67401] after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                {link.name}
              </li>
            );
          })}
        </ul>
        <div className="md:hidden">
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="text-[#FF7407]"
          >
            {isSidebarOpen ? <X /> : <Logs />}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
