import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  Line,
  ReferenceLine,
  Cell
} from 'recharts';

const colors = {
  greenBright: "#00ff41",
  greenMid: "#00cc33",
  greenDim: "#009922",
  greenMuted: "#1a4a1a",
  amber: "#ffb700",
  red: "#ff3333",
  textPrimary: "#d4e8d4",
  textSecondary: "#6b8f6b",
  textDim: "#3d5c3d",
  textLabel: "#4a7a4a",
  border: "#1e271e",
  borderActive: "#2e4a2e",
  bgPanel: "#0c0f0c"
};

const BacktestTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        padding: '8px',
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-active)',
        minWidth: '160px',
        fontFamily: 'var(--font-mono)'
      }}>
        <p style={{ marginBottom: '6px', color: 'var(--text-dim)', fontSize: '0.7rem', textTransform: 'uppercase' }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color || '#fff', fontSize: '0.75rem', marginBottom: '2px' }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ErrorTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0]?.value;
    return (
      <div style={{
        padding: '8px',
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-active)',
        minWidth: '140px',
        fontFamily: 'var(--font-mono)'
      }}>
        <p style={{ marginBottom: '4px', color: 'var(--text-dim)', fontSize: '0.7rem', textTransform: 'uppercase' }}>{label}</p>
        <p style={{ color: val >= 0 ? colors.greenMid : colors.red, fontSize: '0.75rem' }}>
          Error: {typeof val === 'number' ? val.toFixed(3) : val}%
        </p>
      </div>
    );
  }
  return null;
};

