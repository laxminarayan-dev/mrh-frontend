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
  setIsSidebarOpen,
}) {
  const links = [
    { name: "Home", url: "/dashboard", icon: <House /> },
    { name: "About Us", url: "/tasks", icon: <Info /> },
    { name: "Contact Us", url: "/tasks", icon: <Phone /> },
    { name: "Cart", url: "/settings", icon: <ShoppingCart /> },
    { name: "Orders", url: "/tasks", icon: <Package /> },
    { name: "Account", url: "/settings", icon: <UserRound /> },
  ];

  return (
    <Fragment>
      <div
        onClick={() => {
          setIsSidebarOpen(false);
        }}
        className={`fixed inset-0 bg-gray-900/80 z-10 md:hidden ${isSidebarOpen ? "block" : "hidden"}`}
      ></div>
      <div
        className={`bg-[#FFFBE9] text-[#F67401] px-4 py-8 h-screen w-52 flex flex-col gap-8 justify-start fixed z-20 md:hidden top-16 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} shadow-lg border-t border-[#F67401]/50 md:static md:top-0 md:translate-x-0 md:h-full md:shadow-none md:border-none`}
      >
        <nav>
          <ul className="flex flex-col gap-2">
            {links.map((link) => (
              <li
                className={`flex justify-start items-center gap-2 px-2 py-1 rounded-sm ${currentPage.toLowerCase() === link.name.toLowerCase() ? "text-gray-50 bg-[#FF7407] border-l-4 border-[#F67401] font-semibold" : "text-[#F67401] hover:text-[#FF7407] hover:bg-[#FF7407]/10"}`}
                key={link.name}
                onClick={() => {
                  setIsSidebarOpen(false);
                  // setCurrentPage(link.name.toLocaleLowerCase());
                }}
              >
                <button
                  aria-label="sidebar-button"
                  className="flex justify-start items-center gap-2 p-2"
                >
                  {link.icon} {link.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </Fragment>
  );
}

export default Sidebar;
