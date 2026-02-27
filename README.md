# Stock Price Prediction Using Stacked LSTM with Macro Proxy Integration


## 1. Overview

This project implements a deep learning–based stock price prediction system using **stacked LSTM (Long Short-Term Memory)** networks. The system models historical time-series data and extends it with macro proxy features and binary shock flags to improve next-day prediction robustness.

The implemented pipeline supports:
- Multi-feature time series forecasting   
- Index-specific macro feature engineering   
- Binary overnight event flags 
- Model evaluation using regression metrics 
- Interactive visualization of actual vs predicted values

The system is designed for research and academic purposes.

## 2. Introduction
Traditional LSTM-based stock models learn:

`P(t-n)...P(t) -> P(t+1)` 

This approach primarily captures temporal autocorrelation but ignores external macroeconomic shocks and overnight signals.
To address this limitation, the architecture evolves into:
  
`[P(t-n)...P(t)] + [Macro\ Proxies] + [Shock\ Flags] -> P(t+1)`

This shifts the model from pure historical mapping to contextual next-day forecasting.

The implementation includes:
- Basic LSTM (Model_v0)  
- Stacked multi-feature LSTM (Model_v1)
- Extended macro-integrated model (Model_v2)

Core implementation details are documented in the project notebooks and news integration design.

## 3. Problem Statement

Stock prices are influenced by:
- Historical price structure
- Technical indicators
- Global market movements
- Currency fluctuations
- Interest rates
- Geopolitical and macroeconomic shocks
  
A pure time-series LSTM fails to capture cross-market dependencies and overnight structural breaks.

Objective:
Develop an LSTM-based system that integrates:
1. Historical price features
2. Technical indicators
3. Index-specific macro proxy signals
4. Binary shock event flags
To predict next trading day open and close prices.

## 4. Approach (Flowchart)

### System Flow
<br><img width="1899" height="907" alt="image" src="https://github.com/user-attachments/assets/cf8747f9-31d9-4b78-acb1-34d1b7695dd0" />


### Feature Structure
Generalized feature vector:
```
[price_features] 
+ [technical_indicators] 
+ [index_specific_macro_features] 
+ [binary_event_flags]
```
### Model Architecture
- Input Layer
- Stacked LSTM Layers
- Dropout Regularization
- Dense Output Layer
- Separate outputs for Open and Close
  
Models implemented:
|Model|Description|
|---|---|
|Model_v0|Basic LSTM using MA features|
|Model_v1|Stacked LSTM with technical indicators|
|Model_v2|Extended LSTM with macro proxy features|

Now, I have the `train_model.py` that runs the pipeline for the new stocks and stores model file, scalers and metadata of given stocks.
To make predictions just run the `predict.py` or run `app.py` for UI

## 5. Scope

### Current Scope
- Predict next-day Open and Close
- Multi-index support (NIFTY 50, BANKNIFTY, NIFTY IT, NIFTY AUTO, NIFTY METAL)
- Technical indicator integration
- Macro proxy mapping
- Binary event flag system
- Performance evaluation dashboard
    
### Out of Scope
- High-frequency intraday prediction
- Reinforcement learning trading strategies
- Portfolio optimization    
- Automated trade execution

## 6. Outcomes

### Streamlit UI
<br>
<img width="1899" height="907" alt="image" src="https://github.com/user-attachments/assets/21902943-fe39-417d-8563-87cae6d841da" />


### Metrics

#### Model_v1 Performance (Scaled Data)

|Metric|Open|Close|
|---|---|---|
|MSE|0.0011|0.0017|
|RMSE|0.0329|0.0417|
|R²|0.9802|0.9686|

#### Model_v2 Performance

|Metric|Open|Close|
|---|---|---|
|MSE|0.0019|0.0020|
|RMSE|0.0431|0.0443|
|R²|0.9558|0.9518|

## 7. Discussion

### Observations
1. Pure LSTM captures trend continuity but struggles with overnight shocks.  
2. Macro proxies improve structural awareness.  
3. Binary flags provide cleaner signal compared to raw sentiment scores.   
4. Scaled models outperform raw-price models in convergence stability.  
5. Adding features beyond optimal capacity can degrade generalization.
    
### Limitation
- Market efficiency limits achievable accuracy. 
- Prediction remains probabilistic, not deterministic. 
- Sudden black-swan events remain unpredictable.

### Expected Ceiling
Directional accuracy typically stabilizes within a constrained band for daily predictions due to noise dominance in short-term markets.

## 8. Future Work

### 1. Tier-3 NLP Integration

Pipeline:

```
News → Sentiment Model (FinBERT/VADER) 
→ Daily Aggregation 
→ Feature Injection into LSTM
```

### 2. Regime Detection
- Bull/Bear regime classifier
- Volatility regime segmentation

### 3. Attention Mechanism
- Replace vanilla LSTM with LSTM + Attention
- Temporal feature weighting

### 4. Transformer-based Time Series
- Temporal Fusion Transformer 
- Informer / PatchTST
    
### 5. Probabilistic Forecasting
- Prediction intervals
- Quantile regression
