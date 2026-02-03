import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";

const ForgotPasswordForm = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  // Validate OTP
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
    console.log("Sending OTP to:", formData.email);
    // Here you would typically send OTP to email
    setStep(2);
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    const errors = validateOtp();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});
    console.log("Verifying OTP:", formData.otp);
    // Here you would typically verify the OTP
    setStep(3);
  };

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
    setStep(4); // Success screen
  };

  return (
    <div className="space-y-6">
      {step === 1 && (
        <Link
          to={"/auth/login"}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>
      )}

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div
          className={`h-2 w-16 rounded-full ${step >= 1 ? "bg-orange-500" : "bg-slate-200"}`}
        ></div>
        <div
          className={`h-2 w-16 rounded-full ${step >= 2 ? "bg-orange-500" : "bg-slate-200"}`}
        ></div>
        <div
          className={`h-2 w-16 rounded-full ${step >= 3 ? "bg-orange-500" : "bg-slate-200"}`}
        ></div>
      </div>

      {/* Step 1: Email Input */}
      {step === 1 && (
        <>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              Reset Password
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Enter your email to receive an OTP
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${validationErrors.email ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-orange-500 focus:ring-orange-100"} bg-white text-sm text-slate-700 outline-none focus:ring-2 transition-all`}
                />
              </div>
              {validationErrors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.email}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg shadow-md hover:from-orange-600 hover:to-orange-700 transition-all"
            >
              Send OTP
            </button>
          </form>
        </>
      )}

      {/* Step 2: OTP Verification */}
      {step === 2 && (
        <>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">Verify OTP</h2>
            <p className="mt-2 text-sm text-slate-600">
              Enter the 6-digit code sent to{" "}
              <span className="font-semibold">{formData.email}</span>
            </p>
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
                onChange={handleInputChange}
                maxLength={6}
                className={`w-full px-4 py-3 rounded-lg border ${validationErrors.otp ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-orange-500 focus:ring-orange-100"} bg-white text-sm text-slate-700 outline-none focus:ring-2 transition-all text-center text-2xl tracking-widest`}
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
              Verify OTP
            </button>

            <button
              type="button"
              onClick={() => console.log("Resending OTP...")}
              className="w-full text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Resend OTP
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setValidationErrors({});
                setFormData({
                  ...formData,
                  otp: "",
                  newPassword: "",
                  confirmPassword: "",
                });
              }}
              className="w-full py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all"
            >
              Cancel Process
            </button>
          </form>
        </>
      )}

      {/* Step 3: New Password */}
      {step === 3 && (
        <>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              Create New Password
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Enter a strong password for your account
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border ${validationErrors.newPassword ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-orange-500 focus:ring-orange-100"} bg-white text-sm text-slate-700 outline-none focus:ring-2 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {validationErrors.newPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.newPassword}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border ${validationErrors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-orange-500 focus:ring-orange-100"} bg-white text-sm text-slate-700 outline-none focus:ring-2 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg shadow-md hover:from-orange-600 hover:to-orange-700 transition-all"
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
              className="w-full py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all"
            >
              Cancel Process
            </button>
          </form>
        </>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <>
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="text-green-500" size={64} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">
              Password Reset Successful!
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Your password has been successfully reset.
            </p>
            <Link
              to="/auth/login"
              className="inline-block w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg shadow-md hover:from-orange-600 hover:to-orange-700 transition-all"
            >
              Go to Login
            </Link>
          </div>
        </>
      )}

      {(step === 1 || step === 4) && (
        <div className="text-center">
          <p className="text-sm text-slate-600">
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
