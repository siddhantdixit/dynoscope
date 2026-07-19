import React from "react";
import { useUIStore } from "../../store/uiStore";
import { useDataStore } from "../../store/dataStore";
import { ScanMode } from "./ScanMode";
import { QueryMode } from "./QueryMode";
import { Button } from "../Shared";
import { Play } from "lucide-react";
import "./QueryBuilder.css";

interface QueryBuilderProps {
  onExecute: () => void;
}

export const QueryBuilder: React.FC<QueryBuilderProps> = ({ onExecute }) => {
  const { queryBuilderExpanded } = useUIStore();
  const { mode, isLoading } = useDataStore();

  if (!queryBuilderExpanded) return null;

  return (
    <div className="query-builder animate-fade-in-up">
      <div className="query-builder__content">
        {mode === "scan" ? <ScanMode /> : <QueryMode />}
      </div>
      <div className="query-builder__footer">
        <Button
          variant="primary"
          icon={<Play size={16} />}
          onClick={onExecute}
          loading={isLoading}
        >
          {mode === "scan" ? "Run Scan" : "Run Query"}
        </Button>
      </div>
    </div>
  );
};
