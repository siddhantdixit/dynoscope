import React, { useEffect, useState } from "react";
import { PanelLeftClose, PanelLeftOpen, Sun, Moon, Table2 } from "lucide-react";
import { useConnectionStore } from "./store/connectionStore";
import { useUIStore } from "./store/uiStore";
import { useTablesStore } from "./store/tablesStore";
import { ConnectionScreen, ConnectionStatus } from "./components/Connection";
import { Sidebar } from "./components/Sidebar";
import { Button, EmptyState } from "./components/Shared";
import { ToastContainer } from "./components/Shared/Toast";
import { TableViewer } from "./components/TableViewer";
import { ItemEditorModal } from "./components/ItemEditor";
import {
  CreateTableModal,
  DeleteTableConfirmation,
} from "./components/TableManagement";
import { TitleBar } from "./components/TitleBar";
import "./App.css";

declare global {
  interface Window {
    api: any;
  }
}

const App: React.FC = () => {
  const { isConnected, setDisconnected } = useConnectionStore();
  const { theme, toggleTheme, sidebarCollapsed, toggleSidebar } = useUIStore();
  const { selectedTable } = useTablesStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleMenuAction = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const command = customEvent.detail;
      console.log("Custom menu command:", command);
      switch (command) {
        case "toggle-sidebar":
          toggleSidebar();
          break;
        case "new-connection":
        case "disconnect":
          setDisconnected();
          break;
        case "export-json":
          console.log("Trigger JSON export (TODO)");
          break;
        case "export-csv":
          console.log("Trigger CSV export (TODO)");
          break;
        case "toggle-devtools":
          window.api?.app?.onMenuCommand && console.log("DevTools handled natively or needs IPC if not working");
          break;
      }
    };

    window.addEventListener("menu-action", handleMenuAction);

    // Also keep the IPC listener for actual native menu fallbacks on mac
    let cleanup = () => {};
    if (window.api?.app?.onMenuCommand) {
      cleanup = window.api.app.onMenuCommand((command: string) => {
        window.dispatchEvent(new CustomEvent("menu-action", { detail: command }));
      });
    }

    return () => {
      window.removeEventListener("menu-action", handleMenuAction);
      cleanup();
    };
  }, [toggleSidebar, setDisconnected]);

  if (!isConnected) {
    return (
      <div className="app-container" data-theme={theme}>
        <TitleBar />
        <div className="app">
          <ConnectionScreen />
          <ToastContainer />
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" data-theme={theme}>
      <TitleBar />
      <div className="app">
      <header className="app__header">
        <div className="app__header-left">
          <Button
            variant="ghost"
            size="sm"
            icon={
              sidebarCollapsed ? (
                <PanelLeftOpen size={18} />
              ) : (
                <PanelLeftClose size={18} />
              )
            }
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          />
          <h1 className="app__title">DynoScope</h1>
        </div>

        <div className="app__header-right">
          <ConnectionStatus />
          <Button
            variant="ghost"
            size="sm"
            icon={theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            onClick={toggleTheme}
            aria-label="Toggle theme"
          />
        </div>
      </header>

      <div className="app__body">
        <Sidebar />
        <main className="app__content">
          {!selectedTable ? (
            <div className="app__empty-wrapper">
              <EmptyState
                icon={<Table2 />}
                title="Select a table"
                description="Choose a table from the sidebar to start browsing your DynamoDB data."
              />
            </div>
          ) : (
            <div
              data-component="table-viewer"
              style={{ height: "100%", padding: "1rem" }}
            >
              <TableViewer />
            </div>
          )}
        </main>
      </div>

      <ToastContainer />
      <ItemEditorModal />
      <CreateTableModal />
      <DeleteTableConfirmation />
      </div>
    </div>
  );
};

export default App;
