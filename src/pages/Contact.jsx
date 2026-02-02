import { useState } from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import Map from "../components/Map";

function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    alert("Message sent successfully!");
    setIsSubmitting(false);
    e.target.reset();
  };

  return (
    <div className="w-full bg-linear-to-b from-[#FFFBE9] via-orange-100 to-orange-200 relative">
      {gettingLocation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-8 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
            <p className="text-slate-700 font-semibold text-lg">
              Getting your location...
            </p>
            <p className="text-slate-500 text-sm">
              Please allow location access
            </p>
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
                  <p className="text-sm text-slate-600">support@mrhalwai.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                  <Phone size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Phone</p>
                  <p className="text-sm text-slate-600">+91 98765 43210</p>
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
                    12 MG Road, Indore, MP 452001
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
                    Mon - Sun: 9:00 AM to 10:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-orange-200 bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-slate-900">
              Send a message
            </h2>
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
                  Message
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
                  "Send Message"
                )}
              </button>
            </form>
          </div>
        </div>

        <Map
          gettingLocation={gettingLocation}
          setGettingLocation={setGettingLocation}
        />
      </section>
    </div>
  );
}

export default Contact;
