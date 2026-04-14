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
      <div className="max-w-6xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 py-6 sm:py-10 md:py-14 lg:py-20">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#FF7407] to-[#F6A51A] bg-clip-text text-transparent mb-2 sm:mb-2.5 md:mb-3">
            Customer Reviews
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm md:text-base">
            Hear what our customers have to say about Mr Halwai
          </p>
        </div>

        {/* Rating Overview */}
        <div className="bg-white/90 backdrop-blur border border-orange-100 rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-5 md:p-6 lg:p-8 shadow-lg mb-6 sm:mb-7 md:mb-8">
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-center">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#FF7407] mb-1.5 sm:mb-2">
                {averageRating}
              </div>
              <div className="flex justify-center gap-0.5 sm:gap-1 mb-1.5 sm:mb-2">
                {[...Array(5)].map((_, i) => {
                  let fillPercentage =
                    Math.min(Math.max(averageRating - i, 0), 1) * 100;

                  // 👇 Make the last star visibly empty unless rating === 5
                  if (i === 4 && averageRating < 5) {
                    fillPercentage = Math.min(fillPercentage, 65); // adjust 60–75 as you like
                  }

                  return (
                    <div key={i} className="relative inline-block">
                      <Star size={18} className="sm:w-6 md:w-7 text-gray-300" />
                      <div
                        className="absolute inset-0 overflow-hidden"
                        style={{ width: `${fillPercentage}%` }}
                      >
                        <Star
                          size={18}
                          className="sm:w-6 md:w-7 fill-[#FF7407] text-[#FF7407]"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-slate-600 text-xs sm:text-sm">
                Based on {totalReviews} reviews
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-1.5 sm:space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xs sm:text-sm font-medium text-gray-700 w-10 sm:w-12">
                    {rating} star
                  </span>
                  <div className="flex-1 h-2 sm:h-2.5 md:h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF7407] to-[#F6A51A]"
                      style={{
                        width: `${(ratingDistribution[rating] / totalReviews) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600 w-6 sm:w-8">
                    {ratingDistribution[rating]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="flex justify-center mb-6 sm:mb-7 md:mb-8">
          <div className="relative w-full sm:max-w-xs px-2 sm:px-0">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2.5 md:py-3 bg-white border-2 border-[#FF7407] rounded-lg sm:rounded-xl md:rounded-2xl shadow-md hover:shadow-lg transition-all font-medium text-sm sm:text-base text-gray-900"
            >
              <span className="text-xs sm:text-sm md:text-base">
                {getFilterLabel()}
              </span>
              <ChevronDown
                size={16}
                className={`sm:w-5 md:w-6 text-[#FF7407] transition-transform flex-shrink-0 ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 sm:-left-[2px] sm:-right-[2px] mt-2 bg-white border-2 border-[#FF7407] rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl z-50 overflow-hidden">
                <button
                  onClick={() => {
                    setFilter("all");
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm text-left font-medium transition-colors border-b border-orange-100 last:border-b-0 ${
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
                    className={`w-full px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm text-left font-medium transition-colors border-b border-orange-100 last:border-b-0 ${
                      filter === rating.toString()
                        ? "bg-orange-50 text-[#FF7407]"
                        : "hover:bg-orange-50 text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
                      <span className="text-xs sm:text-sm">
                        {rating} Star{rating > 1 ? "s" : ""}
                      </span>
                      <div className="flex gap-0.5 sm:gap-1">
                        {[...Array(rating)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className="sm:w-3.5 fill-[#FF7407] text-[#FF7407]"
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
        <div className="space-y-3 sm:space-y-4 md:space-y-5 grid md:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
          {filteredReviews.map((review, index) => (
            <ReviewCard key={review.id || index} review={review} />
          ))}
        </div>

        {/* No Reviews Message */}
        {filteredReviews.length === 0 && (
          <div className="text-center py-8 sm:py-10 md:py-12">
            <div className="text-gray-400 mb-3 sm:mb-4">
              <User size={32} className="mx-auto sm:w-12 md:w-14" />
            </div>
            <p className="text-gray-600 text-xs sm:text-sm md:text-base">
              No reviews found for this rating.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reviews;
