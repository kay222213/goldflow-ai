# GoldFlow AI — XAUUSD PWA prototype

A mobile-first Progressive Web App prototype. This is a real working front-end, but it is **not yet an institutional order-flow engine**.

## Included
- XAU spot quote polling from `https://api.gold-api.com/price/XAU` (availability, CORS, and terms may change)
- Embedded TradingView XAUUSD chart
- Transparent sampled-price momentum/volatility heuristic
- Experimental entry / stop / target estimates
- PWA manifest and service worker for installation/caching

## Important limitations
- Spot-price snapshots do not expose aggressor-side trade volume, bid/ask delta, a footprint chart, or a consolidated gold order book.
- The displayed “model strength” is not a probability of profit.
- Price source may differ from a broker's executable XAUUSD quote.
- This prototype should not be used as a standalone basis for live trading.

## Install on iPhone (free)
1. Publish these files to a public GitHub repository.
2. In the repository settings, enable **Pages** and deploy from the `main` branch, root folder.
3. Open the resulting HTTPS GitHub Pages URL in Safari on the iPhone.
4. Tap **Share → Add to Home Screen**.
5. Open it from the new Home Screen icon.

GitHub account and initial publish step are required; the project cannot be deployed to your account without your authorisation. GitHub Pages is intended for static sites. Check current GitHub Pages terms and limits.

## Next engineering milestone
Connect a documented market-data source that supports historical/intraday candles and, if available, bid/ask trade or depth data. Keep the data source adapter separate from the signal engine. Only after the feed is verified should CVD, footprint imbalance, absorption and order-book features be added.

## Local preview
Open `index.html` in a browser. Some PWA features require HTTPS or localhost. The chart and quote require internet access.
