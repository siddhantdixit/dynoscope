import React, { useEffect, useState } from "react";
import { useTablesStore } from "../../store/tablesStore";
import { useDataStore } from "../../store/dataStore";
import { Select, Input } from "../Shared";
import { FilterExpressionBuilder } from "./FilterExpressionBuilder";
import "./QueryMode.css";

export const QueryMode: React.FC = () => {
  const { selectedTable, tableDescriptions } = useTablesStore();
  const { setSelectedIndex, selectedIndex, setQueryKeyCondition } =
    useDataStore();

  const [pkValue, setPkValue] = useState("");
  const [skOperator, setSkOperator] = useState("equals");
  const [skValue, setSkValue] = useState("");

  const desc = selectedTable ? tableDescriptions[selectedTable] : null;

  useEffect(() => {
    if (!desc) return;

    let pkName = "";
    let skName = undefined;

    if (!selectedIndex) {
      // Table keys
      pkName =
        desc.KeySchema?.find((k: any) => k.KeyType === "HASH")?.AttributeName ||
        "";
      skName = desc.KeySchema?.find(
        (k: any) => k.KeyType === "RANGE",
      )?.AttributeName;
    } else {
      // Index keys
      const allIndexes = [
        ...(desc.GlobalSecondaryIndexes || []),
        ...(desc.LocalSecondaryIndexes || []),
      ];
      const index = allIndexes.find((i) => i.IndexName === selectedIndex);
      if (index) {
        pkName =
          index.KeySchema?.find((k: any) => k.KeyType === "HASH")
            ?.AttributeName || "";
        skName = index.KeySchema?.find(
          (k: any) => k.KeyType === "RANGE",
        )?.AttributeName;
      }
    }

    if (pkValue) {
      const condition: any = {
        partitionKey: { name: pkName, value: pkValue },
      };

      if (skName && skValue) {
        condition.sortKey = {
          name: skName,
          operator: skOperator,
          value: skValue,
        };
      }

      setQueryKeyCondition(condition);
    } else {
      setQueryKeyCondition(null);
    }
  }, [desc, selectedIndex, pkValue, skOperator, skValue, setQueryKeyCondition]);

  if (!desc) return null;

  const indexOptions = [
    { value: "", label: "Table Index (Default)" },
    ...(desc.GlobalSecondaryIndexes?.map((i: any) => ({
      value: i.IndexName,
      label: `GSI: ${i.IndexName}`,
    })) || []),
    ...(desc.LocalSecondaryIndexes?.map((i: any) => ({
      value: i.IndexName,
      label: `LSI: ${i.IndexName}`,
    })) || []),
  ];

  let pkName = "";
  let skName = undefined;

  if (!selectedIndex) {
    pkName =
      desc.KeySchema?.find((k: any) => k.KeyType === "HASH")?.AttributeName ||
      "";
    skName = desc.KeySchema?.find(
      (k: any) => k.KeyType === "RANGE",
    )?.AttributeName;
  } else {
    const allIndexes = [
      ...(desc.GlobalSecondaryIndexes || []),
      ...(desc.LocalSecondaryIndexes || []),
    ];
    const index = allIndexes.find((i) => i.IndexName === selectedIndex);
    if (index) {
      pkName =
        index.KeySchema?.find((k: any) => k.KeyType === "HASH")
          ?.AttributeName || "";
      skName = index.KeySchema?.find(
        (k: any) => k.KeyType === "RANGE",
      )?.AttributeName;
    }
  }

  return (
    <div className="query-mode animate-fade-in">
      <div className="query-mode__section">
        <h4 className="query-mode__title">Index Selection</h4>
        <div className="query-mode__row">
          <Select
            label="Index"
            options={indexOptions}
            value={selectedIndex || ""}
            onChange={(e) => setSelectedIndex(e.target.value)}
          />
        </div>
      </div>

      <div className="query-mode__section">
        <h4 className="query-mode__title">Key Conditions</h4>
        <div className="query-mode__row query-mode__keys">
          <Input
            label={`Partition Key (${pkName})`}
            placeholder="Required"
            value={pkValue}
            onChange={(e) => setPkValue(e.target.value)}
          />

          {skName && (
            <>
              <Select
                label="Operator"
                options={[
                  { value: "equals", label: "=" },
                  { value: "less_than", label: "<" },
                  { value: "less_than_equals", label: "<=" },
                  { value: "greater_than", label: ">" },
                  { value: "greater_than_equals", label: ">=" },
                  { value: "begins_with", label: "Begins with" },
                ]}
                value={skOperator}
                onChange={(e) => setSkOperator(e.target.value)}
              />
              <Input
                label={`Sort Key (${skName})`}
                placeholder="Optional"
                value={skValue}
                onChange={(e) => setSkValue(e.target.value)}
              />
            </>
          )}
        </div>
      </div>

      <div className="query-mode__section">
        <h4 className="query-mode__title">Filters (Optional)</h4>
        <FilterExpressionBuilder />
      </div>
    </div>
  );
};
