import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import ReviewCard from "./ReviewCard";
import { useMemo } from "react";

function Feedback() {
  const { otherReviews, myReviews } = useSelector((state) => state.reviews);
  const reviews = useMemo(() => {
    return [...myReviews, ...otherReviews].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }, [myReviews, otherReviews]);

  return (
    <section className="max-w-6xl mx-auto px-2 sm:px-4 mb-4 sm:mb-6 md:mb-8 pt-6 sm:pt-8 md:pt-12">
      <div className="text-center mb-6 sm:mb-8 md:mb-12">
        <p className="text-[9px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-widest text-[#F67401] font-semibold">
          Customer Love
        </p>
        <h2 className="font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-900 mt-2 sm:mt-3 leading-tight px-2">
          What Our Customers Say
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-2 sm:mt-3 max-w-2xl mx-auto px-2">
          Join thousands of happy customers enjoying authentic flavors
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {reviews.slice(0, 4).map((review, index) => (
          <ReviewCard key={review._id || index} review={review} />
        ))}
      </div>

      <div className="mt-6 sm:mt-8 md:mt-10 text-center">
        <Link
          to="/reviews"
          className="px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 bg-[#FF7407] text-white text-xs sm:text-sm md:text-base font-semibold rounded-full hover:bg-[#F67401] transition-colors shadow-sm inline-block"
        >
          View All Reviews
        </Link>
      </div>
    </section>
  );
}

export default Feedback;
