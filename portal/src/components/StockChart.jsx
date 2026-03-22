import React from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  LineChart,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Area, 
  Line,
  ReferenceLine 
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
          padding: '8px', 
          background: 'var(--bg-panel)', 
          border: '1px solid var(--border-active)',
          minWidth: '150px',
          fontFamily: 'var(--font-mono)'
        }}
      >
        <p style={{marginBottom: '6px', color: 'var(--text-dim)', fontSize: '0.7rem', textTransform: 'uppercase'}}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color || '#fff', fontSize: '0.75rem', marginBottom: '2px' }}>
            {entry.name}: {entry.value?.toFixed(2) || entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const StockChart = ({ historicalData, indicators }) => {
  if (!historicalData || historicalData.length === 0) {
    return (
      <div className="chart-container" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <p className="dim mono">NO DATA AVAILABLE</p>
      </div>
    );
  }

  const prices = historicalData.map(d => d.Close).filter(p => p !== null && !isNaN(p));
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 1000;
  const padding = (maxPrice - minPrice) * 0.1;

  // Colors mapping from App.css
  const colors = {
    greenBright: "#00ff41",
    greenMid: "#00cc33",
    greenDim: "#009922",
    amber: "#ffb700",
    amberDim: "#cc8800",
    textSecondary: "#6b8f6b",
    border: "#1e271e"
  };

  return (
    <div className="chart-container">
      
      <div className="chart-header">
        <div className="chart-title">Main Action</div>
        <div className="chart-legend">
          <div className="legend-item"><div className="legend-dot" style={{background: colors.greenBright}}></div> PRICE</div>
          {indicators.ma && <><div className="legend-item"><div className="legend-dot" style={{background: colors.amber}}></div> MA100</div><div className="legend-item"><div className="legend-dot" style={{background: colors.textSecondary}}></div> MA200</div></>}
          {indicators.ema && <div className="legend-item"><div className="legend-dot" style={{background: colors.amberDim}}></div> EMA50</div>}
        </div>
      </div>

      <div className="chart-inner">
        {/* Primary Price Chart */}
        <div style={{height: '340px', width: '100%', marginBottom: '0'}}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} syncId="terminalSeq">
              <defs>
                <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.greenBright} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={colors.greenBright} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                stroke={colors.border}
                tick={{fill: colors.textSecondary, fontSize: 10, fontFamily: 'monospace'}}
                tickMargin={10}
                minTickGap={30}
                hide={(indicators.rsi || indicators.macd || indicators.stoch)}
              />
              <YAxis 
                domain={[Math.floor(minPrice - padding), Math.ceil(maxPrice + padding)]} 
                stroke={colors.border}
                tick={{fill: colors.textSecondary, fontSize: 10, fontFamily: 'monospace'}}
                orientation="right"
                tickFormatter={(value) => value.toLocaleString()}
              />
              <CartesianGrid strokeDasharray="3 3" stroke="transparent" vertical={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: colors.textSecondary, strokeWidth: 1, strokeDasharray: '4 4' }}/>
              
              <Area 
                type="monotone" 
                dataKey="Close" 
                stroke={colors.greenBright}
                strokeWidth={1.5}
                fillOpacity={1} 
                fill="url(#colorClose)" 
                name="Close" 
                isAnimationActive={false}
              />
              
              {indicators.ma && (
                <>
                  <Line type="monotone" dataKey="MA100" stroke={colors.amber} dot={false} strokeWidth={1} name="MA 100" isAnimationActive={false}/>
                  <Line type="monotone" dataKey="MA200" stroke={colors.textSecondary} dot={false} strokeWidth={1} name="MA 200" isAnimationActive={false}/>
                </>
              )}
              
              {indicators.ema && (
                <Line type="monotone" dataKey="EMA50" stroke={colors.amberDim} dot={false} strokeWidth={1} name="EMA 50" isAnimationActive={false}/>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* RSI Subchart */}
        {indicators.rsi && (
          <div style={{height: '110px', width: '100%', borderTop: `1px solid ${colors.border}`}}>
             <div className="chart-title" style={{padding: '4px 10px', fontSize: '0.55rem'}}>RSI (14)</div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} syncId="terminalSeq">
                <XAxis 
                  dataKey="time" 
                  stroke={colors.border}
                  tick={{fill: colors.textSecondary, fontSize: 10, fontFamily: 'monospace'}}
                  tickMargin={5}
                  minTickGap={30}
                  hide={(indicators.macd || indicators.stoch)}
                />
                <YAxis domain={[0, 100]} stroke={colors.border} tick={{fill: colors.textSecondary, fontSize: 10, fontFamily: 'monospace'}} orientation="right" tickCount={3}/>
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: colors.textSecondary, strokeWidth: 1, strokeDasharray: '4 4' }}/>
                <ReferenceLine y={70} stroke="#cc1111" strokeDasharray="3 3" />
                <ReferenceLine y={30} stroke={colors.greenDim} strokeDasharray="3 3" />
                <Line type="monotone" dataKey="RSI" stroke={colors.textSecondary} dot={false} strokeWidth={1} name="RSI" isAnimationActive={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* MACD Subchart */}
        {indicators.macd && (
          <div style={{height: '110px', width: '100%', borderTop: `1px solid ${colors.border}`}}>
            <div className="chart-title" style={{padding: '4px 10px', fontSize: '0.55rem'}}>MACD</div>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={historicalData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} syncId="terminalSeq">
                <XAxis 
                  dataKey="time" 
                  stroke={colors.border}
                  tick={{fill: colors.textSecondary, fontSize: 10, fontFamily: 'monospace'}}
                  tickMargin={5}
                  minTickGap={30}
                  hide={indicators.stoch}
                />
                <YAxis stroke={colors.border} tick={{fill: colors.textSecondary, fontSize: 10, fontFamily: 'monospace'}} orientation="right" />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: colors.textSecondary, strokeWidth: 1, strokeDasharray: '4 4' }}/>
                <Line type="monotone" dataKey="MACD" stroke={colors.greenBright} dot={false} strokeWidth={1} name="MACD" isAnimationActive={false}/>
                <Line type="monotone" dataKey="MACD_Signal" stroke={colors.amber} dot={false} strokeWidth={1} name="Signal" isAnimationActive={false}/>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Stochastic Subchart */}
        {indicators.stoch && (
          <div style={{height: '110px', width: '100%', borderTop: `1px solid ${colors.border}`}}>
            <div className="chart-title" style={{padding: '4px 10px', fontSize: '0.55rem'}}>STOCH</div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} syncId="terminalSeq">
                <XAxis 
                  dataKey="time" 
                  stroke={colors.border} 
                  tick={{fill: colors.textSecondary, fontSize: 10, fontFamily: 'monospace'}}
                  tickMargin={5}
                  minTickGap={30}
                />
                <YAxis domain={[0, 1]} stroke={colors.border} tick={{fill: colors.textSecondary, fontSize: 10, fontFamily: 'monospace'}} orientation="right" tickCount={3}/>
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: colors.textSecondary, strokeWidth: 1, strokeDasharray: '4 4' }}/>
                <ReferenceLine y={0.8} stroke="#cc1111" strokeDasharray="3 3" />
                <ReferenceLine y={0.2} stroke={colors.greenDim} strokeDasharray="3 3" />
                <Line type="monotone" dataKey="STOCH_RSI_K" stroke={colors.greenBright} dot={false} strokeWidth={1} name="%K" isAnimationActive={false}/>
                <Line type="monotone" dataKey="STOCH_RSI_D" stroke={colors.amber} dot={false} strokeWidth={1} name="%D" isAnimationActive={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="chart-footer">
          <div className="chart-footer-meta">
            SYNC <span>OK</span>
          </div>
          <div className="chart-footer-meta">
            FEED <span>REALTIME</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockChart;
