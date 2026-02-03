import { Check, Utensils, User, Scale, XCircle, CreditCard, Mail } from "lucide-react";

const TermsAndConditions = () => {
  return (
    <div className="bg-gradient-to-b from-[#FFFBE9] via-orange-100 to-orange-200 min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#FF7407] to-[#F6A51A] bg-clip-text text-transparent mb-3">
            Terms & Conditions
          </h1>
          <p className="text-gray-600 text-sm">Last updated: 01 February 2026</p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          <Section
            title="Acceptance"
            icon={<Check color="#fff" />}
            description="By using mrhalwai.in, you agree to these Terms & Conditions."
          />

          <Section
            title="Service"
            icon={<Utensils color="#fff" />}
            description="Mr Halwai is a food ordering platform offering Cash on Delivery orders."
          />

          <Section
            title="User Responsibilities"
            icon={<User color="#fff" />}
          >
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <span className="text-[#FF7407] font-bold mt-1">•</span>
                <span>Provide correct information</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FF7407] font-bold mt-1">•</span>
                <span>No misuse of services</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#FF7407] font-bold mt-1">•</span>
                <span>No fake orders</span>
              </li>
            </ul>
          </Section>

          <Section
            title="Orders & Payments"
            icon={<CreditCard color="#fff" />}
            description="All orders are Cash on Delivery. Payment is collected at delivery time."
          />

          <Section
            title="Cancellation & Refund"
            icon={<XCircle color="#fff" />}
            description="Orders can be cancelled before preparation. Refunds apply only for incorrect or damaged food."
          />

          <Section
            title="Governing Law"
            icon={<Scale color="#fff" />}
            description="These terms are governed by Indian law."
          />

          <Section
            title="Contact"
            icon={<Mail color="#fff" />}
            description="Email: support@mrhalwai.in"
          />
        </div>

        {/* Footer Note */}
        <div className="mt-16 p-6 bg-white/80 backdrop-blur border-l-4 border-[#FF7407] rounded-xl">
          <p className="text-gray-700 text-sm leading-relaxed">
            <span className="font-semibold text-[#FF7407]">Note:</span> These terms and conditions are binding on all users of Mr Halwai. By accessing our platform, you acknowledge that you have read, understood, and agree to be bound by these terms.
          </p>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, icon, children, description }) => (
  <section className="group bg-white/90 backdrop-blur border border-orange-100 rounded-2xl p-8 shadow-md hover:shadow-lg transition-all hover:border-[#FF7407]">
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-[#FF7407] to-[#F6A51A] shadow-lg">
          <span className="text-xl">{icon}</span>
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

export default TermsAndConditions;
