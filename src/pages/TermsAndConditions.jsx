import {
  Check,
  Utensils,
  User,
  Scale,
  XCircle,
  CreditCard,
  Mail,
} from "lucide-react";

const TermsAndConditions = () => {
  return (
    <div className="bg-gradient-to-b from-[#FFFBE9] via-orange-100 to-orange-200 min-h-screen">
      <div className="max-w-4xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 py-5 sm:py-7 md:py-10 lg:py-14">
        {/* Header */}
        <div className="text-center mb-5 sm:mb-7 md:mb-9">
          <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-[#FF7407] to-[#F6A51A] bg-clip-text text-transparent mb-1.5 sm:mb-2 md:mb-3 leading-tight">
            Terms & Conditions
          </h1>
          <p className="text-slate-600 text-[9px] sm:text-xs md:text-sm px-2">
            Last updated: 01 February 2026
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
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

          <Section title="User Responsibilities" icon={<User color="#fff" />}>
            <ul className="space-y-1.5 sm:space-y-2">
              <li className="flex items-start gap-2 sm:gap-2.5 md:gap-3">
                <span className="text-[#FF7407] font-bold mt-0.5 flex-shrink-0">
                  •
                </span>
                <span className="text-xs sm:text-sm">
                  Provide correct information
                </span>
              </li>
              <li className="flex items-start gap-2 sm:gap-2.5 md:gap-3">
                <span className="text-[#FF7407] font-bold mt-0.5 flex-shrink-0">
                  •
                </span>
                <span className="text-xs sm:text-sm">
                  No misuse of services
                </span>
              </li>
              <li className="flex items-start gap-2 sm:gap-2.5 md:gap-3">
                <span className="text-[#FF7407] font-bold mt-0.5 flex-shrink-0">
                  •
                </span>
                <span className="text-xs sm:text-sm">No fake orders</span>
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
        <div className="mt-10 sm:mt-12 md:mt-14 p-3 sm:p-4 md:p-5 lg:p-6 bg-white/80 backdrop-blur border-l-4 border-[#FF7407] rounded-lg sm:rounded-xl">
          <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
            <span className="font-semibold text-[#FF7407]">Note:</span> These
            terms and conditions are binding on all users of Mr Halwai. By
            accessing our platform, you acknowledge that you have read,
            understood, and agree to be bound by these terms.
          </p>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, icon, children, description }) => (
  <section className="group bg-white/90 backdrop-blur border border-orange-100 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 shadow-md hover:shadow-lg transition-all hover:border-[#FF7407]">
    <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center h-10 w-10 sm:h-11 md:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#FF7407] to-[#F6A51A] shadow-lg">
          <span className="text-base sm:text-lg md:text-xl">{icon}</span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-1.5 sm:mb-2 md:mb-3 group-hover:text-[#FF7407] transition-colors">
          {title}
        </h2>
        {description ? (
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            {description}
          </p>
        ) : (
          <div className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            {children}
          </div>
        )}
      </div>
    </div>
  </section>
);

export default TermsAndConditions;
