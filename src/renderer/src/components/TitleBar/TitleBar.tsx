import React, { useState, useEffect, useRef } from "react";
import "./TitleBar.css";
import { useConnectionStore } from "../../store/connectionStore";

type MenuType = "File" | "Edit" | "View" | "Help" | null;

export const TitleBar: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<MenuType>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isConnected, setDisconnected } = useConnectionStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (menu: MenuType) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleMouseEnter = (menu: MenuType) => {
    if (activeMenu && activeMenu !== menu) {
      setActiveMenu(menu);
    }
  };

  const closeMenu = () => setActiveMenu(null);

  const execMenuCommand = (command: string) => {
    closeMenu();
    // In a real app we'd trigger app-wide events or IPC, here we simulate the main menu
    switch (command) {
      case "new-connection":
      case "disconnect":
        setDisconnected();
        break;
      case "toggle-sidebar":
        // This is handled via the app header normally, but we can emit a custom event
        window.dispatchEvent(new CustomEvent("menu-action", { detail: command }));
        break;
      case "toggle-devtools":
      case "reload":
      case "zoom-in":
      case "zoom-out":
      case "zoom-reset":
      case "exit":
        window.dispatchEvent(new CustomEvent("menu-action", { detail: command }));
        break;
      default:
        console.log("Not implemented:", command);
    }
  };

  return (
    <div className="titlebar">
      <div className="titlebar-drag-region" />
      <div className="titlebar-content">
        <div className="titlebar-icon">
          <img src="https://api.iconify.design/logos:aws-dynamodb.svg" alt="DynoScope" />
        </div>
        
        <div className="titlebar-menu" ref={menuRef}>
          {/* FILE MENU */}
          <div className="titlebar-menu-item-container">
            <div
              className={`titlebar-menu-item ${activeMenu === "File" ? "active" : ""}`}
              onClick={() => toggleMenu("File")}
              onMouseEnter={() => handleMouseEnter("File")}
            >
              File
            </div>
            {activeMenu === "File" && (
              <div className="titlebar-dropdown">
                {isConnected ? (
                  <>
                    <div className="titlebar-dropdown-item" onClick={() => execMenuCommand("new-connection")}>New Connection</div>
                    <div className="titlebar-dropdown-item" onClick={() => execMenuCommand("disconnect")}>Disconnect</div>
                    <div className="titlebar-dropdown-divider" />
                    <div className="titlebar-dropdown-item" onClick={() => execMenuCommand("export-json")}>Export JSON</div>
                    <div className="titlebar-dropdown-item" onClick={() => execMenuCommand("export-csv")}>Export CSV</div>
                  </>
                ) : (
                  <div className="titlebar-dropdown-item disabled">Connect first...</div>
                )}
                <div className="titlebar-dropdown-divider" />
                <div className="titlebar-dropdown-item" onClick={() => execMenuCommand("exit")}>Exit</div>
              </div>
            )}
          </div>

          {/* EDIT MENU */}
          <div className="titlebar-menu-item-container">
            <div
              className={`titlebar-menu-item ${activeMenu === "Edit" ? "active" : ""}`}
              onClick={() => toggleMenu("Edit")}
              onMouseEnter={() => handleMouseEnter("Edit")}
            >
              Edit
            </div>
            {activeMenu === "Edit" && (
              <div className="titlebar-dropdown">
                <div className="titlebar-dropdown-item disabled">Undo</div>
                <div className="titlebar-dropdown-item disabled">Redo</div>
                <div className="titlebar-dropdown-divider" />
                <div className="titlebar-dropdown-item disabled">Cut</div>
                <div className="titlebar-dropdown-item disabled">Copy</div>
                <div className="titlebar-dropdown-item disabled">Paste</div>
              </div>
            )}
          </div>

          {/* VIEW MENU */}
          <div className="titlebar-menu-item-container">
            <div
              className={`titlebar-menu-item ${activeMenu === "View" ? "active" : ""}`}
              onClick={() => toggleMenu("View")}
              onMouseEnter={() => handleMouseEnter("View")}
            >
              View
            </div>
            {activeMenu === "View" && (
              <div className="titlebar-dropdown">
                <div className="titlebar-dropdown-item" onClick={() => execMenuCommand("toggle-sidebar")}>Toggle Sidebar</div>
                <div className="titlebar-dropdown-item" onClick={() => execMenuCommand("toggle-devtools")}>Toggle Developer Tools</div>
                <div className="titlebar-dropdown-item" onClick={() => execMenuCommand("reload")}>Reload</div>
                <div className="titlebar-dropdown-divider" />
                <div className="titlebar-dropdown-item" onClick={() => execMenuCommand("zoom-in")}>Zoom In</div>
                <div className="titlebar-dropdown-item" onClick={() => execMenuCommand("zoom-out")}>Zoom Out</div>
                <div className="titlebar-dropdown-item" onClick={() => execMenuCommand("zoom-reset")}>Reset Zoom</div>
              </div>
            )}
          </div>

          {/* HELP MENU */}
          <div className="titlebar-menu-item-container">
            <div
              className={`titlebar-menu-item ${activeMenu === "Help" ? "active" : ""}`}
              onClick={() => toggleMenu("Help")}
              onMouseEnter={() => handleMouseEnter("Help")}
            >
              Help
            </div>
            {activeMenu === "Help" && (
              <div className="titlebar-dropdown">
                <div className="titlebar-dropdown-item" onClick={() => execMenuCommand("about")}>About DynoScope</div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Title center */}
      <div className="titlebar-title">DynoScope</div>

      {/* Windows window controls overlap spacer - titleBarOverlay takes care of actual buttons on Windows */}
      <div className="titlebar-controls-spacer" />
    </div>
  );
};
