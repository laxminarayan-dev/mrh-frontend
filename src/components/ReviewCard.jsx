import { ThumbsUp, Calendar, Star } from "lucide-react";

function ReviewCard({ review }) {
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, options);
  };
  return (
    <div className="bg-white/90 backdrop-blur border border-orange-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 shadow-md hover:shadow-lg transition-all hover:border-[#FF7407] max-h-64 sm:max-h-72 overflow-hidden my-0">
      <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-full bg-gradient-to-br from-[#FF7407] to-[#F6A51A] flex items-center justify-center text-white font-bold text-xs sm:text-sm md:text-lg shadow-lg">
            {review.name.split(" ")[0].replace(" ", "").charAt(0).toUpperCase()}
            {review.name.split(" ")[1].replace(" ", "").charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Review Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-1.5 sm:mb-2">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 truncate">
                {review.name}
              </h3>
              <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm text-gray-600">
                <Calendar size={12} className="sm:w-3 md:w-3.5" />
                <span className="truncate">{formatDate(review.createdAt)}</span>
              </div>
            </div>
            <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={`sm:w-4 md:w-5 ${
                    i < review.rating
                      ? "fill-[#FF7407] text-[#FF7407]"
                      : "text-gray-300 fill-[#88888860]"
                  }`}
                />
              ))}
            </div>
          </div>

          <p className="text-[11px] sm:text-xs md:text-sm lg:text-base text-gray-700 leading-relaxed mb-2 sm:mb-3 md:mb-4 line-clamp-3">
            {review.review}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ReviewCard;
