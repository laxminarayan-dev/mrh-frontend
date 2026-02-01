import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import { Outlet } from "react-router-dom";

function App({ isLoggedIn = false }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      />
      {/* sidebar and main content */}
      <div className="bg-orange-200 flex-1">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          isLoggedIn={isLoggedIn}
          setIsSidebarOpen={setIsSidebarOpen}
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

/* <Index
  mostSellers={mostSellers}
  Specialties={Specialties}
  itemsBySpecialty={itemsBySpecialty}
  selectedSpecialties={selectedSpecialties}
  setSelectedSpecialties={setSelectedSpecialties}
  specialtyStartIndex={specialtyStartIndex}
  specialtyVisibleCount={specialtyVisibleCount}
  setSpecialtyStartIndex={setSpecialtyStartIndex}
  specialtyMaxStart={specialtyMaxStart}
  visibleSpecialties={visibleSpecialties}
/>; */
