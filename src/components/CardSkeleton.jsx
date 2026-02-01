import React from "react";

function CardSkeleton() {
  return (
    <div className="relative bg-white rounded-3xl px-5 py-4 m-1 flex flex-col items-center w-48 md:w-52 shadow-sm border border-slate-200 overflow-hidden animate-pulse">
      {/* Badge skeleton */}

      {/* Image Container skeleton */}
      <div className="relative w-34 h-34 mb-3 mt-2 z-10">
        <div className="w-full h-full bg-slate-200 rounded-2xl"></div>
      </div>

      {/* Content skeleton */}
      <div className="w-full z-10 text-left">
        {/* Name skeleton */}
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>

        {/* Price and button skeleton */}
        <div className="flex justify-between items-center">
          {/* Price skeletons */}
          <div className="h-5 bg-slate-200 rounded w-16"></div>

          {/* Button skeleton */}
          <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}

export default CardSkeleton;
