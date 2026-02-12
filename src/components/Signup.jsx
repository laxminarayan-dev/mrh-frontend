import { handleInputChange, handleAuthSubmit } from "../functions/auth";
import { User, Mail, Lock, Eye, EyeOff, Phone, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  resetOtpState,
  sendSignupOtp,
  verifySignupOtp,
} from "../store/authSlice";
import Loader from "./Loader";

const SignupForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    otp: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const dispatch = useDispatch();

  const { loading, error, otpSent } = useSelector((state) => state.auth);

  const handleOtpInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: "" });
    }
  };

  const validateOtp = () => {
    const errors = {};
    if (!formData.otp.trim()) {
      errors.otp = "OTP is required";
    } else if (formData.otp.length !== 6) {
      errors.otp = "OTP must be 6 digits";
    } else if (!/^\d{6}$/.test(formData.otp)) {
      errors.otp = "OTP must contain only numbers";
    }
    return errors;
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    const errors = handleAuthSubmit(e, formData, "signup").errors;
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
    } else {
      dispatch(sendSignupOtp(formData.email));
      setResendSecondsLeft(30);
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    const errors = validateOtp();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});
    const userDetail = {
      fullName: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
    };
    dispatch(verifySignupOtp({ userDetail, otp: formData.otp }));
  };

  const handleBackToForm = () => {
    dispatch(resetOtpState());
    setValidationErrors({});
    setFormData({ ...formData, otp: "" });
    setResendSecondsLeft(0);
  };

  useEffect(() => {
    if (resendSecondsLeft <= 0) {
      return;
    }

    const timerId = setInterval(() => {
      setResendSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, [resendSecondsLeft]);

  // OTP Verification Screen
  if (otpSent) {
    return (
      <div className="space-y-6">
        {loading && <Loader />}
        <button
          onClick={handleBackToForm}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">Verify Email</h2>
          <p className="mt-2 text-sm text-slate-600">
            Enter the 6-digit code sent to
            <span className="font-semibold">{formData.email}</span>
          </p>
          {error?.message && (
            <p className="mt-3 text-sm font-medium text-red-600">
              {error.message}
            </p>
          )}
        </div>

        <form onSubmit={handleOtpSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              OTP Code
            </label>
            <input
              type="text"
              name="otp"
              placeholder="Enter 6-digit OTP"
              value={formData.otp}
              onChange={handleOtpInputChange}
              maxLength={6}
              className={`w-full px-4 py-3 rounded-lg border ${validationErrors.otp ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-orange-500 focus:ring-orange-100"} bg-white text-sm text-slate-700 outline-none focus:ring-2 transition-all text-center text-2xl tracking-widest`}
              required
            />
            {validationErrors.otp && (
              <p className="text-red-500 text-xs mt-1">
                {validationErrors.otp}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg shadow-md hover:from-orange-600 hover:to-orange-700 transition-all"
          >
            Verify & Create Account
          </button>

          <button
            type="button"
            onClick={() => {
              dispatch(sendSignupOtp(formData.email));
              setResendSecondsLeft(30);
            }}
            className={`w-full text-sm font-medium ${resendSecondsLeft > 0 ? "text-slate-400 cursor-not-allowed" : "text-orange-600 hover:text-orange-700"}`}
            disabled={resendSecondsLeft > 0}
          >
            {resendSecondsLeft > 0
              ? `Resend OTP in ${resendSecondsLeft}s`
              : "Resend OTP"}
          </button>
        </form>
      </div>
    );
  }

  // Signup Form Screen
  return (
    <div className="space-y-6">
      {loading && <Loader />}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
        <p className="mt-2 text-sm text-slate-600">
          Join us and start ordering delicious food
        </p>
        {error?.message && (
          <p className="mt-3 text-sm font-medium text-red-600">
            {error.message}
          </p>
        )}
      </div>

      <form onSubmit={handleSignupSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">
            Full Name
          </label>
          <div className="relative">
            <User
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              name="name"
              placeholder="Mr Halwai"
              value={formData.name}
              onChange={(e) =>
                handleInputChange(
                  e,
                  setFormData,
                  formData,
                  setValidationErrors,
                  "signup",
                )
              }
              className={`w-full pl-10 pr-4 py-3 rounded-lg border ${validationErrors.name ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-orange-500 focus:ring-orange-100"} bg-white text-sm text-slate-700 outline-none focus:ring-2 transition-all`}
            />
          </div>
          {validationErrors.name && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
          )}
        </div>

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
              placeholder="you@yourmail.com"
              value={formData.email}
              onChange={(e) =>
                handleInputChange(
                  e,
                  setFormData,
                  formData,
                  setValidationErrors,
                  "signup",
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
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="tel"
              name="phone"
              placeholder="+91 98765XXXXX"
              value={formData.phone}
              maxLength={10}
              pattern="[0-9]{10}"
              inputMode="numeric"
              onChange={(e) =>
                handleInputChange(
                  e,
                  setFormData,
                  formData,
                  setValidationErrors,
                  "signup",
                )
              }
              className={`w-full pl-10 pr-4 py-3 rounded-lg border ${validationErrors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-orange-500 focus:ring-orange-100"} bg-white text-sm text-slate-700 outline-none focus:ring-2 transition-all`}
            />
          </div>
          {validationErrors.phone && (
            <p className="text-red-500 text-xs mt-1">
              {validationErrors.phone}
            </p>
          )}
        </div>

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
              placeholder="Create a strong password"
              value={formData.password}
              onChange={(e) =>
                handleInputChange(
                  e,
                  setFormData,
                  formData,
                  setValidationErrors,
                  "signup",
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

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg shadow-md hover:from-orange-600 hover:to-orange-700 transition-all"
        >
          Continue with OTP
        </button>
      </form>

      <div className="text-center">
        <p className="text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="text-orange-600 hover:text-orange-700 font-semibold"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
export default SignupForm;
