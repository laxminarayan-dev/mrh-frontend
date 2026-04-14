import React from "react";
import { Link } from "react-router-dom";
import { TriangleAlert } from "lucide-react";

function NotFound() {
  return (
    <div className="min-h-[100vh] w-full flex items-center justify-center px-2 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12 bg-gradient-to-br from-[#FFFBE9] via-orange-100 to-amber-100\">
      <div className="max-w-lg w-full text-center">
        <div className="mx-auto mb-3 sm:mb-4 md:mb-5 flex h-12 sm:h-14 md:h-16 w-12 sm:w-14 md:w-16 items-center justify-center rounded-lg sm:rounded-xl md:rounded-2xl bg-orange-100 text-orange-600 shadow-sm">
          <TriangleAlert size={24} className="sm:w-6 md:w-7 sm:h-6 md:h-7" />
        </div>
        <p className="text-[9px] sm:text-xs md:text-sm font-semibold uppercase tracking-widest text-orange-500">
          404 Error
        </p>
        <h1 className="mt-2 sm:mt-2.5 md:mt-3 text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight px-1">
          Page not found
        </h1>
        <p className="mt-2 sm:mt-2.5 md:mt-3 text-xs sm:text-sm md:text-base text-slate-600 px-2">
          The page you are looking for doesn’t exist or was moved. Let’s get you
          back to something tasty.
        </p>
        <div className="mt-4 sm:mt-5 md:mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold text-white shadow-md transition-all hover:from-orange-600 hover:to-orange-700"
          >
            Back to Home
          </Link>
          <Link
            to="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-orange-200 bg-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base font-semibold text-orange-600 transition-all hover:border-orange-300 hover:bg-orange-50"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
