import React from "react";
import { Plus, X } from "lucide-react";
import { useDataStore } from "../../store/dataStore";
import { Input, Select, Button } from "../Shared";
import "./FilterExpressionBuilder.css";

const OPERATORS = [
  { value: "equals", label: "=" },
  { value: "not_equals", label: "<>" },
  { value: "less_than", label: "<" },
  { value: "less_than_equals", label: "<=" },
  { value: "greater_than", label: ">" },
  { value: "greater_than_equals", label: ">=" },
  { value: "between", label: "Between" },
  { value: "in", label: "In" },
  { value: "exists", label: "Exists" },
  { value: "not_exists", label: "Not Exists" },
  { value: "contains", label: "Contains" },
  { value: "not_contains", label: "Not Contains" },
  { value: "begins_with", label: "Begins with" },
];

export const FilterExpressionBuilder: React.FC = () => {
  const { filters, addFilter, removeFilter, updateFilter } = useDataStore();

  return (
    <div className="filter-builder">
      {filters.length === 0 ? (
        <div className="filter-builder__empty">
          <p>No filters applied.</p>
        </div>
      ) : (
        <div className="filter-builder__list">
          {filters.map((filter, index) => (
            <div key={index} className="filter-builder__row animate-fade-in-up">
              <Input
                placeholder="Attribute Name"
                value={filter.attribute}
                onChange={(e) =>
                  updateFilter(index, { attribute: e.target.value })
                }
                className="filter-builder__input"
              />

              <Select
                options={OPERATORS}
                value={filter.operator}
                onChange={(e) =>
                  updateFilter(index, { operator: e.target.value })
                }
                className="filter-builder__select"
              />

              {filter.operator !== "exists" &&
                filter.operator !== "not_exists" && (
                  <Input
                    placeholder="Value"
                    value={filter.value}
                    onChange={(e) =>
                      updateFilter(index, { value: e.target.value })
                    }
                    className="filter-builder__input"
                  />
                )}

              {filter.operator === "between" && (
                <Input
                  placeholder="Value 2"
                  value={filter.value2 || ""}
                  onChange={(e) =>
                    updateFilter(index, { value2: e.target.value })
                  }
                  className="filter-builder__input"
                />
              )}

              <Button
                variant="ghost"
                size="sm"
                icon={<X size={16} />}
                onClick={() => removeFilter(index)}
                className="filter-builder__remove"
                aria-label="Remove filter"
              />
            </div>
          ))}
        </div>
      )}

      <div className="filter-builder__actions">
        <Button
          variant="secondary"
          size="sm"
          icon={<Plus size={14} />}
          onClick={addFilter}
        >
          Add Filter
        </Button>
      </div>
    </div>
  );
};
