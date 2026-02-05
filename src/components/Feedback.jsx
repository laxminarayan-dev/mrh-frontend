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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.slice(0, 4).map((review, index) => (
          <ReviewCard key={review._id || index} review={review} />
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          to="/reviews"
          className="px-8 py-3 bg-[#FF7407] text-white font-semibold rounded-full hover:bg-[#F67401] transition-colors shadow-sm"
        >
          View All Reviews
        </Link>
      </div>
    </section>
  );
}

export default Feedback;
