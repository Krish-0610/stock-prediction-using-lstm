import React from 'react';

const Evaluation = ({ evalData }) => {
  if (!evalData) return (
    <div className="eval-container">
      <h2 className="eval-section-header">Model Analytics</h2>
      <div className="eval-item">
        <span className="eval-key">Status</span>
        <span className="eval-val dim">No metadata available</span>
      </div>
    </div>
  );

  return (
    <div className="eval-container">
      <h2 className="eval-section-header">Model Analytics</h2>

      <div className="eval-item">
        <span className="eval-key">Last Trained</span>
        <span className="eval-val">{evalData.trained_on || 'Unknown'}</span>
      </div>
      
      <div className="eval-item">
        <span className="eval-key">Timestep Window</span>
        <span className="eval-val">{evalData.time_step || 100} Days</span>
      </div>

      <div style={{ marginTop: '16px' }}>
        <h2 className="eval-section-header" style={{border: 'none', paddingBottom: '4px'}}>
          Features Sequence ({evalData.features?.length || 0})
        </h2>
        <div className="feature-tags">
          {evalData.features?.map((f) => (
            <span key={f} className="feature-tag">
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Evaluation;
