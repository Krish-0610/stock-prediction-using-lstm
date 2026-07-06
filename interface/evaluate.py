"""
Sliding-window backtest for stock prediction models.

Runs the trained model over the last `eval_days` trading days,
comparing predicted vs actual Close/Open prices.
"""

import numpy as np
import pandas as pd

from interface.predict import load_artifacts, build_features
from interface.predict_config import INDEX_CONFIG, LOOKBACK


def run_backtest(index_name, eval_days=30):
    """
    Run a sliding-window backtest for the given index.

    Parameters
    ----------
    index_name : str
        Key into INDEX_CONFIG (e.g. "nifty50").
    eval_days : int
        Number of recent trading days to evaluate.

    Returns
    -------
    dict
        Backtest results including per-day predictions and summary metrics.
    """

    # ---------- Validate index ----------
    if index_name not in INDEX_CONFIG:
        raise ValueError(f"Unknown index: {index_name}")

    ticker = INDEX_CONFIG[index_name]["ticker"]

    # ---------- Load model artifacts ----------
    model, input_scaler, target_scaler, feature_order = load_artifacts(index_name)

    # ---------- Calculate fetch window ----------
    # We need LOOKBACK rows before the first prediction day,
    # plus eval_days prediction rows, plus ~300 extra rows for
    # indicator warm-up (MA200 needs ≥200 raw bars).
    buffer_days = LOOKBACK + eval_days + 300
    end = pd.Timestamp.now(tz="Asia/Kolkata")
    start = end - pd.Timedelta(days=int(buffer_days * 1.5))

    start_str = start.strftime("%Y-%m-%d")
    end_str = end.strftime("%Y-%m-%d")

    # ---------- Build features ONCE for the full period ----------
    df = build_features(ticker, start_str, end_str)

    if df.empty:
        raise RuntimeError("Feature dataframe is empty after build_features")

    # ---------- Preserve raw prices before subsetting columns ----------
    raw_open = df["Open"].values.copy()
    raw_close = df["Close"].values.copy()

    # ---------- Scale all features ----------
    X_all = input_scaler.transform(df[feature_order].values)

    # ---------- Create batch of sliding windows ----------
    eval_count = min(eval_days, len(df) - LOOKBACK)
    if eval_count <= 0:
        raise RuntimeError(
            f"Not enough data for backtest: have {len(df)} rows, "
            f"need at least {LOOKBACK + 1}"
        )

    X_batch = np.empty((eval_count, LOOKBACK, X_all.shape[1]), dtype=np.float32)

    for i in range(eval_count):
        pred_idx = len(df) - eval_count + i  # index of the day we're predicting
        window_start = pred_idx - LOOKBACK
        X_batch[i] = X_all[window_start:pred_idx]  # LOOKBACK rows ending BEFORE pred_idx

    # ---------- Batch predict ----------
    y_scaled = model.predict(X_batch, verbose=0)
    y_log = target_scaler.inverse_transform(y_scaled)  # log-returns

    # ---------- Compare predictions with actuals ----------
    results = []
    direction_correct_count = 0

    for i in range(eval_count):
        pred_idx = len(df) - eval_count + i
        last_close = float(raw_close[pred_idx - 1])

        # Predicted prices (from log-returns)
        pred_close = last_close * np.exp(y_log[i, 0])
        pred_open = last_close * np.exp(y_log[i, 1])

        # Actual prices
        actual_close = float(raw_close[pred_idx])
        actual_open = float(raw_open[pred_idx])

        # Errors
        close_error = pred_close - actual_close
        open_error = pred_open - actual_open
        close_error_pct = (close_error / actual_close) * 100 if actual_close != 0 else 0.0
        open_error_pct = (open_error / actual_open) * 100 if actual_open != 0 else 0.0

        # Directional accuracy
        direction_correct = bool(
            (pred_close - last_close) * (actual_close - last_close) > 0
        )
        if direction_correct:
            direction_correct_count += 1

        # Date string from the dataframe index
        date_str = str(df.index[pred_idx])[:10]

        results.append({
            "date": date_str,
            "pred_close": round(float(pred_close), 2),
            "actual_close": round(actual_close, 2),
            "pred_open": round(float(pred_open), 2),
            "actual_open": round(actual_open, 2),
            "close_error": round(float(close_error), 2),
            "open_error": round(float(open_error), 2),
            "close_error_pct": round(float(close_error_pct), 2),
            "open_error_pct": round(float(open_error_pct), 2),
            "direction_correct": direction_correct,
        })

    # ---------- Summary metrics ----------
    abs_close_errors = [abs(r["close_error"]) for r in results]
    abs_open_errors = [abs(r["open_error"]) for r in results]
    abs_close_pct_errors = [abs(r["close_error_pct"]) for r in results]
    abs_open_pct_errors = [abs(r["open_error_pct"]) for r in results]

    total_predictions = len(results)

    summary = {
        "total_predictions": total_predictions,
        "directional_accuracy": round(
            (direction_correct_count / total_predictions) * 100, 2
        ) if total_predictions > 0 else 0.0,
        "mape_close": round(np.mean(abs_close_pct_errors), 2),
        "mape_open": round(np.mean(abs_open_pct_errors), 2),
        "avg_error_close": round(np.mean(abs_close_errors), 2),
        "avg_error_open": round(np.mean(abs_open_errors), 2),
        "max_error_close": round(np.max(abs_close_errors), 2),
        "max_error_open": round(np.max(abs_open_errors), 2),
        "median_error_close": round(float(np.median(abs_close_errors)), 2),
        "median_error_open": round(float(np.median(abs_open_errors)), 2),
    }

    return {
        "index": index_name,
        "ticker": ticker,
        "eval_days": total_predictions,
        "results": results,
        "summary": summary,
    }
