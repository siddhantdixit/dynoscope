import React, { useState, useEffect } from "react";
import { useUIStore } from "../../store/uiStore";
import { useTablesStore } from "../../store/tablesStore";
import { Modal, Button } from "../Shared";
import { JsonEditor } from "./JsonEditor";
import { ItemForm } from "./ItemForm";
import "./ItemEditorModal.css";

export const ItemEditorModal: React.FC = () => {
  const { activeModal, modalData, closeModal, addToast } = useUIStore();
  const { selectedTable, tableDescriptions } = useTablesStore();

  const [activeTab, setActiveTab] = useState<"form" | "json">("form");
  const [itemData, setItemData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const isOpen = activeModal === "itemEditor";
  const isEditing = !!modalData?.item;

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setItemData(modalData.item);
      } else {
        setItemData({});
      }
      setActiveTab("form");
      setJsonError(null);
    }
  }, [isOpen, isEditing, modalData]);

  const handleSave = async () => {
    if (!selectedTable) return;

    if (jsonError) {
      addToast({
        type: "error",
        title: "Invalid JSON",
        message: "Please fix the JSON errors before saving.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await window.api.dynamodb.putItem(selectedTable, itemData);

      if (result.success) {
        addToast({ type: "success", title: "Item saved successfully" });
        closeModal();
        // The DataGrid component will need to refresh, which could be done via an event or by the parent
      } else {
        addToast({
          type: "error",
          title: "Save failed",
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
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTable || !modalData?.item) return;

    // We need to extract the keys from the item based on the table schema
    const desc = tableDescriptions[selectedTable];
    if (!desc) return;

    const pkName = desc.KeySchema.find(
      (k: any) => k.KeyType === "HASH",
    )?.AttributeName;
    const skName = desc.KeySchema.find(
      (k: any) => k.KeyType === "RANGE",
    )?.AttributeName;

    const key: any = {};
    if (pkName && modalData.item[pkName] !== undefined) {
      key[pkName] = modalData.item[pkName];
    }
    if (skName && modalData.item[skName] !== undefined) {
      key[skName] = modalData.item[skName];
    }

    if (Object.keys(key).length === 0) {
      addToast({
        type: "error",
        title: "Delete failed",
        message: "Could not determine item keys.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await window.api.dynamodb.deleteItem(selectedTable, key);

      if (result.success) {
        addToast({ type: "success", title: "Item deleted successfully" });
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
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={isEditing ? "Edit Item" : "Create Item"}
      size="lg"
    >
      <div className="item-editor">
        <div className="item-editor__tabs">
          <button
            className={`item-editor__tab ${activeTab === "form" ? "item-editor__tab--active" : ""}`}
            onClick={() => setActiveTab("form")}
          >
            Form View
          </button>
          <button
            className={`item-editor__tab ${activeTab === "json" ? "item-editor__tab--active" : ""}`}
            onClick={() => setActiveTab("json")}
          >
            JSON View
          </button>
        </div>

        <div className="item-editor__content">
          {activeTab === "form" ? (
            <ItemForm
              itemData={itemData}
              onChange={setItemData}
              isEditing={isEditing}
              schema={selectedTable ? tableDescriptions[selectedTable] : null}
            />
          ) : (
            <JsonEditor
              value={JSON.stringify(itemData, null, 2)}
              onChange={(newJson) => {
                try {
                  const parsed = JSON.parse(newJson || "{}");
                  setItemData(parsed);
                  setJsonError(null);
                } catch (e: any) {
                  setJsonError(e.message);
                }
              }}
            />
          )}
          {jsonError && activeTab === "json" && (
            <div className="item-editor__error">{jsonError}</div>
          )}
        </div>

        <div className="modal__footer">
          {isEditing && (
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={isSaving}
              style={{ marginRight: "auto" }}
            >
              Delete Item
            </Button>
          )}
          <Button variant="ghost" onClick={closeModal} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} loading={isSaving}>
            Save Item
          </Button>
        </div>
      </div>
    </Modal>
  );
};
