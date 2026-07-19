import React from "react";
import "./Select.css";
import { ChevronDown } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  placeholder,
  className = "",
  disabled,
  ...props
}) => {
  return (
    <div
      className={`select-wrapper ${disabled ? "select-wrapper--disabled" : ""} ${className}`}
    >
      {label && <label className="select__label">{label}</label>}
      <div className="select__container">
        <select className="select__field" disabled={disabled} {...props}>
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="select__icon">
          <ChevronDown size={16} />
        </div>
      </div>
    </div>
  );
};
