import React, { useEffect, useState } from "react";
import { Select } from "../Shared";
import { useConnectionStore } from "../../store/connectionStore";

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

interface ProfileSelectorProps {
  onConfigChange: (config: { profile: string; region: string } | null) => void;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  onConfigChange,
}) => {
  const { availableProfiles, setProfiles } = useConnectionStore();
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("us-east-1");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const result = await window.api.credentials.listProfiles();
        if (result.success && result.data) {
          setProfiles(result.data);
          if (result.data.length > 0) {
            setSelectedProfile(result.data[0]);
          }
        }
      } catch (error) {
        console.error("Failed to load profiles:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfiles();
  }, [setProfiles]);

  useEffect(() => {
    if (selectedProfile && selectedRegion) {
      onConfigChange({ profile: selectedProfile, region: selectedRegion });
    } else {
      onConfigChange(null);
    }
  }, [selectedProfile, selectedRegion, onConfigChange]);

  if (isLoading) {
    return <div className="profile-selector-loading">Loading profiles...</div>;
  }

  if (availableProfiles.length === 0) {
    return (
      <div className="profile-selector-empty">
        No AWS profiles found. Please configure them in ~/.aws/credentials or
        use Manual Credentials.
      </div>
    );
  }

  return (
    <div className="profile-selector">
      <Select
        label="AWS Profile"
        options={availableProfiles.map((p) => ({ value: p, label: p }))}
        value={selectedProfile}
        onChange={(e) => setSelectedProfile(e.target.value)}
      />
      <Select
        label="Region"
        options={REGIONS}
        value={selectedRegion}
        onChange={(e) => setSelectedRegion(e.target.value)}
      />
    </div>
  );
};
