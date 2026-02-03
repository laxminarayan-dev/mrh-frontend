function CardGrid({ children, className = "" }) {
  return (
    <div className="w-full overflow-hidden">
      {/* <div
        className={`mx-auto inline-grid gap-4 px-2 my-8 ${className}`}
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          maxWidth: "100%",
        }}
      > */}
      <div
        className="
    grid
    mt-8
    px-3
    gap-4
    justify-center
    [grid-template-columns:1fr]
    min-[440px]:[grid-template-columns:repeat(auto-fit,200px)]
  "
      >

        {children}
      </div>
    </div>
  );
}

export default CardGrid;
