# GoldFlow AI Elite

A static, GitHub Pages-compatible XAUUSD trade-planning PWA. The application deliberately does **not** manufacture prices, order-flow data, or trade signals.

## What works
- Responsive dark-theme dashboard and iPhone PWA shell.
- Honest disconnected state if a verified quote feed is not configured.
- Risk calculator: monetary risk, target/equity percentage, daily loss allowance, target distance, equity drawdown, and hypothetical wins required.
- CSV candle import and a basic out-of-sample candle breakout backtest with user-entered cost assumptions.
- Local preference persistence; no broker credentials or API secrets are stored.
- Service worker caches the application shell, not market prices as live data.

## Important limitations
- This package does not include a live quote backend, authenticated market-data credentials, genuine classified trade prints, CVD, footprint, DOM, or order-book data.
- Spot XAUUSD is OTC and broker-specific. A broker feed is not a consolidated global tape.
- COMEX GC/MGC is a distinct exchange-traded futures market. Futures price is not spot price; calculate a timestamp-aligned futures-minus-spot basis and handle expiry/roll before comparing.
- The included backtest is a simple candle-close breakout proxy. It does not test order-flow strategies, does not model all real-world execution effects, and is not evidence of profitability.
- No automated execution is included.
- The public quote selector documents a potential provider path but is intentionally not wired to a fake or keyless endpoint. A real provider may require API credentials, licensing, CORS support, and/or a backend.

## Deploy to existing GitHub Pages site
1. Download and extract `goldflow-ai-elite.zip`.
2. Open your existing repository: https://github.com/kay222213/goldflow-ai
3. Replace/add the files and folders from the ZIP at the repository root (do not upload the ZIP itself as the website).
4. Commit the changes. Keep the existing GitHub Pages configuration and branch/folder setting.
5. Visit https://kay222213.github.io/goldflow-ai/ and refresh. If the old app persists, wait a few minutes, then close/reopen Safari or clear website data; the service worker may take a refresh to update.
6. On iPhone Safari, open the deployed URL, tap Share, then **Add to Home Screen**.

## Data adapter extension
For a production feed, implement a same-origin HTTPS backend endpoint such as `/api/quote` that returns `{ "symbol":"XAUUSD", "bid":0, "ask":0, "timestamp":"ISO-8601", "provider":"name" }`. Validate timestamps, symbol, bid/ask, and response schema before rendering. Keep keys in backend environment variables, never in this repository. For genuine order flow, the adapter must provide timestamped trade prints with aggressor-side classification and/or book updates from a licensed feed. Label all futures data as futures, preserve the contract symbol/expiry, and calculate basis rather than substituting it for spot.

## Backtest CSV format
Required header names: `open,high,low,close`; optional `time,volume`. Rows must be chronological, same timeframe, numeric, and OHLC-valid. Backtest metrics are in price units, not account currency. Configure realistic spread/slippage costs. Use separate training and out-of-sample periods and do not tune solely to the holdout.

## Tests performed
The package generation script validates required files and runs JavaScript syntax checking with Node.js when available. Browser-level behavior and a live provider connection were not tested in this build environment. Review the UI and backtest with known sample CSVs before relying on results.

## Privacy and safety
No broker login, API secret, or personal account credential is requested. Local settings are limited to harmless preferences. Analysis is for educational planning, not financial advice.
