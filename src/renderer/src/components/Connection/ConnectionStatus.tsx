import React from "react";
import { LogOut } from "lucide-react";
import { useConnectionStore } from "../../store/connectionStore";
import { useTablesStore } from "../../store/tablesStore";
import { useDataStore } from "../../store/dataStore";
import { Button, Badge } from "../Shared";
import "./ConnectionStatus.css";

export const ConnectionStatus: React.FC = () => {
  const { isConnected, connectionType, profileName, region, setDisconnected } =
    useConnectionStore();
  const { setTables, selectTable } = useTablesStore();
  const { reset } = useDataStore();

  const handleDisconnect = async () => {
    try {
      await window.api.credentials.disconnect();
    } catch (e) {
      console.error("Disconnect error", e);
    } finally {
      setDisconnected();
      setTables([]);
      selectTable(null);
      reset();
    }
  };

  if (!isConnected) return null;

  return (
    <div className="connection-status">
      <div className="connection-status__indicator"></div>
      <Badge variant="accent" size="sm">
        {region}
      </Badge>
      <span className="connection-status__label">
        {connectionType === "profile" ? profileName : "Manual"}
      </span>
      <Button
        variant="ghost"
        size="sm"
        icon={<LogOut size={14} />}
        onClick={handleDisconnect}
        className="connection-status__disconnect"
        title="Disconnect"
      />
    </div>
  );
};
