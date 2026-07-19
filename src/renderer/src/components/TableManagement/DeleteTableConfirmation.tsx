import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useUIStore } from "../../store/uiStore";
import { useTablesStore } from "../../store/tablesStore";
import { Modal, Button, Input } from "../Shared";
import "./DeleteTableConfirmation.css";

export const DeleteTableConfirmation: React.FC = () => {
  const { activeModal, closeModal, addToast } = useUIStore();
  const { selectedTable, setTables, selectTable } = useTablesStore();
  const isOpen = activeModal === "deleteTable";

  const [confirmName, setConfirmName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!selectedTable || confirmName !== selectedTable) return;

    setIsDeleting(true);
    try {
      const result = await window.api.dynamodb.deleteTable(selectedTable);

      if (result.success) {
        addToast({
          type: "success",
          title: "Table deleted",
          message: `Table ${selectedTable} has been deleted.`,
        });

        // Refresh table list
        const refreshResult = await window.api.dynamodb.listTables();
        if (refreshResult.success && refreshResult.data) {
          setTables(refreshResult.data);
        }

        selectTable(null);
        closeModal();
      } else {
        addToast({
          type: "error",
          title: "Delete failed",
          message: result.error,
        });
      }
    } catch (e: any) {
      addToast({
        type: "error",
        title: "Unexpected error",
        message: e.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Delete Table" size="sm">
      <div className="delete-table animate-scale-in">
        <div className="delete-table__warning">
          <AlertTriangle size={32} className="delete-table__icon" />
          <div className="delete-table__text">
            <strong>Warning: This action cannot be undone.</strong>
            <p>
              You are about to permanently delete the table{" "}
              <code>{selectedTable}</code> and all of its items.
            </p>
          </div>
        </div>

        <div className="delete-table__confirm">
          <p>Please type the name of the table to confirm.</p>
          <Input
            placeholder={selectedTable || ""}
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
          />
        </div>

        <div className="modal__footer">
          <Button variant="ghost" onClick={closeModal} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={isDeleting}
            disabled={confirmName !== selectedTable}
          >
            I understand, delete this table
          </Button>
        </div>
      </div>
    </Modal>
  );
};
