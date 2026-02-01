import React from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

function Contact() {
  return (
    <div className="w-full bg-linear-to-b from-[#FFFBE9] via-orange-100 to-orange-200">
      <section className="max-w-6xl mx-auto px-6 py-12 md:py-16">
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
            <form className="mt-4 space-y-4">
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
                type="button"
                className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-orange-600 hover:to-orange-700"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-orange-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Visit our kitchen
              </h3>
              <p className="text-sm text-slate-600">
                We’re always happy to welcome you.
              </p>
            </div>
            <button className="rounded-lg border border-orange-200 bg-orange-50 px-5 py-2.5 text-sm font-semibold text-orange-600 hover:bg-orange-100">
              Get Directions
            </button>
          </div>
          <div className="mt-5 h-48 w-full rounded-2xl border border-dashed border-orange-200 bg-orange-50/50 flex items-center justify-center text-sm text-orange-400">
            Map preview placeholder
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
