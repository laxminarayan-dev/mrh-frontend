import {
  Clock2,
  Landmark,
  Locate,
  Mail,
  MapPin,
  Phone,
  Timer,
} from "lucide-react";
import React from "react";

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4 col-span-2">
            <h3 className="text-2xl font-bold text-white">Mr Halwai</h3>
            <p className="text-sm text-gray-400">
              Authentic Indian & Fast Food, crafted with love and tradition.
            </p>
            <div className="flex gap-3 pt-2">
              {[
                {
                  name: "Facebook",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 8h2V4h-2c-2.2 0-4 1.8-4 4v2H8v4h2v6h4v-6h2.5l.5-4H14V8z" />
                    </svg>
                  ),
                },
                {
                  name: "Instagram",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="1" />
                    </svg>
                  ),
                },
                {
                  name: "Youtube",
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="6" width="20" height="12" rx="3" />
                      <polygon points="10 9 16 12 10 15" />
                    </svg>
                  ),
                },
              ].map((social) => (
                <button
                  key={social.name}
                  className="h-9 w-9 rounded-full bg-[#FF7407] hover:bg-[#F67401] transition-colors flex items-center justify-center text-white"
                  aria-label={social.name}
                >
                  {social.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {["About Us", "Our Menu", "Delivery Info", "Contact Us"].map(
                (link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm hover:text-[#FF7407] transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Support */}
          <div className="hidden">
            <h4 className=" text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {["FAQ", "Track Order", "Returns", "Feedback"].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm hover:text-[#FF7407] transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Get in Touch</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2">
                <span className="text-[#FF7407]">
                  <Phone size={20} />
                </span>
                <span>+91 98765 43210</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#FF7407]">
                  <Mail size={20} />
                </span>
                <span>hello@mrhalwai.com</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#FF7407]">
                  <MapPin size={20} />{" "}
                </span>
                <span>123 Food Street, Delhi</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#FF7407]">
                  <Clock2 size={20} />
                </span>
                <span>11 AM - 11 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods */}
        {/* <div className="border-t border-gray-700 py-6 mb-6">
                <p className="text-sm text-gray-400 mb-3">
                  We accept cash only
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="px-4 py-2 bg-[#FF7407] border border-orange-400 rounded-full text-sm font-semibold text-slate-900">
                    Cash
                  </div>
                </div>
              </div> */}

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© 2026 Mr Halwai. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-[#FF7407] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-[#FF7407] transition-colors">
              Terms & Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
