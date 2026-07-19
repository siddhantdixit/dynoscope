import React, { useEffect } from "react";
import { DatabaseZap } from "lucide-react";
import { useTablesStore } from "../../store/tablesStore";
import { TableListItem } from "./TableListItem";
import { SkeletonLoader, EmptyState } from "../Shared";
import "./TableList.css";

export const TableList: React.FC = () => {
  const {
    filteredTables,
    isLoading,
    setTables,
    setLoading,
    selectedTable,
    selectTable,
  } = useTablesStore();
  const { searchQuery } = useTablesStore();

  useEffect(() => {
    const loadTables = async () => {
      setLoading(true);
      try {
        const result = await window.api.dynamodb.listTables();
        if (result.success && result.data) {
          setTables(result.data);
        }
      } catch (error) {
        console.error("Failed to load tables", error);
      } finally {
        setLoading(false);
      }
    };
    loadTables();
  }, [setTables, setLoading]);

  const tables = filteredTables();

  if (isLoading) {
    return (
      <div className="table-list__loading">
        <SkeletonLoader
          count={6}
          height={40}
          className="table-list__skeleton"
        />
      </div>
    );
  }

  if (tables.length === 0) {
    if (searchQuery) {
      return (
        <div className="table-list__empty">
          <p>No tables matching '{searchQuery}'</p>
        </div>
      );
    }
    return (
      <EmptyState
        icon={<DatabaseZap />}
        title="No tables found"
        description="This region doesn't have any DynamoDB tables yet."
      />
    );
  }

  return (
    <ul className="table-list">
      {tables.map((tableName, index) => (
        <TableListItem
          key={tableName}
          tableName={tableName}
          isSelected={selectedTable === tableName}
          onClick={() => selectTable(tableName)}
          style={{ animationDelay: `${index * 30}ms` }}
        />
      ))}
    </ul>
  );
};
