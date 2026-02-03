import { Star } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

function Feedback() {
  return (
    <section className="max-w-6xl mx-auto px-4 mb-8 pt-12">
      <div className="text-center mb-12">
        <p className="text-sm uppercase tracking-widest text-[#F67401] font-semibold">
          Customer Love
        </p>
        <h2 className="font-semibold text-4xl md:text-5xl text-gray-900 mt-2">
          What Our Customers Say
        </h2>
        <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
          Join thousands of happy customers enjoying authentic flavors
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            name: "Priya Sharma",
            initial: "P",
            rating: 5,
            feedback:
              "Best dosa I've ever had! Fresh, crispy, and absolutely delicious. Will definitely order again!",
          },
          {
            name: "Rajesh Kumar",
            initial: "R",
            rating: 5,
            feedback:
              "Fast delivery and hot food. The thali is amazing value for money. Highly recommended!",
          },
          {
            name: "Anjali Patel",
            initial: "A",
            rating: 4,
            feedback:
              "Great authentic taste, friendly service. The Pav Bhaji is outstanding. 10/10!",
          },
        ].map((feedback, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#FF7407] to-[#F6A51A] flex items-center justify-center text-white font-bold text-lg">
                {feedback.initial}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{feedback.name}</h4>
                <div className="flex gap-0.5">
                  {[...Array(feedback.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      <Star size={16} fill="gold" />
                    </span>
                  ))}
                  {[...Array(5 - feedback.rating)].map((_, i) => (
                    <span key={i} className="text-gray-300">
                      <Star size={16} fill="#88888860" />
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              "{feedback.feedback}"
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link to="/reviews" className="px-8 py-3 bg-[#FF7407] text-white font-semibold rounded-full hover:bg-[#F67401] transition-colors shadow-sm">
          View All Reviews
        </Link>
      </div>
    </section>
  );
}

export default Feedback;
