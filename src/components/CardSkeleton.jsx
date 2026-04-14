import React from "react";

function CardSkeleton() {
  return (
    <div className="relative bg-white rounded-2xl sm:rounded-3xl px-2 sm:px-3 md:px-4 lg:px-5 py-2 sm:py-3 md:py-4 m-0.5 sm:m-1 flex flex-col items-center w-full min-[440px]:w-28 sm:w-32 md:w-40 lg:w-48 min-[768px]:w-52 shadow-sm border border-slate-200 overflow-hidden animate-pulse">
      {/* Badge skeleton */}

      {/* Image Container skeleton */}
      <div className="relative w-16 sm:w-20 md:w-24 lg:w-28 h-16 sm:h-20 md:h-24 lg:h-28 mb-2 sm:mb-2.5 md:mb-3 mt-1 sm:mt-1.5 md:mt-2 z-10">
        <div className="w-full h-full bg-slate-200 rounded-lg sm:rounded-xl md:rounded-2xl"></div>
      </div>

      {/* Content skeleton */}
      <div className="w-full z-10 text-left">
        {/* Name skeleton */}
        <div className="h-2.5 sm:h-3 md:h-3.5 lg:h-4 bg-slate-200 rounded w-3/4 mb-1.5 sm:mb-2 md:mb-2.5"></div>

        {/* Price and button skeleton */}
        <div className="flex justify-between items-center gap-2 sm:gap-2.5">
          {/* Price skeletons */}
          <div className="h-3.5 sm:h-4 md:h-4.5 lg:h-5 bg-slate-200 rounded w-12 sm:w-14 md:w-16"></div>

          {/* Button skeleton */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 bg-slate-200 rounded-lg sm:rounded-lg md:rounded-xl flex-shrink-0"></div>
        </div>
      </div>
    </div>
  );
}

export default CardSkeleton;
