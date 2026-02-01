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

function Navbar({ isSidebarOpen, setIsSidebarOpen }) {
  const links = [
    { name: "Home", url: "/dashboard", icon: <House /> },
    { name: "About Us", url: "/tasks", icon: <Info /> },
    { name: "Contact Us", url: "/tasks", icon: <Phone /> },
    { name: "Cart", url: "/settings", icon: <ShoppingCart /> },
    { name: "Orders", url: "/tasks", icon: <Package /> },
    { name: "Account", url: "/settings", icon: <UserRound /> },
  ];
  return (
    <nav className="bg-[#FFFBE9] flex justify-between items-center px-4 py-2 h-16 relative z-30 ">
      <div className="flex justify-center items-center">
        <ChefHat color="#F67401" size={32} />
        <span className="text-2xl font-semibold text-[#F67401] ml-2">
          Mr Halwai
        </span>
      </div>
      <div>
        <ul className="hidden md:flex gap-6 text-[#F67401] font-medium">
          {links.map((link) => (
            <li
              key={link.name}
              className="text-black cursor-pointer transition-colors flex items-center gap-2"
            >
              {link.name}
            </li>
          ))}
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
