import React from "react";
import "./Spinner.css";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  className = "",
}) => {
  return <div className={`spinner spinner--${size} ${className}`}></div>;
};
