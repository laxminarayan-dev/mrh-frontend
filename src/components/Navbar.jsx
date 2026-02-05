import { Logs, X, ChefHat, ShoppingBag, ShoppingBasket } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

function Navbar({ isSidebarOpen, isLoggedIn, setIsSidebarOpen, links }) {
  const navigate = useNavigate();
  const { items } = useSelector((state) => state.cart);

  return (
    <nav className=" w-full max-w-6xl mx-auto bg-[#FFFBE9] flex justify-between items-center px-8 py-2 h-16 relative z-100 ">
      <div className="flex justify-center items-center">
        <ChefHat color="#F67401" size={32} />
        <Link to="/" className="text-2xl font-semibold text-[#F67401] ml-2 ">
          Mr Halwai
        </Link>
      </div>
      <div>
        <ul className="hidden md:flex gap-6 text-[#F67401] font-medium">
          {links.map((link) => {
            if (link.name === "Account" && !isLoggedIn) {
              return (
                <li key={link.name}>
                  <button
                    onClick={() => {
                      navigate("/auth");
                    }}
                    aria-label="Login button"
                    className="bg-orange-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-orange-600 transition-colors cursor-pointer"
                  >
                    Login
                  </button>
                </li>
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
        <div className="md:hidden flex items-center gap-8 ">
          <button
            aria-label="Cart Button"
            onClick={() => navigate("/cart")}
            className="text-[#FF7407] relative"
          >
            <ShoppingBasket size={26} />
            <span className="absolute -top-1 -right-3 bg-[#FF7407] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{items.length}</span>
          </button>

          <button
            aria-label="Toggle Sidebar"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="text-[#FF7407] relative"
          >
            {isSidebarOpen ? <X /> : <Logs />}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
