import { handleInputChange, handleAuthSubmit } from "../functions/auth";
import { Mail, Lock, Eye, EyeOff, Shield, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  sendLoginOtp,
  resetOtpState,
  setRememberMe,
  verifyLoginOtp,
} from "../store/authSlice";
import { authLogin } from "../store/authSlice";
import { useSelector } from "react-redux";
import Loader from "./Loader";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginOption, setLoginOption] = useState("OTP");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
  });
  const { error, loading, otpSent } = useSelector((state) => state.auth);
  const [validationErrors, setValidationErrors] = useState({});
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetOtpState());
  }, [dispatch]);

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {loading && <Loader />}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
          Welcome Back
        </h2>
        <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-slate-600 px-2">
          Sign in to your account to continue
        </p>

        {error?.message && (
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-red-600 px-2">
            {error.message}
          </p>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const errors = handleAuthSubmit(
            e,
            formData,
            "login",
            loginOption,
          ).errors;
          if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
          } else {
            if (loginOption === "OTP") {
              // OTP login logic here
              // You can dispatch an action to send OTP to the user's email
              dispatch(sendLoginOtp(formData.email));
            } else {
              // Submit form logic here
              dispatch(authLogin(formData));
            }
          }
          setTimeout(() => {
            setValidationErrors({});
          }, 2000);
        }}
        className="space-y-3 sm:space-y-4 md:space-y-5"
      >
        <div>
          <label className="text-xs sm:text-sm font-medium text-slate-700 block mb-1.5 sm:mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              disabled={otpSent}
              value={formData.email}
              onChange={(e) =>
                handleInputChange(
                  e,
                  setFormData,
                  formData,
                  setValidationErrors,
                  "login",
                )
              }
              className={`w-full pl-10 pr-3 sm:pr-4 py-2 sm:py-3 rounded-lg border ${validationErrors.email ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-orange-500 focus:ring-orange-100"} bg-white text-xs sm:text-sm text-slate-700 outline-none focus:ring-2 transition-all`}
            />
          </div>
          {validationErrors.email && (
            <p className="text-red-500 text-[10px] sm:text-xs mt-1">
              {validationErrors.email}
            </p>
          )}
        </div>

        {loginOption === "OTP" && (
          <>
            <p
              className={`text-xs sm:text-sm ${otpSent ? "text-green-600" : "text-slate-600"} mb-2 sm:mb-3`}
            >
              {otpSent
                ? "OTP sent to your email. Please enter it below."
                : "We'll send you a one-time password (OTP) to your email."}
            </p>
            <div className="relative">
              <ShieldCheck
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                name="otp"
                disabled={!otpSent}
                placeholder="Enter OTP"
                value={formData.otp || ""}
                onChange={(e) =>
                  handleInputChange(
                    e,
                    setFormData,
                    formData,
                    setValidationErrors,
                    "login",
                  )
                }
                className={`w-full pl-10 pr-3 sm:pr-4 py-2 sm:py-3 rounded-lg border ${validationErrors.otp ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-orange-500 focus:ring-orange-100"} bg-white text-xs sm:text-sm text-slate-700 outline-none focus:ring-2 transition-all`}
              />
            </div>
            {validationErrors.otp && (
              <p className="text-red-500 text-[10px] sm:text-xs mt-1">
                {validationErrors.otp}
              </p>
            )}
          </>
        )}

        {loginOption === "Password" && (
          <div>
            <label className="text-xs sm:text-sm font-medium text-slate-700 block mb-1.5 sm:mb-2">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  handleInputChange(
                    e,
                    setFormData,
                    formData,
                    setValidationErrors,
                    "login",
                  )
                }
                className={`w-full pl-10 pr-11 sm:pr-12 py-2 sm:py-3 rounded-lg border ${validationErrors.password ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-orange-500 focus:ring-orange-100"} bg-white text-xs sm:text-sm text-slate-700 outline-none focus:ring-2 transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff size={16} className="sm:w-5 md:w-5" />
                ) : (
                  <Eye size={16} className="sm:w-5 md:w-5" />
                )}
              </button>
            </div>
            {validationErrors.password && (
              <p className="text-red-500 text-[10px] sm:text-xs mt-1">
                {validationErrors.password}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <label className="flex items-center min-w-0">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
              onChange={(e) => {
                dispatch(setRememberMe(e.target.checked));
              }}
            />
            <span className="ml-2 text-xs sm:text-sm text-slate-600 truncate">
              Remember me
            </span>
          </label>
          {loginOption === "Password" && (
            <Link
              to="/auth/forgot-password"
              className="text-xs sm:text-sm text-orange-600 hover:text-orange-700 font-medium flex-shrink-0"
            >
              Forgot password?
            </Link>
          )}
        </div>

        {otpSent ? (
          <>
            <button
              type="button"
              className="w-full py-2 sm:py-3 md:py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-sm sm:text-base rounded-lg shadow-md hover:from-orange-600 hover:to-orange-700 transition-all"
              onClick={() => {
                // Dispatch an action to verify the OTP
                dispatch(verifyLoginOtp({ ...formData }));
              }}
            >
              Verify OTP
            </button>
          </>
        ) : (
          <>
            <button
              type="submit"
              className="w-full py-3  bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-xs sm:text-base rounded-lg shadow-md hover:from-orange-600 hover:to-orange-700 transition-all"
            >
              Continue with {loginOption}
            </button>
            <button
              type="button"
              className="w-full py-3  bg-orange-50 border-2 border-orange-300 text-orange-600 font-semibold text-xs sm:text-base rounded-lg shadow-md hover:bg-orange-100 transition-all"
              onClick={() =>
                setLoginOption(loginOption === "OTP" ? "Password" : "OTP")
              }
            >
              Sign In with {loginOption === "OTP" ? "Password" : "OTP"}
            </button>
          </>
        )}
      </form>

      <div className="text-center z-10 px-2">
        <p className="text-xs sm:text-sm text-slate-600">
          Don't have an account?{" "}
          <Link
            to="/auth/signup"
            className="text-orange-600 hover:text-orange-700 font-semibold"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};
export default LoginForm;
