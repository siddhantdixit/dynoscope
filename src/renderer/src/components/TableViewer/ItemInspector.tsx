import React from 'react';
import { X, Copy, CheckCircle2 } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { Button } from '../Shared';
import './ItemInspector.css';

export const ItemInspector: React.FC = () => {
  const { inspectorData, closeInspector } = useUIStore();
  const [copied, setCopied] = React.useState(false);

  if (!inspectorData) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(inspectorData.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderValue = (value: any, depth = 0): React.ReactNode => {
    if (value === null) {
      return <span className="inspector-null">null</span>;
    }
    if (typeof value === 'boolean') {
      return <span className="inspector-boolean">{value.toString()}</span>;
    }
    if (typeof value === 'number') {
      return <span className="inspector-number">{value}</span>;
    }
    if (typeof value === 'string') {
      return <span className="inspector-string">"{value}"</span>;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return <span>[]</span>;
      return (
        <div className="inspector-array">
          <span className="inspector-bracket">[</span>
          <div className="inspector-nested" style={{ paddingLeft: '1rem' }}>
            {value.map((item, index) => (
              <div key={index} className="inspector-item">
                {renderValue(item, depth + 1)}
                {index < value.length - 1 && <span className="inspector-comma">,</span>}
              </div>
            ))}
          </div>
          <span className="inspector-bracket">]</span>
        </div>
      );
    }
    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 0) return <span>{`{}`}</span>;
      return (
        <div className="inspector-object">
          <span className="inspector-bracket">{`{`}</span>
          <div className="inspector-nested" style={{ paddingLeft: '1rem' }}>
            {keys.map((key, index) => (
              <div key={key} className="inspector-property">
                <span className="inspector-key">"{key}"</span>
                <span className="inspector-colon">: </span>
                {renderValue(value[key], depth + 1)}
                {index < keys.length - 1 && <span className="inspector-comma">,</span>}
              </div>
            ))}
          </div>
          <span className="inspector-bracket">{`}`}</span>
        </div>
      );
    }
    return <span>{String(value)}</span>;
  };

  return (
    <div className="item-inspector animate-slide-in-right">
      <div className="item-inspector__header">
        <h3 className="item-inspector__title">
          <span className="item-inspector__label">Inspecting:</span>
          <span className="item-inspector__key truncate" title={inspectorData.title}>
            {inspectorData.title}
          </span>
        </h3>
        <div className="item-inspector__actions">
          <Button
            variant="ghost"
            size="sm"
            icon={copied ? <CheckCircle2 size={16} className="text-success" /> : <Copy size={16} />}
            onClick={handleCopy}
            title="Copy JSON"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<X size={16} />}
            onClick={closeInspector}
            title="Close Inspector"
          />
        </div>
      </div>
      
      <div className="item-inspector__body custom-scrollbar">
        <pre className="item-inspector__json">
          {renderValue(inspectorData.data)}
        </pre>
      </div>
    </div>
  );
};
