import React from "react";

function CardGrid({ children, className }) {
  return (
    <div
      className={` ${className} max-w-3xl  mx-auto px-10 my-8 bg-transparent grid gap-2 place-items-center self-center `}
      style={{
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      }}
    >
      {children}
    </div>
  );
}

export default CardGrid;
