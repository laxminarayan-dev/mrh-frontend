import { Mail, ArrowLeft } from "lucide-react";
import { Link, Outlet } from "react-router-dom";

function Auth() {
  // Forgot Password Component (can be separated later)

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
