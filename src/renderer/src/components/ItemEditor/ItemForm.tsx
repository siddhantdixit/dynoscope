import React, { useState } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { Input, Select, Button, Badge } from "../Shared";
import "./ItemForm.css";

interface ItemFormProps {
  itemData: any;
  onChange: (data: any) => void;
  isEditing: boolean;
  schema: any;
}

export const ItemForm: React.FC<ItemFormProps> = ({
  itemData,
  onChange,
  isEditing,
  schema,
}) => {
  const [newKeyName, setNewKeyName] = useState("");

  const pkName = schema?.KeySchema?.find(
    (k: any) => k.KeyType === "HASH",
  )?.AttributeName;
  const skName = schema?.KeySchema?.find(
    (k: any) => k.KeyType === "RANGE",
  )?.AttributeName;

  const handleFieldChange = (
    key: string,
    value: string,
    type: string = "string",
  ) => {
    let parsedValue: any = value;

    if (type === "number") {
      parsedValue = value === "" ? "" : Number(value);
    } else if (type === "boolean") {
      parsedValue = value === "true";
    } else if (type === "object" || type === "array") {
      try {
        parsedValue = JSON.parse(value);
      } catch (e) {
        // Keep as string if it can't parse yet while typing
        parsedValue = value;
      }
    }

    onChange({ ...itemData, [key]: parsedValue });
  };

  const handleRemoveField = (key: string) => {
    const newData = { ...itemData };
    delete newData[key];
    onChange(newData);
  };

  const handleAddField = () => {
    if (newKeyName && !itemData.hasOwnProperty(newKeyName)) {
      onChange({ ...itemData, [newKeyName]: "" });
      setNewKeyName("");
    }
  };

  const getTypeStr = (value: any): string => {
    if (value === null || value === undefined) return "string";
    const t = typeof value;
    if (t === "object") return Array.isArray(value) ? "array" : "object";
    return t;
  };

  return (
    <div className="item-form">
      <div className="item-form__fields">
        {Object.entries(itemData).map(([key, value]) => {
          const isPk = key === pkName;
          const isSk = key === skName;
          const isKey = isPk || isSk;
          const typeStr = getTypeStr(value);
          const displayValue =
            typeStr === "object" || typeStr === "array"
              ? JSON.stringify(value)
              : String(value === undefined ? "" : value);

          return (
            <div key={key} className="item-form__row animate-fade-in-up">
              <div className="item-form__key">
                <span className="item-form__key-name truncate" title={key}>
                  {key}
                </span>
                {isKey && (
                  <Badge variant="accent" size="sm">
                    {isPk ? "PK" : "SK"}
                  </Badge>
                )}
              </div>

              <div className="item-form__value-col">
                {typeStr === "boolean" ? (
                  <Select
                    options={[
                      { value: "true", label: "True" },
                      { value: "false", label: "False" },
                    ]}
                    value={displayValue}
                    onChange={(e) =>
                      handleFieldChange(key, e.target.value, "boolean")
                    }
                  />
                ) : (
                  <Input
                    value={displayValue}
                    onChange={(e) =>
                      handleFieldChange(key, e.target.value, typeStr)
                    }
                    disabled={isKey && isEditing}
                    placeholder={`Enter ${typeStr} value`}
                  />
                )}
              </div>

              {!isKey && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 size={16} />}
                  onClick={() => handleRemoveField(key)}
                  className="item-form__remove"
                  aria-label="Remove attribute"
                />
              )}
              {isKey && <div style={{ width: "32px" }} />}
            </div>
          );
        })}
      </div>

      <div className="item-form__add">
        <h5 className="item-form__add-title">Add New Attribute</h5>
        <div className="item-form__add-row">
          <Input
            placeholder="Attribute Name"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddField()}
          />
          <Button
            variant="secondary"
            icon={<Plus size={16} />}
            onClick={handleAddField}
            disabled={!newKeyName || itemData.hasOwnProperty(newKeyName)}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};
