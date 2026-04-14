import { useSelector } from "react-redux";
import { LogIn, UserPlus, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import Loader from "./Loader";

function SafeRoute({ children }) {
  const { isLoggedIn, loading } = useSelector((state) => state.auth);

  if (isLoggedIn) {
    return children;
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] w-full bg-gradient-to-b from-[#FFFBE9] to-orange-200 flex items-center justify-center px-2 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
        <Loader />
      </div>
    );
  }
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#FFFBE9] via-orange-100 to-orange-200 flex justify-center items-center p-2 sm:p-3 md:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl p-4 sm:p-6 md:p-8 lg:p-12 max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-4 sm:mb-5 md:mb-6">
          <div className="w-14 sm:w-16 md:w-20 lg:w-24 h-14 sm:h-16 md:h-20 lg:h-24 bg-orange-100 rounded-full flex items-center justify-center">
            <Lock className="w-7 sm:w-8 md:w-10 lg:w-12 h-7 sm:h-8 md:h-10 lg:h-12 text-orange-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-1.5 sm:mb-2 md:mb-3 leading-tight">
          Access Restricted
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-4 sm:mb-5 md:mb-6 lg:mb-8 px-1">
          You need to log in to access this page. Please sign in to your account
          or create a new one.
        </p>

        {/* Action Buttons */}
        <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
          <Link
            to="/auth/login"
            className="flex items-center justify-center gap-1.5 sm:gap-2 w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 rounded-lg transition-colors duration-200 text-xs sm:text-sm md:text-base"
          >
            <LogIn className="w-4 sm:w-4 md:w-5 md:h-5 h-4 sm:h-4 flex-shrink-0" />
            Log In
          </Link>
          <Link
            to="/auth/signup"
            className="flex items-center justify-center gap-1.5 sm:gap-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 rounded-lg transition-colors duration-200 text-xs sm:text-sm md:text-base"
          >
            <UserPlus className="w-4 sm:w-4 md:w-5 md:h-5 h-4 sm:h-4 flex-shrink-0" />
            Sign Up
          </Link>
        </div>

        {/* Divider */}
        <div className="my-3 sm:my-4 md:my-5 lg:my-6 flex items-center gap-2 sm:gap-3">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-gray-500 text-[11px] sm:text-xs md:text-sm whitespace-nowrap">
            or
          </span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Help Text */}
        <p className="text-[11px] sm:text-xs md:text-sm text-gray-500 px-1">
          Need help?{" "}
          <a
            href="/contact-us"
            className="text-orange-600 hover:underline font-semibold"
          >
            Contact us
          </a>
        </p>
      </div>
    </div>
  );
}

export default SafeRoute;
