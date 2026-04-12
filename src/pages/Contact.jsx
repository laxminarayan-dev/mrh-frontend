import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  AlertCircle,
  LogIn,
  CheckCircle2,
} from "lucide-react";
import Map from "../components/Map";

function Contact() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successAlert, setSuccessAlert] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setSuccessAlert(true);
    setIsSubmitting(false);
    e.target.reset();
  };

  return (
    <div className="w-full bg-linear-to-b from-[#FFFBE9] via-orange-100 to-orange-200 relative">
      {/* Success Alert Modal */}
      {successAlert && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[90vw] max-w-[420px] bg-white rounded-2xl p-6 shadow-2xl">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-50 to-emerald-50 rounded-full flex items-center justify-center flex-shrink-0 border border-green-200">
                <CheckCircle2 size={24} className="text-green-600" />
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-lg font-bold text-gray-900">
                  Inquiry Sent Successfully
                </h3>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Thank you for your inquiry! Our team will get back to you shortly.
              We appreciate your interest in MRH.
            </p>
            <button
              onClick={() => setSuccessAlert(false)}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-lg transition-all shadow-lg"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <section className="relative max-w-6xl mx-auto px-6 py-12 md:py-16 z-20">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">
              Contact Us
            </p>
            <h1 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">
              We’d love to hear from you
            </h1>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Have a question about our menu, catering, or bulk orders? Send us
              a message and our team will get back to you shortly.
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                  <Mail size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Email</p>
                  <p className="text-sm text-slate-600">support@mrhalwai.in</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                  <Phone size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Phone</p>
                  <p className="text-sm text-slate-600">+91 73105 07638</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                  <MapPin size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Address
                  </p>
                  <p className="text-sm text-slate-600">
                    Shop No. 57, KIC Market, Dibai, Uttar Pradesh 203393
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                  <Clock size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Hours</p>
                  <p className="text-sm text-slate-600">
                    Mon - Sun: 10:00 AM to 10:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-orange-200 bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-slate-900">
              Send an inquiry
            </h2>

            {!isAuthenticated ? (
              <div className="mt-4 rounded-2xl border-2 border-orange-200 bg-orange-50 p-6 text-center">
                <div className="mx-auto w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <LogIn size={28} className="text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Login Required
                </h3>
                <p className="text-slate-600 text-sm mb-5 leading-relaxed">
                  Please login or register to send us an inquiry. This helps us
                  respond to you more efficiently.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate("/auth/login")}
                    className="flex-1 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-orange-600 hover:to-orange-700"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate("/auth/register")}
                    className="flex-1 rounded-lg border-2 border-orange-500 bg-white px-4 py-2.5 text-sm font-semibold text-orange-600 transition-all hover:bg-orange-50"
                  >
                    Register
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Inquiry
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Tell us more..."
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-orange-400"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    "Send Inquiry"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        <Map />
      </section>
    </div>
  );
}

export default Contact;
