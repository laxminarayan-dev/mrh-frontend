function CardGrid({ children, className = "" }) {
  return (
    <div className="w-full">
      <div
        className="grid mt-8 px-3 gap-4 justify-center [grid-template-columns:1fr] min-[440px]:[grid-template-columns:repeat(auto-fit,200px)]
  "
      >
        {children}
      </div>
    </div>
  );
}

export default CardGrid;
