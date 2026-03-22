import React from 'react';
import { Layers } from 'lucide-react';

const Sidebar = ({ 
  indexes, 
  selectedIndex, 
  setSelectedIndex, 
  timeframe, 
  setTimeframe,
  indicators,
  setIndicators
}) => {
  const timeframes = [
    { label: '6M', value: 180 },
    { label: '1Y', value: 365 },
    { label: '3Y', value: 1095 }
  ];

  const handleToggle = (key) => {
    setIndicators(prev => ({...prev, [key]: !prev[key]}));
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} /> MarketSeq
        </span>
        <span className="logo-meta">v3.0 | TERMINAL ENGINE</span>
      </div>

      <div className="sidebar-section">
        <h2>Instrument</h2>
        <div className="control-group">
          {Object.keys(indexes).map((key) => (
            <label key={key} className={`radio-label ${selectedIndex === key ? 'selected' : ''}`}>
              <input 
                type="radio" 
                name="index" 
                value={key} 
                checked={selectedIndex === key}
                onChange={() => setSelectedIndex(key)}
              />
              <span className="mono">{key.toUpperCase()}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <h2>Timeframe</h2>
        <div className="timeframe-group">
          {timeframes.map((tf) => (
            <button
              key={tf.label}
              onClick={() => setTimeframe(tf.value)}
              className={`timeframe-btn ${timeframe === tf.value ? 'active' : ''}`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <h2>Overlays</h2>
        <div className="control-group">
          {Object.entries(indicators).map(([key, value]) => (
            <label key={key} className="toggle-label">
              <span className="mono" style={{textTransform: 'uppercase'}}>{key}</span>
              <input 
                type="checkbox" 
                checked={value}
                onChange={() => handleToggle(key)}
              />
              <div className="toggle-switch"></div>
            </label>
          ))}
        </div>
      </div>
      
    </aside>
  );
};

export default Sidebar;
