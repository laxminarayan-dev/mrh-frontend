import React from "react";

function CardGrid({ children, className = "" }) {
  return (
    <div className="w-full overflow-hidden">
      {/* <div
        className={`mx-auto inline-grid gap-4 px-2 my-8 ${className}`}
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 200px))",
          maxWidth: "100%",
        }}
      > */}
      <div
        className={`mx-auto inline-grid grid-cols-1 min-[410px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 my-8 w-[80vw] min-[410px]:w-[100%] px-2 min-[410px]:px-4 ${className}`}>
        {children}
      </div>
    </div>
  );
}

export default CardGrid;
