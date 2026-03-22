from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import json
import os
import yfinance as yf

# Try/Except to handle potential missing local modules
try:
    from interface.predict import predict_next_day, get_fetch_window
    from interface.predict_config import INDEX_CONFIG, BASE_MODEL_DIR, METADATA_FILENAME
    from features.technical_indicators import add_technical_indicators
except ImportError:
    INDEX_CONFIG = {}
    predict_next_day = None

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/config', methods=['GET'])
def get_config():
    return jsonify({
        "indexes": INDEX_CONFIG
    })

@app.route('/api/forecast', methods=['GET'])
def get_forecast():
    index_name = request.args.get('index', 'nifty50')
    days = int(request.args.get('days', 365))
    
    if index_name not in INDEX_CONFIG:
        return jsonify({"error": "Invalid index"}), 400
        
    ticker = INDEX_CONFIG[index_name]["ticker"]
    
    # 1. Prediction
    try:
        if predict_next_day:
            prediction = predict_next_day(index_name)
        else:
            prediction = {"Close": 0, "Open": 0}
    except Exception as e:
        prediction = {"error": str(e)}

    # 2. Historical Data
    now = pd.Timestamp.now(tz="Asia/Kolkata")
    market_close = now.normalize() + pd.Timedelta(hours=15, minutes=30)

    if now < market_close:
        data_cutoff = now.normalize() - pd.Timedelta(days=1)
        prediction_day = now.normalize()
    else:
        # Market CLOSED
        data_cutoff = now.normalize()
        prediction_day = now.normalize() + pd.Timedelta(days=1)

    end = data_cutoff + pd.Timedelta(days=1)
    start = end - pd.Timedelta(days=days)
    
    try:
        df = yf.download(ticker, start=start, end=end, progress=False)
        if df.empty:
            historical_data = []
        else:
            if isinstance(df.columns, pd.MultiIndex):
                # Flatten yfinance multi-index columns if needed
                df = df.xs(ticker, axis=1, level=1)
            df.dropna(inplace=True)
            df = add_technical_indicators(df)
            
            # Convert index to string for JSON serialization
            df.index = df.index.strftime('%Y-%m-%d')
            import numpy as np
            df = df.replace({np.nan: None})
            historical_data = df.reset_index().rename(columns={"Date": "time"}).to_dict(orient='records')
    except Exception as e:
        historical_data = []
        print(f"Error fetching historical data: {e}")

    return jsonify({
        "ticker": ticker,
        "prediction": prediction,
        "historical": historical_data,
        "prediction_day": prediction_day.strftime('%Y-%m-%d')
    })

@app.route('/api/evaluation', methods=['GET'])
def get_evaluation():
    index_name = request.args.get('index', 'nifty50')
    
    metadata_path = os.path.join(BASE_MODEL_DIR, index_name, METADATA_FILENAME)
    if not os.path.exists(metadata_path):
        return jsonify({"error": "Metadata not found"}), 404
        
    try:
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
        return jsonify(metadata)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)