import { Loader } from "lucide-react";
const LoaderComp = () => {
  return (
    <div className="fixed top-0 inset-0 bg-white/70 flex items-center justify-center z-120 h-full">
      <Loader
        className="animate-spin text-orange-600 w-8 h-8 sm:w-9 md:w-10"
        size={36}
      />
    </div>
  );
};

export default LoaderComp;
