import React from "react";

function CardGrid({ children, className }) {
  return (
    <div className="w-full overflow-hidden">
      <div
        className={`mx-auto inline-grid gap-4 px-4 my-8 ${className}`}
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 220px))",
          maxWidth: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default CardGrid;
