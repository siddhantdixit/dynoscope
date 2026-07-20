import React, { useMemo } from "react";
import { createPortal } from "react-dom";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";
import { useDataStore } from "../../store/dataStore";
import { useTablesStore } from "../../store/tablesStore";
import { useUIStore } from "../../store/uiStore";
import { Badge, SkeletonLoader, EmptyState } from "../Shared";
import { Search } from "lucide-react";
import "./DataGrid.css";

export const DataGrid: React.FC = () => {
  const { items, isLoading } = useDataStore();
  const { selectedTable, tableDescriptions } = useTablesStore();
  const { openInspector, openModal, addToast } = useUIStore();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [contextMenu, setContextMenu] = React.useState<{
    x: number;
    y: number;
    row: any;
    cellValue?: any;
    key?: string;
  } | null>(null);

  React.useEffect(() => {
    const closeContextMenu = () => setContextMenu(null);
    window.addEventListener("click", closeContextMenu);
    return () => window.removeEventListener("click", closeContextMenu);
  }, []);

  const handleDeleteItem = async (rowOriginal: any) => {
    if (!selectedTable || !desc) return;
    const pkName = desc.KeySchema.find((k: any) => k.KeyType === "HASH")?.AttributeName;
    const skName = desc.KeySchema.find((k: any) => k.KeyType === "RANGE")?.AttributeName;

    const key: any = {};
    if (pkName && rowOriginal[pkName] !== undefined) key[pkName] = rowOriginal[pkName];
    if (skName && rowOriginal[skName] !== undefined) key[skName] = rowOriginal[skName];

    if (Object.keys(key).length === 0) return;

    try {
      const result = await window.api.dynamodb.deleteItem(selectedTable, key);
      if (result.success) {
        addToast({ type: "success", title: "Item deleted successfully" });
        const store = useDataStore.getState();
        const newItems = store.items.filter(item => {
          if (pkName && item[pkName] !== key[pkName]) return true;
          if (skName && item[skName] !== key[skName]) return true;
          return false;
        });
        store.setItems(newItems, store.lastEvaluatedKey, store.totalCount - 1, store.scannedCount);
      } else {
        addToast({ type: "error", title: "Delete failed", message: result.error });
      }
    } catch (e: any) {
      addToast({ type: "error", title: "Unexpected error", message: e.message });
    }
  };

  const desc = selectedTable ? tableDescriptions[selectedTable] : null;

  const pk = desc?.KeySchema?.find(
    (k: any) => k.KeyType === "HASH",
  )?.AttributeName;
  const sk = desc?.KeySchema?.find(
    (k: any) => k.KeyType === "RANGE",
  )?.AttributeName;

  const columns = useMemo(() => {
    if (!items || items.length === 0 || !desc) return [];

    // Collect all unique keys from all items
    const allKeys = new Set<string>();
    items.forEach((item) => {
      Object.keys(item).forEach((key) => allKeys.add(key));
    });

    const keyArray = Array.from(allKeys);

    // Sort keys: PK first, SK second, rest alphabetically
    keyArray.sort((a, b) => {
      if (a === pk) return -1;
      if (b === pk) return 1;
      if (a === sk) return -1;
      if (b === sk) return 1;
      return a.localeCompare(b);
    });

    const helper = createColumnHelper<any>();

    return keyArray.map((key) => {
      return helper.accessor(key, {
        header: key,
        cell: (info) => {
          const val = info.getValue();
          if (val === null || val === undefined) {
            return <span className="cell-null">-</span>;
          }
          if (typeof val === "boolean") {
            return (
              <Badge size="sm" variant={val ? "success" : "default"}>
                {val.toString()}
              </Badge>
            );
          }
          if (typeof val === "object") {
            const isArray = Array.isArray(val);
            const strVal = JSON.stringify(val);
            const preview = strVal.length > 25 ? strVal.substring(0, 25) + "..." : strVal;
            const displayPreview = isArray ? `[${preview.substring(1)}` : preview;
            
            return (
              <span 
                className="cell-object cursor-pointer truncate" 
                title="Click to inspect"
                onClick={(e) => {
                  e.stopPropagation();
                  openInspector(key, val);
                }}
              >
                {displayPreview}
              </span>
            );
          }
          const strVal = String(val);
          return (
            <span className="cell-text truncate" title={strVal}>
              {strVal}
            </span>
          );
        },
      });
    });
  }, [items, desc, pk, sk, openInspector]);

  const table = useReactTable({
    data: items,
    columns,
    state: {
      sorting,
    },
    columnResizeMode: "onChange",
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div className="data-grid__loading">
        <SkeletonLoader count={15} height={36} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Search />}
        title="No items found"
        description="Try adjusting your query/scan filters or click Execute."
      />
    );
  }

  return (
    <div className="data-grid-container">
      <table className="data-grid" style={{ width: table.getTotalSize() }}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const isKey =
                  header.id ===
                    desc?.KeySchema?.find((k: any) => k.KeyType === "HASH")
                      ?.AttributeName ||
                  header.id ===
                    desc?.KeySchema?.find((k: any) => k.KeyType === "RANGE")
                      ?.AttributeName;
                return (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={header.column.getCanSort() ? "sortable" : ""}
                    style={{ width: header.getSize() }}
                  >
                    <div className={`th-content ${isKey ? "th-key" : ""}`}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {{
                        asc: " ↑",
                        desc: " ↓",
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className={`resizer ${
                        header.column.getIsResizing() ? "isResizing" : ""
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => {
                const title = pk ? `Item (PK: ${row.original[pk]})` : "Item Details";
                openInspector(title, row.original);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                // We'll catch the cell context menu instead, to have the cell value.
                // Or if we right click the row outside a cell (unlikely).
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <td 
                  key={cell.id} 
                  style={{ width: cell.column.getSize() }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setContextMenu({
                      x: e.clientX,
                      y: e.clientY,
                      row: row.original,
                      cellValue: cell.getValue(),
                      key: cell.column.id
                    });
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {contextMenu && createPortal(
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="context-menu__item"
            onClick={() => {
              const title = pk ? `Item (PK: ${contextMenu.row[pk]})` : "Item Details";
              openInspector(title, contextMenu.row);
              setContextMenu(null);
            }}
          >
            View
          </button>
          <button
            className="context-menu__item"
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(contextMenu.cellValue));
              addToast({ type: "info", title: "Copied to clipboard!" });
              setContextMenu(null);
            }}
          >
            Copy Cell
          </button>
          <button
            className="context-menu__item"
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(contextMenu.row, null, 2));
              addToast({ type: "info", title: "Copied to clipboard!" });
              setContextMenu(null);
            }}
          >
            Copy Item
          </button>
          <div className="context-menu__divider" />
          <button
            className="context-menu__item"
            onClick={() => {
              openModal("itemEditor", contextMenu.row);
              setContextMenu(null);
            }}
          >
            Edit
          </button>
          <button
            className="context-menu__item context-menu__item--danger"
            onClick={() => {
              handleDeleteItem(contextMenu.row);
              setContextMenu(null);
            }}
          >
            Delete
          </button>
        </div>,
        document.body
      )}
    </div>
  );
};
