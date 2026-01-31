import { useState } from "react";

function ImageWithSkeleton({
  src,
  alt,
  className = "",
  width,
  height,
  priority = false,
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className="relative overflow-hidden bg-gray-200 animate-pulse"
      style={{ width, height }}
    >
      {!loaded ? (
        <div className="absolute inset-0 bg-gray-300 animate-pulse" />
      ) : (
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => {
            setLoaded(true);
            console.log("image loaded");
          }}
          className={`transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          } ${className}`}
        />
      )}
    </div>
  );
}

export default ImageWithSkeleton;
