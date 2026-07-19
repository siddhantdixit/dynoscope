import React, { useState } from "react";
import { Database } from "lucide-react";
import { ProfileSelector } from "./ProfileSelector";
import { ManualCredentials } from "./ManualCredentials";
import { useConnectionStore } from "../../store/connectionStore";
import { Button, Input } from "../Shared";
import "./ConnectionScreen.css";

export const ConnectionScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"profile" | "manual" | "local">("profile");
  const [profileConfig, setProfileConfig] = useState<{
    profile: string;
    region: string;
  } | null>(null);
  const [manualConfig, setManualConfig] = useState<{
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    endpoint?: string;
  } | null>(null);
  const [localPort, setLocalPort] = useState<string>("8000");

  const { setConnecting, setConnected, setError, error, isConnecting } =
    useConnectionStore();

  const handleConnect = async () => {
    setConnecting(true);
    try {
      if (activeTab === "profile" && profileConfig) {
        const { profile, region } = profileConfig;
        const result = await window.api.credentials.connectWithProfile(
          profile,
          region,
        );
        if (result.success) {
          setConnected({ type: "profile", profileName: profile, region });
        } else {
          setError(result.error || "Failed to connect");
        }
      } else if (activeTab === "manual" && manualConfig) {
        const { accessKeyId, secretAccessKey, region, endpoint } = manualConfig;
        const result = await window.api.credentials.connectWithKeys(
          accessKeyId,
          secretAccessKey,
          region,
          endpoint,
        );
        if (result.success) {
          setConnected({ type: "manual", region, endpoint });
        } else {
          setError(result.error || "Failed to connect");
        }
      } else if (activeTab === "local") {
        const result = await window.api.credentials.connectWithKeys(
          "dummy",
          "dummy",
          "local",
          `http://localhost:${localPort}`,
        );
        if (result.success) {
          setConnected({ type: "manual", region: "local", endpoint: `http://localhost:${localPort}` });
        } else {
          setError(result.error || "Failed to connect to local instance");
        }
      } else {
        setError("Please complete the connection details");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    }
  };

  return (
    <div className="connection-screen">
      <div className="connection-screen__card animate-scale-in">
        <div className="connection-screen__header">
          <div className="connection-screen__icon">
            <Database size={40} className="connection-screen__icon-svg" />
          </div>
          <h1 className="connection-screen__title">DynoScope</h1>
          <p className="connection-screen__subtitle">
            Connect to your DynamoDB instance
          </p>
        </div>

        <div className="connection-screen__tabs">
          <button
            className={`connection-screen__tab ${activeTab === "profile" ? "connection-screen__tab--active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            AWS Profile
          </button>
          <button
            className={`connection-screen__tab ${activeTab === "manual" ? "connection-screen__tab--active" : ""}`}
            onClick={() => setActiveTab("manual")}
          >
            Manual Credentials
          </button>
          <button
            className={`connection-screen__tab ${activeTab === "local" ? "connection-screen__tab--active" : ""}`}
            onClick={() => setActiveTab("local")}
          >
            Local
          </button>
        </div>

        <div className="connection-screen__form">
          {activeTab === "profile" && (
            <ProfileSelector onConfigChange={setProfileConfig} />
          )}
          {activeTab === "manual" && (
            <ManualCredentials onConfigChange={setManualConfig} />
          )}
          {activeTab === "local" && (
            <div className="animate-fade-in-up">
              <Input
                label="Local Port"
                value={localPort}
                onChange={(e) => setLocalPort(e.target.value)}
                placeholder="e.g. 8000"
              />
              <p className="form-help mt-2" style={{ color: "var(--text-secondary)", fontSize: "12px", marginTop: "8px" }}>
                This connects to DynamoDB Local using dummy credentials on the specified port.
              </p>
            </div>
          )}
        </div>

        {error && <div className="connection-screen__error">{error}</div>}

        <div className="connection-screen__actions">
          <Button
            variant="primary"
            size="lg"
            className="connection-button"
            onClick={handleConnect}
            loading={isConnecting}
          >
            Test & Connect
          </Button>
        </div>
      </div>
    </div>
  );
};
