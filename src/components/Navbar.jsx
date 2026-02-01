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

function Navbar({ isSidebarOpen, isLoggedIn, setIsSidebarOpen }) {
  const links = [
    { name: "Home", url: "/", icon: <House /> },
    { name: "About Us", url: "/about", icon: <Info /> },
    { name: "Contact Us", url: "/contact", icon: <Phone /> },
    { name: "Cart", url: "/cart", icon: <ShoppingCart /> },
    { name: "Account", url: "/account", icon: <UserRound /> },
  ];
  return (
    <nav className="max-w-6xl mx-auto bg-[#FFFBE9] flex justify-between items-center px-8 py-2 h-16 relative z-100 ">
      <div className="flex justify-center items-center">
        <ChefHat color="#F67401" size={32} />
        <span className="text-2xl font-semibold text-[#F67401] ml-2">
          Mr Halwai
        </span>
      </div>
      <div>
        <ul className="hidden md:flex gap-6 text-[#F67401] font-medium">
          {links.map((link) => {
            if (link.name === "Account" && !isLoggedIn) {
              return (
                <button
                  key={link.name}
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-orange-600 transition-colors cursor-pointer"
                >
                  Login
                </button>
              );
            }
            return (
              <li
                key={link.name}
                className="text-black cursor-pointer transition-colors flex items-center gap-2"
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
