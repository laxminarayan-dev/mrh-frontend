import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  sendForgetOtp,
  verifyForgetOtp,
  resetForgetPassword,
  resetOtpState,
} from "../store/authSlice";
import LoaderComp from "./Loader";

const ForgotPasswordForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);

  const dispatch = useDispatch();
  const {
    loading,
    error,
    forgetOtpSent,
    forgetOtpVerified,
    forgetPasswordSuccess,
  } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Validation patterns
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*[0-9]).{6,}$/;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: "" });
    }
  };

  // Validate email
  const validateEmail = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!EMAIL_PATTERN.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    return errors;
  };

  // Validate passwords
  const validatePasswords = () => {
    const errors = {};
    if (!formData.newPassword) {
      errors.newPassword = "Password is required";
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    } else if (!/[A-Z]/.test(formData.newPassword)) {
      errors.newPassword =
        "Password must contain at least one uppercase letter";
    } else if (!/[0-9]/.test(formData.newPassword)) {
      errors.newPassword = "Password must contain at least one number";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    const errors = validateEmail();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});
    dispatch(sendForgetOtp(formData.email));
    setResendSecondsLeft(30);
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    dispatch(verifyForgetOtp({ email: formData.email, otp: formData.otp }));
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

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const errors = validatePasswords();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});
    console.log("Password reset successful");
    // Here you would typically update the password
    dispatch(
      resetForgetPassword({
        email: formData.email,
        newPassword: formData.newPassword,
      }),
    );
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {loading && <LoaderComp />}

      {!forgetOtpSent && (
        <Link
          to={"/auth/login"}
          className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 hover:text-slate-900 mb-3 sm:mb-4"
        >
          <ArrowLeft size={16} className="sm:w-4 md:w-4" />
          Back to login
        </Link>
      )}

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
        <div
          className={`h-2 w-16 rounded-full ${!forgetOtpSent ? "bg-orange-500" : "bg-slate-200"}`}
        ></div>
        <div
          className={`h-2 w-16 rounded-full ${forgetOtpSent && !forgetOtpVerified ? "bg-orange-500" : "bg-slate-200"}`}
        ></div>
        <div
          className={`h-2 w-16 rounded-full ${forgetOtpVerified && !forgetPasswordSuccess ? "bg-orange-500" : "bg-slate-200"}`}
        ></div>
      </div>

      {/* Step 1: Email Input */}
      {!forgetOtpSent && (
        <>
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight px-2">
              Reset Password
            </h2>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-slate-600 px-2">
              Enter your email to receive an OTP
            </p>
            {error?.message && (
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-red-600 px-2">
                {error.message}
              </p>
            )}
          </div>

          <form
            onSubmit={handleEmailSubmit}
            className="space-y-2 sm:space-y-3 md:space-y-4"
          >
            <div>
              <label className="text-xs sm:text-sm font-medium text-slate-700 block mb-1.5 sm:mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 sm:w-5 md:w-5"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-3 sm:pr-4 py-2 sm:py-3 rounded-lg border ${validationErrors.email ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-orange-500 focus:ring-orange-100"} bg-white text-xs sm:text-sm text-slate-700 outline-none focus:ring-2 transition-all`}
                />
              </div>
              {validationErrors.email && (
                <p className="text-red-500 text-[10px] sm:text-xs mt-1">
                  {validationErrors.email}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2 sm:py-3 md:py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-sm sm:text-base rounded-lg shadow-md hover:from-orange-600 hover:to-orange-700 transition-all"
            >
              Send OTP
            </button>
          </form>
        </>
      )}

      {/* Step 2: OTP Verification */}
      {forgetOtpSent && !forgetOtpVerified && (
        <>
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight px-2">
              Verify OTP
            </h2>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-slate-600 px-2">
              Enter the 6-digit code sent to{" "}
              <span className="font-semibold">{formData.email}</span>
            </p>
            {error?.message && (
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-red-600 px-2">
                {error.message}
              </p>
            )}
          </div>

          <form
            onSubmit={handleOtpSubmit}
            className="space-y-2 sm:space-y-3 md:space-y-4"
          >
            <div>
              <label className="text-xs sm:text-sm font-medium text-slate-700 block mb-1.5 sm:mb-2">
                OTP Code
              </label>
              <input
                type="text"
                name="otp"
                placeholder="Enter 6-digit OTP"
                value={formData.otp}
                onChange={handleInputChange}
                maxLength={6}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border ${validationErrors.otp ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-orange-500 focus:ring-orange-100"} bg-white text-sm sm:text-base md:text-lg text-slate-700 outline-none focus:ring-2 transition-all text-center tracking-widest`}
              />
              {validationErrors.otp && (
                <p className="text-red-500 text-[10px] sm:text-xs mt-1">
                  {validationErrors.otp}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2 sm:py-3 md:py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-sm sm:text-base rounded-lg shadow-md hover:from-orange-600 hover:to-orange-700 transition-all"
            >
              Verify OTP
            </button>

            <button
              type="button"
              onClick={() => {
                dispatch(sendForgetOtp(formData.email));
                setResendSecondsLeft(30);
              }}
              className={`w-full text-xs sm:text-sm font-medium py-2 ${resendSecondsLeft > 0 ? "text-slate-400 cursor-not-allowed" : "text-orange-600 hover:text-orange-700"}`}
              disabled={resendSecondsLeft > 0}
            >
              {resendSecondsLeft > 0
                ? `Resend OTP in ${resendSecondsLeft}s`
                : "Resend OTP"}
            </button>

            <button
              type="button"
              onClick={() => {
                dispatch(resetOtpState());
                setValidationErrors({});
                setFormData({
                  ...formData,
                  otp: "",
                  newPassword: "",
                  confirmPassword: "",
                });
              }}
              className="w-full py-2 sm:py-3 border border-slate-300 text-slate-700 font-semibold text-sm sm:text-base rounded-lg hover:bg-slate-50 transition-all"
            >
              Cancel Process
            </button>
          </form>
        </>
      )}

      {/* Step 3: New Password */}
      {forgetOtpVerified && !forgetPasswordSuccess && (
        <>
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight px-2">
              Create New Password
            </h2>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-slate-600 px-2">
              Enter a strong password for your account
            </p>
            {error?.message && (
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-red-600 px-2">
                {error.message}
              </p>
            )}
          </div>

          <form
            onSubmit={handlePasswordSubmit}
            className="space-y-2 sm:space-y-3 md:space-y-4"
          >
            <div>
              <label className="text-xs sm:text-sm font-medium text-slate-700 block mb-1.5 sm:mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 sm:w-5 md:w-5"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-11 sm:pr-12 py-2 sm:py-3 rounded-lg border ${validationErrors.newPassword ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-orange-500 focus:ring-orange-100"} bg-white text-xs sm:text-sm text-slate-700 outline-none focus:ring-2 transition-all`}
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
              {validationErrors.newPassword && (
                <p className="text-red-500 text-[10px] sm:text-xs mt-1">
                  {validationErrors.newPassword}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs sm:text-sm font-medium text-slate-700 block mb-1.5 sm:mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 sm:w-5 md:w-5"
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-11 sm:pr-12 py-2 sm:py-3 rounded-lg border ${validationErrors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-orange-500 focus:ring-orange-100"} bg-white text-xs sm:text-sm text-slate-700 outline-none focus:ring-2 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} className="sm:w-5 md:w-5" />
                  ) : (
                    <Eye size={16} className="sm:w-5 md:w-5" />
                  )}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-red-500 text-[10px] sm:text-xs mt-1">
                  {validationErrors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2 sm:py-3 md:py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-sm sm:text-base rounded-lg shadow-md hover:from-orange-600 hover:to-orange-700 transition-all"
            >
              Reset Password
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setValidationErrors({});
                setFormData({
                  email: "",
                  otp: "",
                  newPassword: "",
                  confirmPassword: "",
                });
              }}
              className="w-full py-2 sm:py-3 border border-slate-300 text-slate-700 font-semibold text-sm sm:text-base rounded-lg hover:bg-slate-50 transition-all"
            >
              Cancel Process
            </button>
          </form>
        </>
      )}

      {/* Step 4: Success */}
      {forgetPasswordSuccess && (
        <>
          <div className="text-center space-y-3 sm:space-y-4 md:space-y-5">
            <div className="flex justify-center">
              <CheckCircle className="text-green-500 size-16 sm:size-20 md:size-24" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight px-2">
              Password Reset Successful!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 px-2">
              Your password has been successfully reset.
            </p>
            <Link
              to="/auth/login"
              className="inline-block w-full py-2 sm:py-3 md:py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-sm sm:text-base rounded-lg shadow-md hover:from-orange-600 hover:to-orange-700 transition-all"
            >
              Go to Login
            </Link>
          </div>
        </>
      )}

      {!forgetOtpSent && (
        <div className="text-center">
          <p className="text-xs sm:text-sm text-slate-600 px-2">
            Remember your password?{" "}
            <Link
              to={"/auth/login"}
              className="text-orange-600 hover:text-orange-700 font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>
      )}
    </div>
  );
};
export default ForgotPasswordForm;