const BacktestView = ({ backtestData, loading }) => {
  if (loading) {
    return (
      <div className="backtest-container" style={{ position: 'relative' }}>
        <div className="loading-overlay">
          <div className="loading-text">RUNNING BACKTEST...</div>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!backtestData) {
    return (
      <div className="backtest-container">
        <div className="backtest-empty">
          <div className="backtest-empty-text">No Backtest Data</div>
          <div className="backtest-empty-sub">Select an instrument and eval period to begin</div>
        </div>
      </div>
    );
  }

  const { results, summary } = backtestData;

  const dirAccColor = summary.directional_accuracy > 50 ? colors.greenBright : colors.red;

  // Compute chart domains
  const allValues = results.flatMap(r => [r.actual_close, r.pred_close]).filter(v => v != null && !isNaN(v));
  const minVal = allValues.length > 0 ? Math.min(...allValues) : 0;
  const maxVal = allValues.length > 0 ? Math.max(...allValues) : 1000;
  const padding = (maxVal - minVal) * 0.08;

  return (
    <div className="backtest-container">
      {/* ─── A) Summary Metrics Row ─── */}
      <div className="backtest-metrics">
        <div className="metric-card">
          <span className="metric-label">Directional Accuracy</span>
          <span className="metric-value" style={{ color: dirAccColor }}>
            {summary.directional_accuracy.toFixed(1)}%
          </span>
          <span className="metric-sub" style={{ color: dirAccColor }}>
            {summary.directional_accuracy > 50 ? '▲ Bullish Edge' : '▼ Weak Signal'}
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">MAPE Close</span>
          <span className="metric-value">{summary.mape_close.toFixed(2)}%</span>
          <span className="metric-sub" style={{ color: colors.textSecondary }}>Mean Abs % Error</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">MAPE Open</span>
          <span className="metric-value">{summary.mape_open.toFixed(2)}%</span>
          <span className="metric-sub" style={{ color: colors.textSecondary }}>Mean Abs % Error</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Avg Error Close</span>
          <span className="metric-value">₹{summary.avg_error_close.toFixed(1)}</span>
          <span className="metric-sub" style={{ color: colors.textSecondary }}>
            Max: ₹{summary.max_error_close.toFixed(1)}
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Total Predictions</span>
          <span className="metric-value">{summary.total_predictions}</span>
          <span className="metric-sub" style={{ color: colors.textSecondary }}>
            {backtestData.eval_days}D Window
          </span>
        </div>
      </div>

      {/* ─── B) Predicted vs Actual Chart ─── */}
      <div className="backtest-chart-section">
        <div className="backtest-chart-header">
          <div className="backtest-chart-title">Predicted vs Actual — Close Price</div>
          <div className="chart-legend">
            <div className="legend-item"><div className="legend-dot" style={{ background: colors.greenBright }}></div> ACTUAL</div>
            <div className="legend-item"><div className="legend-dot" style={{ background: colors.amber }}></div> PREDICTED</div>
          </div>
        </div>
        <div className="backtest-chart-inner">
          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={results} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActualBt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.greenBright} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={colors.greenBright} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke={colors.border}
                  tick={{ fill: colors.textSecondary, fontSize: 10, fontFamily: 'monospace' }}
                  tickMargin={10}
                  minTickGap={40}
                />
                <YAxis
                  domain={[Math.floor(minVal - padding), Math.ceil(maxVal + padding)]}
                  stroke={colors.border}
                  tick={{ fill: colors.textSecondary, fontSize: 10, fontFamily: 'monospace' }}
                  orientation="right"
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <CartesianGrid strokeDasharray="3 3" stroke="transparent" vertical={false} />
                <Tooltip content={<BacktestTooltip />} cursor={{ stroke: colors.textSecondary, strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area
                  type="monotone"
                  dataKey="actual_close"
                  stroke={colors.greenBright}
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#colorActualBt)"
                  name="Actual Close"
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="pred_close"
                  stroke={colors.amber}
                  strokeWidth={1.5}
                  dot={false}
                  name="Pred Close"
                  isAnimationActive={false}
                  strokeDasharray="4 3"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─── C) Error Distribution Chart ─── */}
      <div className="backtest-chart-section">
        <div className="backtest-chart-header">
          <div className="backtest-chart-title">Close Error Distribution (%)</div>
        </div>
        <div className="backtest-chart-inner">
          <div style={{ height: '160px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={results} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="date"
                  stroke={colors.border}
                  tick={{ fill: colors.textSecondary, fontSize: 9, fontFamily: 'monospace' }}
                  tickMargin={6}
                  minTickGap={50}
                />
                <YAxis
                  stroke={colors.border}
                  tick={{ fill: colors.textSecondary, fontSize: 10, fontFamily: 'monospace' }}
                  orientation="right"
                  tickFormatter={(v) => `${v}%`}
                />
                <CartesianGrid strokeDasharray="3 3" stroke="transparent" vertical={false} />
                <Tooltip content={<ErrorTooltip />} cursor={{ fill: 'rgba(0,255,65,0.04)' }} />
                <ReferenceLine y={0} stroke={colors.textDim} strokeWidth={1} />
                <Bar dataKey="close_error_pct" name="Error %" isAnimationActive={false} radius={[1, 1, 0, 0]}>
                  {results.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.close_error_pct >= 0 ? colors.greenDim : colors.red}
                      fillOpacity={0.7}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─── D) Detailed Results Table ─── */}
      <div className="backtest-table-section">
        <div className="backtest-chart-header">
          <div className="backtest-chart-title">Detailed Results</div>
          <span style={{ fontSize: '0.6rem', color: colors.textDim, letterSpacing: '0.08em' }}>
            {results.length} RECORDS
          </span>
        </div>
        <div className="backtest-table-wrapper">
          <table className="backtest-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Pred Close</th>
                <th>Actual Close</th>
                <th>Error (₹)</th>
                <th>Error (%)</th>
                <th>Direction</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.date}</td>
                  <td>{row.pred_close.toFixed(2)}</td>
                  <td>{row.actual_close.toFixed(2)}</td>
                  <td className={row.close_error >= 0 ? 'positive' : 'negative'}>
                    {row.close_error >= 0 ? '+' : ''}{row.close_error.toFixed(2)}
                  </td>
                  <td className={row.close_error_pct >= 0 ? 'positive' : 'negative'}>
                    {row.close_error_pct >= 0 ? '+' : ''}{row.close_error_pct.toFixed(3)}%
                  </td>
                  <td>
                    <span className={`direction-icon ${row.direction_correct ? 'correct' : 'wrong'}`}>
                      {row.direction_correct ? '✓' : '✗'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BacktestView;
