import React from "react";
import Editor from "@monaco-editor/react";
import { useUIStore } from "../../store/uiStore";
import { SkeletonLoader } from "../Shared";

interface JsonEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({ value, onChange }) => {
  const { theme } = useUIStore();

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Editor
        height="100%"
        defaultLanguage="json"
        value={value}
        onChange={onChange}
        theme={theme === "dark" ? "vs-dark" : "light"}
        options={{
          minimap: { enabled: false },
          wordWrap: "on",
          scrollBeyondLastLine: false,
          fontSize: 14,
          fontFamily: "var(--font-mono)",
          padding: { top: 16, bottom: 16 },
          tabSize: 2,
        }}
        loading={<SkeletonLoader count={10} height={20} className="m-4" />}
      />
    </div>
  );
};
