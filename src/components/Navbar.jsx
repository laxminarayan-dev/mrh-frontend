import { Logs, X, ChefHat, UserRound, ShoppingBasket, ChevronDown, ChevronDownCircle, ChevronsDown, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

function Navbar({ isSidebarOpen, setIsSidebarOpen, links }) {
  const navigate = useNavigate();
  const { isLoggedIn, tempAddress } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const [address, setAddress] = useState(null);
  const { inRange } = useSelector((state) => state.shop);
  const displayAddress = address || "Set delivery location";

  const handleLocationChange = (event) => {
    if (event.target.value !== "change") return;
    sessionStorage.removeItem("locationChoice");
    sessionStorage.removeItem("locationChoiceTime");
    sessionStorage.removeItem("userCoords");
    window.dispatchEvent(new Event("open-location-gate"));
    event.target.value = "keep";
  };

  useEffect(() => {
    if (tempAddress) {
      setAddress(tempAddress.formattedAddress);
    }
  }, [tempAddress])

  return (
    <>
      <nav className=" w-full max-w-6xl mx-auto bg-[#FFFBE9] flex justify-between items-center px-8 py-2 h-16 relative z-100 ">
        <div className="flex justify-center items-center">
          <ChefHat color="#F67401" size={32} />
          <Link to="/" className="text-2xl font-semibold text-[#F67401] ml-2 ">
            Mr Halwai
          </Link>
        </div>
        <div className="flex items-center gap-4">
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
          <div className="flex items-center gap-8 ">
            <button
              aria-label="Cart Button"
              onClick={() => navigate("/cart")}
              className="cursor-pointer text-[#FF7407] relative hover:text-[#FF7407] transition-colors"
            >
              <ShoppingBasket size={26} />
              <span className="absolute -top-1 -right-3 bg-[#FF7407] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center ">
                {items.length}
              </span>
            </button>

            {isLoggedIn ? (
              <button
                aria-label="Account Button"
                onClick={() => navigate("/account")}
                className="cursor-pointer text-[#FF7407] relative border border-[#FF7407] rounded-full p-1 hover:bg-[#FF7407] hover:text-white transition-colors"
              >
                <UserRound size={20} />
              </button>
            ) : (
              <button
                onClick={() => {
                  navigate("/auth");
                  setIsSidebarOpen(false);
                }}
                className="hidden md:block w-full text-left bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 cursor-pointer font-medium text-sm mt-2"
              >
                Login
              </button>
            )}
            <button
              aria-label="Toggle Sidebar"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="md:hidden text-[#FF7407] relative"
            >
              {isSidebarOpen ? <X /> : <Logs />}
            </button>
          </div>
        </div>
      </nav>
      <div className="mx-6 mt-2 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-6 rounded-full border border-orange-200 bg-[#FFF7DC] px-4 py-2 text-sm text-slate-700 shadow-sm">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <MapPin size={16} className="text-orange-500 flex-shrink-0" />
            <span className="truncate">{displayAddress}</span>
          </div>
          <div className="relative flex items-center flex-shrink-0">
            <select
              aria-label="Change delivery location"
              defaultValue="keep"
              onChange={handleLocationChange}
              className="appearance-none bg-transparent text-orange-600 font-medium focus:outline-none pl-2 pr-5"
            >
              <option value="keep">Current</option>
              <option value="change">Change location</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-1 text-orange-600" />
          </div>
        </div>
        {inRange === false && (
          <div className="px-3 py-1 flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-red-600 font-medium">Sorry, we don't deliver to your location yet.</span>
          </div>
        )}
      </div>

    </>
  );
}

export default Navbar;
