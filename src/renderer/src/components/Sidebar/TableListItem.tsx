import React from "react";
import { Table2, ChevronRight } from "lucide-react";
import "./TableListItem.css";

interface TableListItemProps {
  tableName: string;
  isSelected: boolean;
  onClick: () => void;
  style?: React.CSSProperties;
}

export const TableListItem: React.FC<TableListItemProps> = ({
  tableName,
  isSelected,
  onClick,
  style,
}) => {
  return (
    <li
      className={`table-list-item animate-fade-in-up ${isSelected ? "table-list-item--selected" : ""}`}
      onClick={onClick}
      style={style}
    >
      <div className="table-list-item__icon">
        <Table2 size={16} />
      </div>
      <span className="table-list-item__name truncate" title={tableName}>
        {tableName}
      </span>
      <div className="table-list-item__chevron">
        <ChevronRight size={14} />
      </div>
    </li>
  );
};
