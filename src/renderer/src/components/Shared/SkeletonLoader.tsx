import React from "react";
import "./SkeletonLoader.css";

interface SkeletonLoaderProps {
  width?: string | number;
  height?: string | number;
  variant?: "text" | "rect" | "circle";
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = "100%",
  height = "1rem",
  variant = "text",
  count = 1,
  className = "",
}) => {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`skeleton skeleton--${variant} ${className}`}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
    />
  ));

  if (count === 1) return <>{skeletons[0]}</>;

  return (
    <div
      className="skeleton-container"
      style={{ display: "flex", flexDirection: "column", gap: "8px" }}
    >
      {skeletons}
    </div>
  );
};
