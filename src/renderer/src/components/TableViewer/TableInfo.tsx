import React from "react";
import { ChevronDown, ChevronUp, Hash, ArrowUpDown } from "lucide-react";
import { useTablesStore } from "../../store/tablesStore";
import { useUIStore } from "../../store/uiStore";
import { Badge } from "../Shared";
import "./TableInfo.css";

export const TableInfo: React.FC = () => {
  const { selectedTable, tableDescriptions } = useTablesStore();
  const { tableInfoExpanded, toggleTableInfo } = useUIStore();

  const desc = selectedTable ? tableDescriptions[selectedTable] : null;

  if (!desc) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">ACTIVE</Badge>;
      case "CREATING":
        return <Badge variant="warning">CREATING</Badge>;
      case "DELETING":
        return <Badge variant="danger">DELETING</Badge>;
      case "UPDATING":
        return <Badge variant="warning">UPDATING</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const pk = desc.KeySchema?.find(
    (k: any) => k.KeyType === "HASH",
  )?.AttributeName;
  const pkType = desc.AttributeDefinitions?.find(
    (a: any) => a.AttributeName === pk,
  )?.AttributeType;

  const sk = desc.KeySchema?.find(
    (k: any) => k.KeyType === "RANGE",
  )?.AttributeName;
  const skType = sk
    ? desc.AttributeDefinitions?.find((a: any) => a.AttributeName === sk)
        ?.AttributeType
    : null;

  return (
    <div className="table-info">
      <div className="table-info__header" onClick={toggleTableInfo}>
        <div className="table-info__title-row">
          <h3 className="table-info__title">Table Information</h3>
          {getStatusBadge(desc.TableStatus)}
        </div>
        <button className="table-info__toggle" aria-label="Toggle table info">
          {tableInfoExpanded ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </button>
      </div>

      <div
        className={`table-info__content ${tableInfoExpanded ? "table-info__content--expanded" : ""}`}
      >
        <div className="table-info__grid">
          <div className="table-info__card">
            <span className="table-info__label">Table Name</span>
            <span className="table-info__value mono">{desc.TableName}</span>
          </div>
          <div className="table-info__card">
            <span className="table-info__label">Item Count</span>
            <span className="table-info__value">
              {desc.ItemCount?.toLocaleString() || 0}
            </span>
          </div>
          <div className="table-info__card">
            <span className="table-info__label">Table Size</span>
            <span className="table-info__value">
              {formatBytes(desc.TableSizeBytes || 0)}
            </span>
          </div>
          <div className="table-info__card">
            <span className="table-info__label">Creation Date</span>
            <span className="table-info__value">
              {desc.CreationDateTime
                ? new Date(desc.CreationDateTime).toLocaleString()
                : "Unknown"}
            </span>
          </div>
          <div className="table-info__card">
            <span className="table-info__label">Billing Mode</span>
            <span className="table-info__value">
              {desc.BillingModeSummary?.BillingMode || "PROVISIONED"}
            </span>
          </div>
        </div>

        <div className="table-info__keys">
          <h4 className="table-info__section-title">Key Schema</h4>
          <div className="table-info__keys-flex">
            <div className="table-info__key-badge">
              <Hash size={14} className="table-info__key-icon" />
              <span>{pk}</span>
              <Badge size="sm" variant="accent">
                {pkType}
              </Badge>
              <span className="table-info__key-desc">Partition Key</span>
            </div>
            {sk && (
              <div className="table-info__key-badge">
                <ArrowUpDown size={14} className="table-info__key-icon" />
                <span>{sk}</span>
                <Badge size="sm" variant="accent">
                  {skType}
                </Badge>
                <span className="table-info__key-desc">Sort Key</span>
              </div>
            )}
          </div>
        </div>

        {desc.GlobalSecondaryIndexes &&
          desc.GlobalSecondaryIndexes.length > 0 && (
            <div className="table-info__indexes">
              <h4 className="table-info__section-title">
                Global Secondary Indexes
              </h4>
              <div className="table-info__indexes-grid">
                {desc.GlobalSecondaryIndexes.map((gsi: any) => {
                  const gsiPk = gsi.KeySchema.find(
                    (k: any) => k.KeyType === "HASH",
                  )?.AttributeName;
                  const gsiSk = gsi.KeySchema.find(
                    (k: any) => k.KeyType === "RANGE",
                  )?.AttributeName;
                  return (
                    <div key={gsi.IndexName} className="table-info__index-card">
                      <div className="table-info__index-header">
                        <span className="table-info__index-name mono">
                          {gsi.IndexName}
                        </span>
                        {getStatusBadge(gsi.IndexStatus)}
                      </div>
                      <div className="table-info__index-keys">
                        <span className="table-info__index-key">
                          <Hash size={12} /> {gsiPk}
                        </span>
                        {gsiSk && (
                          <span className="table-info__index-key">
                            <ArrowUpDown size={12} /> {gsiSk}
                          </span>
                        )}
                      </div>
                      <div className="table-info__index-meta">
                        <span>{gsi.Projection?.ProjectionType}</span>
                        <span>•</span>
                        <span>
                          {gsi.ItemCount?.toLocaleString() || 0} items
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};
