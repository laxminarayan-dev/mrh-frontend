import React from "react";
import { ChefHat, Sparkles, Heart, Leaf, Star } from "lucide-react";

function AboutUs() {
  const values = [
    {
      title: "Authentic Taste",
      description: "Traditional recipes crafted with fresh, local ingredients.",
      icon: <ChefHat size={20} />,
    },
    {
      title: "Hygienic Kitchen",
      description: "Clean, safe, and quality-first cooking every day.",
      icon: <Sparkles size={20} />,
    },
    {
      title: "Made with Love",
      description: "Every plate is prepared with care and passion.",
      icon: <Heart size={20} />,
    },
    {
      title: "Fresh & Local",
      description: "We source seasonal produce to keep flavors vibrant.",
      icon: <Leaf size={20} />,
    },
  ];

  const stats = [
    { label: "Happy Customers", value: "50K+" },
    { label: "Dishes Served", value: "2M+" },
    { label: "Daily Specials", value: "25+" },
    { label: "Avg. Rating", value: "4.9" },
  ];
  // [#FFFBE9]
  return (
    <div className="w-full bg-linear-to-b from-[#FFFBE9] via-orange-100 to-orange-200 py-4 sm:py-6 md:py-8">
      <section className="max-w-6xl mx-auto px-2 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12 lg:py-16">
        <div className="grid gap-4 sm:gap-6 md:gap-8 items-center">
          <div>
            <p className="text-[9px] sm:text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-widest text-orange-500">
              About Mr Halwai
            </p>
            <h1 className="mt-2 sm:mt-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
              A food corner of authentic Indian flavors
            </h1>
            <p className="mt-3 sm:mt-4 md:mt-6 text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed line-clamp-6 px-1">
              At Mr Halwai, we blend tradition with a modern touch to bring you
              comforting, home-style dishes. Our chefs honor regional recipes
              and use fresh, locally sourced ingredients to ensure every bite
              feels like home.
            </p>
            <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-orange-100 px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-sm font-medium text-orange-600">
                <Star size={14} className="sm:w-4 md:w-4" />
                Trusted by food lovers
              </span>
              <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-sm font-medium text-slate-700 border border-orange-200">
                Fresh. Hygienic. Delicious.
              </span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-3 sm:-top-6 -right-3 sm:-right-6 h-16 sm:h-24 w-16 sm:w-24 rounded-2xl bg-orange-200/60 blur-sm" />
            <div className="rounded-2xl sm:rounded-3xl border border-orange-200 bg-white p-3 sm:p-4 md:p-6 shadow-lg">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900">
                Our Story
              </h2>
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-slate-600 line-clamp-6 leading-relaxed">
                Mr Halwai was founded in 2024 by Rajesh Kumar, a young
                entrepreneur in his mid-twenties who believed that great food
                could be built from passion, patience, and purpose. Growing up
                in Narora, Bulandshahr, Uttar Pradesh, Rajesh faced his share of
                struggles while chasing a simple but powerful dream — to create
                a food brand that could reach homes across India.
              </p>
              <hr className="my-3 sm:my-4 md:my-6" />
              <p className="mt-2 sm:mt-3 md:mt-3 text-xs sm:text-sm md:text-base text-slate-600 line-clamp-6 leading-relaxed">
                What started as a small kitchen, driven by limited resources but
                unlimited determination, slowly turned into a growing venture
                focused on delivering soul-satisfying food with the warmth and
                consistency of a family meal. Every dish was crafted with care,
                reflecting both traditional flavors and modern tastes.
              </p>
              <hr className="my-3 sm:my-4 md:my-6" />
              <p className="mt-2 sm:mt-3 md:mt-3 text-xs sm:text-sm md:text-base text-slate-600 line-clamp-6 leading-relaxed">
                Today, Mr Halwai proudly serves thousands of customers, carrying
                forward the values it was built on — quality, honesty, and love
                for food. With a vision to expand pan-India, the journey
                continues, rooted in Narora and driven by the belief that hard
                work and heart can turn even the smallest beginnings into
                something truly meaningful.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-2 sm:px-4 md:px-6 pb-6 sm:pb-8 md:pb-12 lg:pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl sm:rounded-2xl border border-orange-200 hover:-translate-y-0.5 sm:hover:-translate-y-1 hover:shadow-xl bg-white px-3 sm:px-4 md:px-5 py-4 sm:py-5 md:py-6 text-center shadow-sm"
            >
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">
                {stat.value}
              </p>
              <p className="mt-1 text-[10px] sm:text-xs md:text-sm text-slate-600">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-2 sm:px-4 md:px-6 pb-6 sm:pb-8 md:pb-14">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">
          Our Values
        </h2>
        <p className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-slate-600 px-1">
          We’re guided by a simple promise: great taste, honest ingredients, and
          heartfelt hospitality.
        </p>

        <div className="mt-6 sm:mt-8 md:mt-10 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-orange-100 via-orange-300 to-orange-100 border border-orange-100 p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {values.map(({ title, description, icon }) => (
              <div
                key={title}
                className="group bg-white/30 backdrop-blur rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-sm border border-orange-100/70 hover:-translate-y-0.5 sm:hover:-translate-y-1 hover:shadow-xl transition-all"
              >
                <div
                  className={`h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-xl sm:rounded-2xl bg-slate-900 flex items-center justify-center text-[#F67401] mb-2 sm:mb-3 md:mb-4 group-hover:scale-105 transition-transform`}
                >
                  {React.cloneElement(icon, {
                    size: 16,
                    className: "sm:w-5 md:w-6",
                  })}
                </div>
                <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-900">
                  {title}
                </h3>
                <p className="text-[11px] sm:text-xs md:text-sm text-gray-700 mt-1 sm:mt-2 line-clamp-2">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutUs;
