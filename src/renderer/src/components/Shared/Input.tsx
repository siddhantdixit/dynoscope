import React, { forwardRef } from "react";
import "./Input.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, className = "", disabled, ...props }, ref) => {
    return (
      <div
        className={`input-wrapper ${disabled ? "input-wrapper--disabled" : ""} ${className}`}
      >
        {label && <label className="input__label">{label}</label>}
        <div
          className={`input__container ${error ? "input__container--error" : ""}`}
        >
          {icon && <div className="input__icon">{icon}</div>}
          <input
            ref={ref}
            className={`input__field ${icon ? "input__field--with-icon" : ""}`}
            disabled={disabled}
            {...props}
          />
        </div>
        {error && <div className="input__error">{error}</div>}
      </div>
    );
  },
);

Input.displayName = "Input";
