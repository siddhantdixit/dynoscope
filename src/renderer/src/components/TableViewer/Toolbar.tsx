import React, { useState, useRef, useEffect } from "react";
import { Play, Plus, Trash2, Download, Search, ChevronDown } from "lucide-react";
import { useDataStore } from "../../store/dataStore";
import { useTablesStore } from "../../store/tablesStore";
import { useUIStore } from "../../store/uiStore";
import { Button, Select } from "../Shared";
import "./Toolbar.css";

interface ToolbarProps {
  onExecute: () => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onExecute,
  onExportJSON,
  onExportCSV,
}) => {
  const {
    mode,
    setMode,
    pageSize,
    setPageSize,
    items,
    scannedCount,
    totalCount,
    isLoading,
  } = useDataStore();
  const { toggleQueryBuilder, queryBuilderExpanded, openModal } = useUIStore();
  const { selectedTable } = useTablesStore();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="toolbar">
      <div className="toolbar__left">
        <div className="toolbar__mode-toggle">
          <button
            className={`toolbar__mode-btn ${mode === "scan" ? "toolbar__mode-btn--active" : ""}`}
            onClick={() => setMode("scan")}
          >
            Scan
          </button>
          <button
            className={`toolbar__mode-btn ${mode === "query" ? "toolbar__mode-btn--active" : ""}`}
            onClick={() => setMode("query")}
          >
            Query
          </button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          icon={<Search size={14} />}
          onClick={toggleQueryBuilder}
          className={`toolbar__filter-btn ${queryBuilderExpanded ? "toolbar__filter-btn--active" : ""}`}
        >
          Filters
        </Button>

        <div className="toolbar__results-info">
          <span className="toolbar__results-count">
            {items.length} returned
          </span>
          {scannedCount > 0 && (
            <span className="toolbar__scanned-count">
              ({scannedCount} scanned)
            </span>
          )}
        </div>
      </div>

      <div className="toolbar__right">
        <div className="toolbar__page-size">
          <Select
            options={[
              { value: "25", label: "25 items" },
              { value: "50", label: "50 items" },
              { value: "100", label: "100 items" },
              { value: "300", label: "300 items" },
            ]}
            value={pageSize.toString()}
            onChange={(e) => setPageSize(Number(e.target.value))}
          />
        </div>

        <Button
          variant="primary"
          icon={<Play size={16} />}
          onClick={onExecute}
          loading={isLoading}
        >
          Execute
        </Button>

        <div className="toolbar__divider" />

        <Button
          variant="secondary"
          icon={<Plus size={16} />}
          onClick={() => openModal("itemEditor")}
        >
          Add Item
        </Button>

        <div className="toolbar__export" ref={exportRef}>
          <Button
            variant="secondary"
            icon={<Download size={16} />}
            onClick={() => setIsExportOpen(!isExportOpen)}
          >
            Export <ChevronDown size={14} style={{ marginLeft: 4 }} />
          </Button>
          
          {isExportOpen && (
            <div className="toolbar__export-menu">
              <button
                className="toolbar__export-item"
                onClick={() => {
                  onExportCSV();
                  setIsExportOpen(false);
                }}
              >
                Export CSV
              </button>
              <button
                className="toolbar__export-item"
                onClick={() => {
                  onExportJSON();
                  setIsExportOpen(false);
                }}
              >
                Export JSON
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
