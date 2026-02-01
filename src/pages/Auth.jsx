import { useState } from "react";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  ChefHat,
} from "lucide-react";
import { Link } from "react-router-dom";

function Auth() {
  const [currentView, setCurrentView] = useState("login"); // 'login', 'signup', 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission based on currentView
    console.log(`${currentView} form submitted:`, formData);
  };

  // Login Component (can be separated later)
  const LoginForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to your account to continue
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
              required
            />
          </div>
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
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full pl-10 pr-12 py-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
            />
            <span className="ml-2 text-sm text-slate-600">Remember me</span>
          </label>
          <button
            type="button"
            onClick={() => setCurrentView("forgot")}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg shadow-md hover:from-orange-600 hover:to-orange-700 transition-all"
        >
          Sign In
        </button>
      </form>

      <div className="text-center">
        <p className="text-sm text-slate-600">
          Don't have an account?{" "}
          <button
            onClick={() => setCurrentView("signup")}
            className="text-orange-600 hover:text-orange-700 font-semibold"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );

  // Signup Component (can be separated later)
  const SignupForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
        <p className="mt-2 text-sm text-slate-600">
          Join us and start ordering delicious food
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="John Doe"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
              required
            />
          </div>
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
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
              required
            />
          </div>
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
              onChange={handleInputChange}
              className="w-full pl-10 pr-12 py-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
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
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg shadow-md hover:from-orange-600 hover:to-orange-700 transition-all"
        >
          Create Account
        </button>
      </form>

      <div className="text-center">
        <p className="text-sm text-slate-600">
          Already have an account?{" "}
          <button
            onClick={() => setCurrentView("login")}
            className="text-orange-600 hover:text-orange-700 font-semibold"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );

  // Forgot Password Component (can be separated later)
  const ForgotPasswordForm = () => (
    <div className="space-y-6">
      <button
        onClick={() => setCurrentView("login")}
        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4"
      >
        <ArrowLeft size={16} />
        Back to login
      </button>

      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900">Reset Password</h2>
        <p className="mt-2 text-sm text-slate-600">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg shadow-md hover:from-orange-600 hover:to-orange-700 transition-all"
        >
          Send Reset Link
        </button>
      </form>

      <div className="text-center">
        <p className="text-sm text-slate-600">
          Remember your password?{" "}
          <button
            onClick={() => setCurrentView("login")}
            className="text-orange-600 hover:text-orange-700 font-semibold"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100dvh-4rem)] w-full bg-gradient-to-b from-[#FFFBE9] to-orange-200 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Auth Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          {currentView === "login" && <LoginForm />}
          {currentView === "signup" && <SignupForm />}
          {currentView === "forgot" && <ForgotPasswordForm />}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          By continuing, you agree to our{" "}
          <Link to="/terms" className="text-orange-600 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-orange-600 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Auth;
