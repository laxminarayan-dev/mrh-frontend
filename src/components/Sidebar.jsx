import { Fragment } from "react";
import {
  House,
  Info,
  Phone,
  ShoppingCart,
  Package,
  UserRound,
} from "lucide-react";

function Sidebar({
  isSidebarOpen = false,
  currentPage = "home",
  isLoggedIn,
  setIsSidebarOpen,
}) {
  const links = [
    { name: "Home", url: "/", icon: <House /> },
    { name: "About Us", url: "/about", icon: <Info /> },
    { name: "Contact Us", url: "/contact", icon: <Phone /> },
    { name: "Cart", url: "/cart", icon: <ShoppingCart /> },
    { name: "Orders", url: "/orders", icon: <Package /> },
    { name: "Account", url: "/account", icon: <UserRound /> },
  ];

  return (
    <Fragment>
      <div
        onClick={() => {
          setIsSidebarOpen(false);
        }}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-90 md:hidden ${isSidebarOpen ? "block" : "hidden"}`}
      ></div>
      <div
        className={`bg-[#FFFBE9] text-slate-700 px-4 py-8 h-[calc(100dvh-4rem)] w-64 flex flex-col gap-6 justify-start fixed z-100 md:hidden top-16 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} shadow-2xl border border-slate-200/60 md:static md:top-0 md:translate-x-0 md:h-full md:shadow-none md:border-none md:rounded-none`}
      >
        <nav>
          <ul className="flex flex-col gap-1">
            {links.map((link) => {
              if (link.name === "Account" && !isLoggedIn) {
                return (
                  <button
                    key={link.name}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 cursor-pointer font-medium text-sm mt-2"
                  >
                    Login
                  </button>
                );
              }
              return (
                <li
                  className={` group flex justify-start items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${currentPage.toLowerCase() === link.name.toLowerCase() ? "text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg" : "text-slate-700 hover:text-orange-600 hover:bg-orange-50 border border-transparent hover:border-orange-200"}`}
                  key={link.name}
                  onClick={() => {
                    setIsSidebarOpen(false);
                  }}
                >
                  <button
                    aria-label="sidebar-button"
                    className="flex justify-start items-center gap-3 w-full"
                  >
                    <span
                      className={`${
                        currentPage.toLowerCase() === link.name.toLowerCase()
                          ? "text-white"
                          : "text-orange-500 group-hover:text-orange-600"
                      }`}
                    >
                      {link.icon}
                    </span>
                    <span className="text-sm font-medium">{link.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </Fragment>
  );
}

export default Sidebar;
