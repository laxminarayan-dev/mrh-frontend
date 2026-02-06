import { Link, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { ShieldUser } from "lucide-react";

function Auth() {
  const { isLoggedIn } = useSelector((state) => state.auth);
  if (isLoggedIn) {
    return (
      <div className="min-h-[calc(100vh-5rem)] w-full bg-gradient-to-b from-[#FFFBE9] to-orange-200 flex flex-col items-center justify-center px-6 py-12">
        <h2 className="text-3xl font-semibold text-center text-green-600 mb-6 flex items-center gap-2 justify-center flex-col">
          <ShieldUser size={50} /> You are already logged in!
        </h2>
        <p className="text-center text-slate-700 mb-6">
          Go to the{" "}
          <Link to="/" className="text-orange-600 hover:underline">
            homepage
          </Link>{" "}
          to continue shopping.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] w-full bg-gradient-to-b from-[#FFFBE9] to-orange-200 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
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
