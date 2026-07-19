import React from "react";
import { Info } from "lucide-react";
import { FilterExpressionBuilder } from "./FilterExpressionBuilder";
import "./ScanMode.css";

export const ScanMode: React.FC = () => {
  return (
    <div className="scan-mode animate-fade-in">
      <div className="scan-mode__info">
        <Info size={16} className="scan-mode__info-icon" />
        <p>
          <strong>Scan</strong> reads every item in a table or a secondary
          index. By default, a Scan operation returns all data attributes for
          every item in the table or index. You can use filters to return only
          some of the items.
        </p>
      </div>

      <div className="scan-mode__filters">
        <FilterExpressionBuilder />
      </div>
    </div>
  );
};
