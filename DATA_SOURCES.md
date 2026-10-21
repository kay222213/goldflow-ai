# Data-source and market-microstructure notes

## Spot XAUUSD
Spot gold is an over-the-counter market with fragmented liquidity and broker-specific quotes. There is no single universal spot tape. A quote must carry provider, timestamp, bid/ask, and freshness metadata. For a real integration, reject stale or malformed responses rather than reusing cached prices.

## COMEX GC / MGC futures
COMEX futures are centralized exchange-traded contracts. Genuine trade-side delta requires exchange trade data and a trustworthy aggressor classification (or a documented classification algorithm); depth requires a book feed. Access is commonly subject to exchange licensing and provider terms. Futures and spot differ due to financing, storage, delivery, maturity and market conditions. For aligned timestamps, basis = futures price − spot price. Handle contract expiry and roll.

## Free/public APIs
Free tiers and public APIs change frequently, may require keys, impose rate limits, lack historical tick data, restrict commercial use, or disallow browser CORS requests. The current build intentionally does not claim a free endpoint is reliable without verification and does not embed API keys. GitHub Pages cannot execute backend code. Use a secure backend with server-side environment secrets if an authenticated source is added.

## What the app currently calculates
The risk desk uses entered account values. The backtest accepts OHLC candles and tests a simple close-breakout proxy. It does not compute CVD, aggressor volume, footprint imbalances, absorption, DOM imbalance, open interest, or volume-at-price. Those remain unavailable until an appropriate dataset is integrated.
