import React, { useState } from "react";
import { useUIStore } from "../../store/uiStore";
import { Modal, Button, Input, Select, Badge } from "../Shared";
import { Plus, Trash2, ChevronRight, ChevronLeft } from "lucide-react";
import "./CreateTableModal.css";

export const CreateTableModal: React.FC = () => {
  const { activeModal, closeModal, addToast } = useUIStore();
  const isOpen = activeModal === "createTable";

  const [step, setStep] = useState(1);
  const [tableName, setTableName] = useState("");
  const [pkName, setPkName] = useState("");
  const [pkType, setPkType] = useState("S");
  const [skName, setSkName] = useState("");
  const [skType, setSkType] = useState("S");
  const [billingMode, setBillingMode] = useState("PAY_PER_REQUEST");
  const [rcu, setRcu] = useState("5");
  const [wcu, setWcu] = useState("5");
  const [isCreating, setIsCreating] = useState(false);

  // TODO: Add GSI/LSI state in a real app, keeping it simple for the scaffolding

  const handleCreate = async () => {
    if (!tableName || !pkName) return;

    setIsCreating(true);
    try {
      const params: any = {
        TableName: tableName,
        KeySchema: [{ AttributeName: pkName, KeyType: "HASH" }],
        AttributeDefinitions: [
          { AttributeName: pkName, AttributeType: pkType },
        ],
        BillingMode: billingMode,
      };

      if (skName) {
        params.KeySchema.push({ AttributeName: skName, KeyType: "RANGE" });
        params.AttributeDefinitions.push({
          AttributeName: skName,
          AttributeType: skType,
        });
      }

      if (billingMode === "PROVISIONED") {
        params.ProvisionedThroughput = {
          ReadCapacityUnits: Number(rcu),
          WriteCapacityUnits: Number(wcu),
        };
      }

      const result = await window.api.dynamodb.createTable(params);

      if (result.success) {
        addToast({
          type: "success",
          title: "Table creation started",
          message: `Table ${tableName} is being created.`,
        });
        closeModal();
      } else {
        addToast({
          type: "error",
          title: "Creation failed",
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
      setIsCreating(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="create-table__step animate-fade-in">
            <Input
              label="Table Name"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="e.g., UsersTable"
            />
            <div className="create-table__keys">
              <div className="create-table__key-row">
                <Input
                  label="Partition Key (Hash)"
                  value={pkName}
                  onChange={(e) => setPkName(e.target.value)}
                  placeholder="e.g., userId"
                />
                <Select
                  label="Type"
                  options={[
                    { value: "S", label: "String" },
                    { value: "N", label: "Number" },
                    { value: "B", label: "Binary" },
                  ]}
                  value={pkType}
                  onChange={(e) => setPkType(e.target.value)}
                />
              </div>
              <div className="create-table__key-row">
                <Input
                  label="Sort Key (Range) - Optional"
                  value={skName}
                  onChange={(e) => setSkName(e.target.value)}
                  placeholder="e.g., createdAt"
                />
                {skName && (
                  <Select
                    label="Type"
                    options={[
                      { value: "S", label: "String" },
                      { value: "N", label: "Number" },
                      { value: "B", label: "Binary" },
                    ]}
                    value={skType}
                    onChange={(e) => setSkType(e.target.value)}
                  />
                )}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="create-table__step animate-fade-in">
            <Select
              label="Billing Mode"
              options={[
                {
                  value: "PAY_PER_REQUEST",
                  label: "On-Demand (PAY_PER_REQUEST)",
                },
                { value: "PROVISIONED", label: "Provisioned" },
              ]}
              value={billingMode}
              onChange={(e) => setBillingMode(e.target.value)}
            />

            {billingMode === "PROVISIONED" && (
              <div className="create-table__provisioned animate-fade-in-up">
                <Input
                  label="Read Capacity Units (RCU)"
                  type="number"
                  value={rcu}
                  onChange={(e) => setRcu(e.target.value)}
                />
                <Input
                  label="Write Capacity Units (WCU)"
                  type="number"
                  value={wcu}
                  onChange={(e) => setWcu(e.target.value)}
                />
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="create-table__step animate-fade-in">
            <h4 className="create-table__summary-title">Review</h4>
            <div className="create-table__summary">
              <div className="create-table__summary-row">
                <span>Table Name</span>
                <strong>{tableName}</strong>
              </div>
              <div className="create-table__summary-row">
                <span>Partition Key</span>
                <span>
                  <strong>{pkName}</strong> ({pkType})
                </span>
              </div>
              {skName && (
                <div className="create-table__summary-row">
                  <span>Sort Key</span>
                  <span>
                    <strong>{skName}</strong> ({skType})
                  </span>
                </div>
              )}
              <div className="create-table__summary-row">
                <span>Billing Mode</span>
                <Badge variant="accent">{billingMode}</Badge>
              </div>
              {billingMode === "PROVISIONED" && (
                <div className="create-table__summary-row">
                  <span>Capacity</span>
                  <span>
                    {rcu} RCU / {wcu} WCU
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Create Table" size="md">
      <div className="create-table">
        <div className="create-table__progress">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`create-table__dot ${step >= i ? "create-table__dot--active" : ""}`}
            />
          ))}
        </div>

        <div className="create-table__body">{renderStep()}</div>

        <div className="modal__footer">
          {step > 1 ? (
            <Button
              variant="ghost"
              onClick={() => setStep(step - 1)}
              icon={<ChevronLeft size={16} />}
              disabled={isCreating}
            >
              Back
            </Button>
          ) : (
            <Button variant="ghost" onClick={closeModal} disabled={isCreating}>
              Cancel
            </Button>
          )}

          <div style={{ flex: 1 }} />

          {step < 3 ? (
            <Button
              variant="primary"
              onClick={() => setStep(step + 1)}
              disabled={!tableName || !pkName}
            >
              Next <ChevronRight size={16} style={{ marginLeft: 4 }} />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleCreate}
              loading={isCreating}
            >
              Create Table
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
