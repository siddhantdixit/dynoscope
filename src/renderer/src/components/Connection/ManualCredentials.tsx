import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input, Select } from "../Shared";

const REGIONS = [
  { value: "us-east-1", label: "US East (N. Virginia)" },
  { value: "us-east-2", label: "US East (Ohio)" },
  { value: "us-west-1", label: "US West (N. California)" },
  { value: "us-west-2", label: "US West (Oregon)" },
  { value: "eu-west-1", label: "Europe (Ireland)" },
  { value: "eu-west-2", label: "Europe (London)" },
  { value: "eu-central-1", label: "Europe (Frankfurt)" },
  { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
  { value: "ap-southeast-2", label: "Asia Pacific (Sydney)" },
  { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)" },
  { value: "ap-south-1", label: "Asia Pacific (Mumbai)" },
  { value: "sa-east-1", label: "South America (São Paulo)" },
  { value: "local", label: "Local (localhost:8000)" },
];

interface ManualCredentialsProps {
  onConfigChange: (
    config: {
      accessKeyId: string;
      secretAccessKey: string;
      region: string;
      endpoint?: string;
    } | null,
  ) => void;
}

export const ManualCredentials: React.FC<ManualCredentialsProps> = ({
  onConfigChange,
}) => {
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretAccessKey, setSecretAccessKey] = useState("");
  const [region, setRegion] = useState("us-east-1");
  const [endpoint, setEndpoint] = useState("");
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    if (accessKeyId && secretAccessKey && region) {
      onConfigChange({
        accessKeyId,
        secretAccessKey,
        region,
        endpoint: endpoint.trim() || undefined,
      });
    } else {
      onConfigChange(null);
    }
  }, [accessKeyId, secretAccessKey, region, endpoint, onConfigChange]);

  return (
    <div className="manual-credentials">
      <Input
        label="Access Key ID"
        placeholder="AKIA..."
        value={accessKeyId}
        onChange={(e) => setAccessKeyId(e.target.value)}
      />
      <div className="manual-credentials__secret">
        <Input
          label="Secret Access Key"
          type={showSecret ? "text" : "password"}
          placeholder="Enter your secret key"
          value={secretAccessKey}
          onChange={(e) => setSecretAccessKey(e.target.value)}
        />
        <button
          className="manual-credentials__toggle"
          onClick={() => setShowSecret(!showSecret)}
          type="button"
          tabIndex={-1}
        >
          {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      <Select
        label="Region"
        options={REGIONS}
        value={region}
        onChange={(e) => setRegion(e.target.value)}
      />
      <div className="manual-credentials__endpoint">
        <Input
          label="Custom Endpoint (Optional)"
          placeholder="http://localhost:8000"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
        />
        <span className="manual-credentials__help">
          Use custom endpoint for DynamoDB Local
        </span>
      </div>
    </div>
  );
};
