import React from 'react';

const ForecastHero = ({ prediction, lastClose }) => {
  if (!prediction) return null;

  const predClose = parseFloat(prediction.Close) || 0;
  const predOpen = parseFloat(prediction.Open) || 0;
  
  const delta = predClose - lastClose;
  const pct = (delta / lastClose) * 100;
  
  const isBullish = delta >= 0;
  const regime = isBullish ? "BULLISH" : "BEARISH";
  const colorClass = isBullish ? "text-bull" : "text-bear";
  const badgeClass = isBullish ? "bullish" : "bearish";

  return (
    <div className="metrics-grid">
      <div className="metric-card">
        <span className="metric-label">Predicted Close</span>
        <span className="metric-value">{predClose.toFixed(2)}</span>
      </div>
      
      <div className="metric-card">
        <span className="metric-label">Expected Move</span>
        <span className={`metric-value ${colorClass}`}>
          {delta > 0 ? '+' : ''}{delta.toFixed(2)}
        </span>
        <span className={`metric-sub ${colorClass}`}>
          {pct > 0 ? '+' : ''}{pct.toFixed(2)}%
        </span>
      </div>

      <div className="metric-card">
        <span className="metric-label">Predicted Open</span>
        <span className="metric-value">{predOpen.toFixed(2)}</span>
      </div>

      <div className="metric-card">
        <span className="metric-label">Market Regime</span>
        <div style={{ marginTop: '4px' }}>
          <span className={`regime-badge ${badgeClass}`}>
            {regime}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ForecastHero;
