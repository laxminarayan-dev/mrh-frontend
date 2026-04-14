function CardGrid({ children }) {
  return (
    <div className="w-full">
      <style>{`
                .grid-best-sellers {
                  grid-template-columns: repeat(auto-fit, minmax(100px, 150px));
                }
                @media (min-width: 440px) {
                  .grid-best-sellers {
                    grid-template-columns: repeat(auto-fit, minmax(100px, 180px));
                  }
                }
                @media (min-width: 768px) {
                  .grid-best-sellers {
                    grid-template-columns: repeat(auto-fit, minmax(100px, 210px));
                  }
                }
              `}</style>
      <div className="grid-best-sellers grid mx-auto w-full gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6 md:mt-8 justify-center">
        {children}
      </div>
    </div>
  );
}

export default CardGrid;
