import { Clock2, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
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
                  link: "#",
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
                  link: "https://www.instagram.com/mrhalwai_?igsh=b2Z1N3Jia3hqaHg1",
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
                  link: "https://www.youtube.com/@mrHalwai-k2v",
                },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-full bg-[#FF7407] hover:bg-[#F67401] transition-colors flex items-center justify-center text-white"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">

              {Object.entries({
                "About Us": "/about-us",
                "Our Menu": "/menu",
                "Contact Us": "/contact-us",
                "Cart": "/cart",
              }).map(
                ([name, url]) => (
                  <li key={name}>
                    <Link
                      to={url}
                      className="text-sm hover:text-[#FF7407] transition-colors"
                    >
                      {name}
                    </Link>
                  </li>
                ),
              )}
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
                <span>
                  <a href="tel:+917310507638">+91 73105 07638</a>
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#FF7407]">
                  <Mail size={20} />
                </span>
                <span>
                  <a href="mailto:support@mrhalwai.in">support@mrhalwai.in</a>
                </span>
              </li>
              <li className="flex gap-2 max-w-50">
                <span className="text-[#FF7407]">
                  <MapPin size={20} />{" "}
                </span>
                <span>
                  <a href="https://www.google.com/maps/place/Mr.Halwai/@28.2033457,78.2574902,15z/data=!3m1!4b1!4m6!3m5!1s0x390b4bdd94a37c4f:0x904e7b0a13ab76a1!8m2!3d28.2033461!4d78.2677899!16s%2Fg%2F11mt412q0p?entry=ttu&g_ep=EgoyMDI2MDEyOC4wIKXMDSoASAFQAw%3D%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Shop No. 57, KIC Market, Dibai, Uttar Pradesh 203393
                  </a>
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#FF7407]">
                  <Clock2 size={20} />
                </span>
                <span>10 AM - 10 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© 2026 Mr Halwai. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="/privacy-policy" className="hover:text-[#FF7407] transition-colors">
              Privacy Policy
            </a>
            <a href="/terms-and-conditions" className="hover:text-[#FF7407] transition-colors">
              Terms & Conditions
            </a>
          </div>
        </div>
      </div>
    </footer >
  );
}

export default Footer;
