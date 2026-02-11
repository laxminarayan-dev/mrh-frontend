import { handleInputChange, handleAuthSubmit } from "../functions/auth";
import { Mail, Lock, Eye, EyeOff, Shield, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  sendLoginOtp,
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

  return (
    <div className="space-y-6 ">
      {loading && <Loader />}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to your account to continue
        </p>

        {error?.message && (
          <p className="mt-3 text-sm font-medium text-red-600">
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
        className="space-y-4"
      >
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
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
              className={`w-full pl-10 pr-4 py-3 rounded-lg border ${validationErrors.email ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-orange-500 focus:ring-orange-100"} bg-white text-sm text-slate-700 outline-none focus:ring-2 transition-all`}
            />
          </div>
          {validationErrors.email && (
            <p className="text-red-500 text-xs mt-1">
              {validationErrors.email}
            </p>
          )}
        </div>

        {loginOption === "OTP" && (
          <>
            <p
              className={`text-sm ${otpSent ? "text-green-600" : "text-slate-600"} mb-2`}
            >
              {otpSent
                ? "OTP sent to your email. Please enter it below."
                : "We'll send you a one-time password (OTP) to your email."}
            </p>
            <div className="relative">
              <ShieldCheck
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
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
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${validationErrors.otp ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-orange-500 focus:ring-orange-100"} bg-white text-sm text-slate-700 outline-none focus:ring-2 transition-all`}
              />
            </div>
          </>
        )}

        {loginOption === "Password" && (
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
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
                className={`w-full pl-10 pr-12 py-3 rounded-lg border ${validationErrors.password ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-orange-500 focus:ring-orange-100"} bg-white text-sm text-slate-700 outline-none focus:ring-2 transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {validationErrors.password && (
              <p className="text-red-500 text-xs mt-1">
                {validationErrors.password}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
              onChange={(e) => {
                dispatch(setRememberMe(e.target.checked));
              }}
            />
            <span className="ml-2 text-sm text-slate-600">Remember me</span>
          </label>
          {loginOption === "Password" && (
            <Link
              to="/auth/forgot-password"
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Forgot password?
            </Link>
          )}
        </div>

        {otpSent ? (
          <>
            <button
              type="button"
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg shadow-md hover:from-orange-600 hover:to-orange-700 transition-all"
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
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg shadow-md hover:from-orange-600 hover:to-orange-700 transition-all"
            >
              Continue with {loginOption}
            </button>
            <button
              type="button"
              className="w-full py-3 bg-orange-50 border-2 border-orange-300 text-orange-600 font-semibold rounded-lg shadow-md hover:bg-orange-100   transition-all"
              onClick={() =>
                setLoginOption(loginOption === "OTP" ? "Password" : "OTP")
              }
            >
              Sign In with {loginOption === "OTP" ? "Password" : "OTP"}
            </button>
          </>
        )}
      </form>

      <div className="text-center z-10">
        <p className="text-sm text-slate-600">
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
