import { ThumbsUp, Calendar, Star } from "lucide-react";

function ReviewCard({ review }) {
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, options);
    }
    return (
        <div
            className="bg-white/90 backdrop-blur border border-orange-100 rounded-2xl p-8 shadow-md hover:shadow-lg transition-all hover:border-[#FF7407] max-h-72 overflow-hidden my-0"
        >
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#FF7407] to-[#F6A51A] flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {review.name.split(" ")[0].replace(" ", "").charAt(0).toUpperCase()}
                        {review.name.split(" ")[1].replace(" ", "").charAt(0).toUpperCase()}
                    </div>
                </div>

                {/* Review Content */}
                <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{review.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar size={14} />
                                <span>{formatDate(review.createdAt)}</span>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={20}
                                    className={i < review.rating ? "fill-[#FF7407] text-[#FF7407]" : "text-gray-300 fill-[#88888860]"}
                                />
                            ))}
                        </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed mb-4 line-clamp-3">{review.review}</p>

                    {/* Helpful Button */}
                    <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#FF7407] transition-colors">
                        <ThumbsUp size={16} />
                        <span>Helpful ({review.likedBy.length})</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ReviewCard