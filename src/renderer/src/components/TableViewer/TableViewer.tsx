import React, { useEffect } from "react";
import { useTablesStore } from "../../store/tablesStore";
import { useDataStore } from "../../store/dataStore";
import { TableInfo } from "./TableInfo";
import { Toolbar } from "./Toolbar";
import { DataGrid } from "./DataGrid";
import { ItemInspector } from "./ItemInspector";
import { QueryBuilder } from "../QueryBuilder";
import "./TableViewer.css";

export const TableViewer: React.FC = () => {
  const { selectedTable, setTableDescription } = useTablesStore();
  const {
    setItems,
    pageSize,
    mode,
    filters,
    queryKeyCondition,
    selectedIndex,
    setLoading,
    setError,
  } = useDataStore();

  useEffect(() => {
    if (!selectedTable) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const descResult =
          await window.api.dynamodb.describeTable(selectedTable);
        if (descResult.success && descResult.data) {
          setTableDescription(selectedTable, descResult.data);
        }

        const scanResult = await window.api.dynamodb.scanItems({
          tableName: selectedTable,
          limit: pageSize,
        });

        if (scanResult.success && scanResult.data) {
          setItems(
            scanResult.data.items,
            scanResult.data.lastEvaluatedKey,
            scanResult.data.count,
            scanResult.data.scannedCount,
          );
        } else {
          setError(scanResult.error || "Failed to scan table");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred while loading table data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [
    selectedTable,
    pageSize,
    setTableDescription,
    setItems,
    setLoading,
    setError,
  ]);

  const executeScan = async () => {
    if (!selectedTable) return;
    setLoading(true);
    try {
      const result = await window.api.dynamodb.scanItems({
        tableName: selectedTable,
        filters: filters.length > 0 ? filters : undefined,
        limit: pageSize,
      });

      if (result.success && result.data) {
        setItems(
          result.data.items,
          result.data.lastEvaluatedKey,
          result.data.count,
          result.data.scannedCount,
        );
      } else {
        setError(result.error || "Scan failed");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const executeQuery = async () => {
    if (!selectedTable || !queryKeyCondition) return;
    setLoading(true);
    try {
      const result = await window.api.dynamodb.queryItems({
        tableName: selectedTable,
        keyCondition: queryKeyCondition,
        indexName: selectedIndex || undefined,
        filters: filters.length > 0 ? filters : undefined,
        limit: pageSize,
      });

      if (result.success && result.data) {
        setItems(
          result.data.items,
          result.data.lastEvaluatedKey,
          result.data.count,
          result.data.scannedCount,
        );
      } else {
        setError(result.error || "Query failed");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = () => {
    if (mode === "scan") {
      executeScan();
    } else {
      executeQuery();
    }
  };

  const handleExportJSON = async () => {
    const items = useDataStore.getState().items;
    try {
      await window.api.export.toJSON(items);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportCSV = async () => {
    const items = useDataStore.getState().items;
    try {
      await window.api.export.toCSV(items);
    } catch (e) {
      console.error(e);
    }
  };

  if (!selectedTable) return null;

  return (
    <div className="table-viewer animate-fade-in-up">
      <TableInfo />
      <QueryBuilder onExecute={handleExecute} />
      <Toolbar
        onExecute={handleExecute}
        onExportJSON={handleExportJSON}
        onExportCSV={handleExportCSV}
      />
      <div className="table-viewer__content">
        <div className="table-viewer__grid-wrapper">
          <DataGrid />
        </div>
        <ItemInspector />
      </div>
    </div>
  );
};
