import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import StockChart from './components/StockChart';
import ForecastHero from './components/ForecastHero';
import Evaluation from './components/Evaluation';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [config, setConfig] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState('nifty50');
  const [timeframe, setTimeframe] = useState(365);
  const [indicators, setIndicators] = useState({
    ma: true,
    ema: true,
    rsi: true,
    macd: true,
    stoch: false
  });
  
  const [data, setData] = useState({
    historical: [],
    prediction: null,
    evaluation: null
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initial config load
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get(`${API_BASE}/config`);
        setConfig(res.data);
      } catch (err) {
        console.error('Failed to load config', err);
        // Fallback
        setConfig({
          indexes: {
            "nifty50": { "ticker": "^NSEI" },
            "banknifty": { "ticker": "^NSEBANK" },
            "niftyit": { "ticker": "^CNXIT" }
          }
        });
      }
    };
    fetchConfig();
  }, []);

  // Data fetching effect
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [forecastRes, evalRes] = await Promise.all([
          axios.get(`${API_BASE}/forecast`, {
            params: { index: selectedIndex, days: timeframe }
          }),
          axios.get(`${API_BASE}/evaluation`, {
            params: { index: selectedIndex }
          }).catch(() => ({ data: null }))
        ]);

        setData({
          historical: forecastRes.data.historical || [],
          prediction: forecastRes.data.prediction,
          evaluation: evalRes.data
        });
      } catch (err) {
        console.error(err);
        setError('Failed to fetch data from backend.');
      } finally {
        setLoading(false);
      }
    };

    if (config) {
      fetchData();
    }
  }, [selectedIndex, timeframe, config]);

  const isMarketOpen = new Date().getHours() > 9 && new Date().getHours() < 16 && new Date().getDay() !== 0 && new Date().getDay() !== 6;
  const lastClose = data.historical.length > 0 
    ? data.historical[data.historical.length - 1].Close 
    : 0;

  if (!config) return <div style={{padding: '48px', color: 'var(--text-primary)', fontFamily: 'monospace'}}>SYS.BOOT...</div>;

  return (
    <div className="app-container">
      <Sidebar 
        indexes={config.indexes || {}}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        indicators={indicators}
        setIndicators={setIndicators}
      />
      
      <main className="main-content">
        <header className="header">
          <div className="header-left">
            <h1>{selectedIndex.toUpperCase()}</h1>
            <p className="header-ticker">TICKER: {config.indexes[selectedIndex]?.ticker || 'UNKNOWN'} // STRAT: HYBRID LSTM</p>
          </div>
          <div className="market-status">
            <div className={`status-dot ${isMarketOpen ? 'active' : 'off'}`}></div>
            <span>{isMarketOpen ? 'Market Open' : 'Market Closed'}</span>
          </div>
        </header>

        {error && (
          <div style={{background: 'var(--red-muted)', borderBottom: '1px solid var(--red-dim)', padding: '12px 32px', color: 'var(--text-primary)', fontSize: '0.8rem'}}>
            SYS.ERR: {error}
          </div>
        )}

        <div style={{position: 'relative', display: 'flex', flexDirection: 'column', flex: 1}}>
          {loading && (
            <div className="loading-overlay">
              <div className="loading-text">FETCHING FEED...</div>
              <div className="spinner"></div>
            </div>
          )}
          
          <ForecastHero 
            prediction={data.prediction} 
            lastClose={lastClose}
          />

          <div className="dashboard-grid">
            <StockChart 
              historicalData={data.historical} 
              indicators={indicators}
            />
            
            <Evaluation evalData={data.evaluation} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
