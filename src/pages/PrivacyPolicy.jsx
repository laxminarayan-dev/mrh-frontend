import { Shield, Clipboard, Lock, Cookie, Link2, Mail, IndianRupee } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="bg-gradient-to-b from-[#FFFBE9] via-orange-100 to-orange-200 min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#FF7407] to-[#F6A51A] bg-clip-text text-transparent mb-3">
            Privacy Policy
          </h1>
          <p className="text-gray-600 text-sm">Last updated: 01 February 2026</p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          <Section
            title="Introduction"
            icon={Shield}
          >
            <p>
              Welcome to <span className="font-semibold text-[#FF7407]">Mr Halwai</span> (mrhalwai.in). Your privacy is important to us.
              This Privacy Policy explains how we collect, use, and protect your personal data.
            </p>
          </Section>

          <Section
            title="Information We Collect"
            icon={Clipboard}
          >
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <span className="text-[#FF7407] font-bold mt-1">•</span>
                <span>Name</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FF7407] font-bold mt-1">•</span>
                <span>Email</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FF7407] font-bold mt-1">•</span>
                <span>Phone Number</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FF7407] font-bold mt-1">•</span>
                <span>Address</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FF7407] font-bold mt-1">•</span>
                <span>Location</span>
              </li>
            </ul>
          </Section>

          <Section
            title="Login & OTP"
            icon={Lock}
            description="Users sign up using email and password. Email OTP is used for verification and security purposes only."
          />

          <Section
            title="Cookies"
            icon={Cookie}
            description="We use cookies to enhance user experience and website functionality."
          />

          <Section
            title="Payments"
            icon={IndianRupee}
            description="We only support Cash on Delivery (COD). No online payment data is collected."
          />

          <Section
            title="Third Party Services"
            icon={Link2}
            description="We use Hostinger Mail for email communication and free map services for delivery."
          />

          <Section
            title="Contact"
            icon={Mail}
            description="Email: support@mrhalwai.in"
          />
        </div>

        {/* Footer Note */}
        <div className="mt-16 p-6 bg-white/80 backdrop-blur border-l-4 border-[#FF7407] rounded-xl">
          <p className="text-gray-700 text-sm leading-relaxed">
            <span className="font-semibold text-[#FF7407]">Your Privacy Matters:</span> We are committed to protecting your personal information and maintaining your trust. If you have any questions about this Privacy Policy, please don't hesitate to contact us.
          </p>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, icon: Icon, children, description }) => (
  <section className="group bg-white/90 backdrop-blur border border-orange-100 rounded-2xl p-8 shadow-md hover:shadow-lg transition-all hover:border-[#FF7407]">
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-[#FF7407] to-[#F6A51A] shadow-lg">
          <Icon size={24} className="text-white" />
        </div>
      </div>
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#FF7407] transition-colors">
          {title}
        </h2>
        {description ? (
          <p className="text-gray-700 leading-relaxed">{description}</p>
        ) : (
          <div className="text-gray-700 leading-relaxed">{children}</div>
        )}
      </div>
    </div>
  </section>
);

export default PrivacyPolicy;
