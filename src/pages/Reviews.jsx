import React, { useMemo, useState } from "react";
import { Star, User, ThumbsUp, Calendar, ChevronDown } from "lucide-react";
import ReviewCard from "../components/ReviewCard";
import { useSelector } from "react-redux";

function Reviews() {
  const [filter, setFilter] = useState("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { myReviews, otherReviews } = useSelector((state) => state.reviews);
  const REVIEWS_DATA = useMemo(() => {
    return [...myReviews, ...otherReviews].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }, [myReviews, otherReviews]);

  const averageRating = (
    REVIEWS_DATA.reduce((sum, review) => sum + review.rating, 0) /
    REVIEWS_DATA.length
  ).toFixed(1);
  const totalReviews = REVIEWS_DATA.length;

  const ratingDistribution = {
    5: REVIEWS_DATA.filter((r) => r.rating === 5).length,
    4: REVIEWS_DATA.filter((r) => r.rating === 4).length,
    3: REVIEWS_DATA.filter((r) => r.rating === 3).length,
    2: REVIEWS_DATA.filter((r) => r.rating === 2).length,
    1: REVIEWS_DATA.filter((r) => r.rating === 1).length,
  };

  const filteredReviews =
    filter === "all"
      ? REVIEWS_DATA
      : REVIEWS_DATA.filter((review) => review.rating === parseInt(filter));

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getFilterLabel = () => {
    if (filter === "all") return "All Reviews";
    return `${filter} Star Reviews`;
  };

  return (
    <div className="bg-gradient-to-b from-[#FFFBE9] via-orange-100 to-orange-200 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#FF7407] to-[#F6A51A] bg-clip-text text-transparent mb-3">
            Customer Reviews
          </h1>
          <p className="text-gray-600">
            Hear what our customers have to say about Mr Halwai
          </p>
        </div>

        {/* Rating Overview */}
        <div className="bg-white/90 backdrop-blur border border-orange-100 rounded-3xl p-8 shadow-lg mb-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-6xl font-bold text-[#FF7407] mb-2">
                {averageRating}
              </div>
              <div className="flex justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => {
                  let fillPercentage =
                    Math.min(Math.max(averageRating - i, 0), 1) * 100;

                  // 👇 Make the last star visibly empty unless rating === 5
                  if (i === 4 && averageRating < 5) {
                    fillPercentage = Math.min(fillPercentage, 65); // adjust 60–75 as you like
                  }

                  return (
                    <div key={i} className="relative inline-block">
                      <Star size={24} className="text-gray-300" />
                      <div
                        className="absolute inset-0 overflow-hidden"
                        style={{ width: `${fillPercentage}%` }}
                      >
                        <Star
                          size={24}
                          className="fill-[#FF7407] text-[#FF7407]"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-gray-600">Based on {totalReviews} reviews</p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 w-12">
                    {rating} star
                  </span>
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF7407] to-[#F6A51A]"
                      style={{
                        width: `${(ratingDistribution[rating] / totalReviews) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">
                    {ratingDistribution[rating]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="flex justify-center mb-10">
          <div className="relative w-full max-w-xs">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-6 py-3 bg-white border-2 border-[#FF7407] rounded-2xl shadow-md hover:shadow-lg transition-all font-medium text-gray-900"
            >
              <span>{getFilterLabel()}</span>
              <ChevronDown
                size={20}
                className={`text-[#FF7407] transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-[#FF7407] rounded-2xl shadow-xl z-50 overflow-hidden">
                <button
                  onClick={() => {
                    setFilter("all");
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-6 py-3 text-left font-medium transition-colors border-b border-orange-100 last:border-b-0 ${
                    filter === "all"
                      ? "bg-orange-50 text-[#FF7407]"
                      : "hover:bg-orange-50 text-gray-900"
                  }`}
                >
                  All Reviews
                </button>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => {
                      setFilter(rating.toString());
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-6 py-3 text-left font-medium transition-colors border-b border-orange-100 last:border-b-0 ${
                      filter === rating.toString()
                        ? "bg-orange-50 text-[#FF7407]"
                        : "hover:bg-orange-50 text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span>
                        {rating} Star{rating > 1 ? "s" : ""}
                      </span>
                      <div className="flex gap-1">
                        {[...Array(rating)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className="fill-[#FF7407] text-[#FF7407]"
                          />
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6 grid md:grid-cols-2 gap-6">
          {filteredReviews.map((review, index) => (
            <ReviewCard key={review.id || index} review={review} />
          ))}
        </div>

        {/* No Reviews Message */}
        {filteredReviews.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <User size={48} className="mx-auto" />
            </div>
            <p className="text-gray-600 text-lg">
              No reviews found for this rating.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reviews;
