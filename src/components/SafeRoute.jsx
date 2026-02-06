import { useSelector } from "react-redux";
import { LogIn, UserPlus, Lock } from "lucide-react";
import { Link } from "react-router-dom";

function SafeRoute({ children }) {
  const { isLoggedIn } = useSelector((state) => state.auth);

  if (isLoggedIn) {
    return children;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#FFFBE9] via-orange-100 to-orange-200  flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
            <Lock className="w-10 h-10 text-orange-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Access Restricted
        </h1>
        <p className="text-gray-600 mb-8">
          You need to log in to access this page. Please sign in to your account
          or create a new one.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to="/auth/login"
            className="flex items-center justify-center gap-2 w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            <LogIn className="w-5 h-5" />
            Log In
          </Link>
          <Link
            to="/auth/signup"
            className="flex items-center justify-center gap-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            <UserPlus className="w-5 h-5" />
            Sign Up
          </Link>
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-gray-500 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Help Text */}
        <p className="text-sm text-gray-500">
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
