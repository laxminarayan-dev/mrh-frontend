import { Link, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { ShieldUser } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Auth() {
  const { isLoggedIn, loading } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/", { replace: true });
    }
  }, [isLoggedIn, loading]);
  if (isLoggedIn) {
    return (
      <div className="min-h-[calc(100vh-5rem)] w-full bg-gradient-to-b from-[#FFFBE9] to-orange-200 flex flex-col items-center justify-center px-2 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-center text-green-600 mb-4 sm:mb-6 flex items-center gap-2 justify-center flex-col leading-tight px-1">
          <ShieldUser size={36} className="sm:w-12 md:w-14 sm:h-12 md:h-14" />{" "}
          You are already logged in!
        </h2>
        <p className="text-center text-xs sm:text-sm md:text-base text-slate-700 mb-4 sm:mb-6 px-2">
          Go to the{" "}
          <Link
            to="/"
            className="text-orange-600 hover:underline font-semibold"
          >
            homepage
          </Link>{" "}
          to continue shopping.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] w-full bg-gradient-to-b from-[#FFFBE9] to-orange-200 flex items-center justify-center px-2 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
      <div className="w-full max-w-md">
        {/* Auth Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] sm:text-xs md:text-sm text-slate-500 mt-4 sm:mt-6 px-2">
          By continuing, you agree to our{" "}
          <Link
            to="/terms-and-conditions"
            className="text-orange-600 hover:underline"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            to="/privacy-policy"
            className="text-orange-600 hover:underline"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Auth;
