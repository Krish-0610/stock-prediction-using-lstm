import React from 'react';
import { Layers } from 'lucide-react';

const Sidebar = ({ 
  indexes, 
  selectedIndex, 
  setSelectedIndex, 
  timeframe, 
  setTimeframe,
  indicators,
  setIndicators,
  view,
  setView,
  evalDays,
  setEvalDays
}) => {
  const timeframes = [
    { label: '6M', value: 180 },
    { label: '1Y', value: 365 },
    { label: '3Y', value: 1095 }
  ];

  const evalPeriods = [
    { label: '15D', value: 15 },
    { label: '30D', value: 30 },
    { label: '60D', value: 60 }
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
        <h2>View</h2>
        <div className="view-toggle">
          <button className={`view-btn ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
            Dashboard
          </button>
          <button className={`view-btn ${view === 'evaluation' ? 'active' : ''}`} onClick={() => setView('evaluation')}>
            Evaluation
          </button>
        </div>
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

      {view === 'evaluation' && (
        <div className="sidebar-section">
          <h2>Eval Period</h2>
          <div className="timeframe-group">
            {evalPeriods.map((ep) => (
              <button
                key={ep.label}
                onClick={() => setEvalDays(ep.value)}
                className={`timeframe-btn ${evalDays === ep.value ? 'active' : ''}`}
              >
                {ep.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {view === 'dashboard' && (
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
      )}

      {view === 'dashboard' && (
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
      )}
      
    </aside>
  );
};

export default Sidebar;
