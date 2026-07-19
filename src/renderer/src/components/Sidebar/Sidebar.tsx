import React from "react";
import { RotateCcw, Search } from "lucide-react";
import { useUIStore } from "../../store/uiStore";
import { useTablesStore } from "../../store/tablesStore";
import { useConnectionStore } from "../../store/connectionStore";
import { Button, Input, Badge } from "../Shared";
import { TableList } from "./TableList";
import "./Sidebar.css";

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed } = useUIStore();
  const { tables, searchQuery, setSearchQuery } = useTablesStore();
  const { region, profileName, connectionType } = useConnectionStore();

  const handleRefresh = async () => {
    try {
      useTablesStore.getState().setLoading(true);
      const result = await window.api.dynamodb.listTables();
      if (result.success && result.data) {
        useTablesStore.getState().setTables(result.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      useTablesStore.getState().setLoading(false);
    }
  };

  return (
    <aside
      className={`sidebar ${sidebarCollapsed ? "sidebar--collapsed" : ""}`}
    >
      <div className="sidebar__inner">
        <div className="sidebar__header">
          <div className="sidebar__title-row">
            <span className="sidebar__title">Dyno<span className="sidebar__title-accent">Scope</span></span>
            <Badge variant="default" size="sm">
              {tables.length}
            </Badge>
            <div style={{ flex: 1 }} />
            <Button
              variant="ghost"
              size="sm"
              icon={<RotateCcw size={14} />}
              onClick={handleRefresh}
              aria-label="Refresh tables"
              className="sidebar__refresh-btn"
            />
          </div>
          <div className="sidebar__search">
            <Input
              placeholder="Search tables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search />}
            />
          </div>
        </div>

        <div className="sidebar__content">
          <TableList />
        </div>

        <div className="sidebar__footer">
          <div className="sidebar__connection-info">
            <span className="sidebar__connection-region">{region}</span>
            <span className="sidebar__connection-profile">
              {connectionType === "profile" ? profileName : "Manual"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
