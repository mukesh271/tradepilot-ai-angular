# TradePilot AI Frontend

TradePilot AI is the Angular frontend for a personal AI-powered trading research and paper-trading dashboard. This MVP focuses on a research dashboard, signals, paper trading workflow, instruments, strategy views, risk settings, and performance foundations without connecting to actual brokers or market-data providers.

## Tech Stack

- Angular 22
- TypeScript
- Standalone Angular components
- Angular Router
- Reactive Forms
- RxJS
- SCSS
- Angular HttpClient

## Project Structure

```text
src/
├── app/
│   ├── core/
│   │   ├── config/
│   │   ├── interceptors/
│   │   ├── models/
│   │   └── services/
│   ├── features/
│   │   ├── dashboard/
│   │   ├── technical-analysis/
│   │   ├── instruments/
│   │   ├── paper-trades/
│   │   ├── performance/
│   │   ├── risk-settings/
│   │   ├── signals/
│   │   └── strategies/
│   ├── layout/
│   │   ├── header/
│   │   ├── main-layout/
│   │   └── sidebar/
│   ├── shared/
│   │   └── components/
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
├── environments/
│   ├── environment.ts
│   └── environment.development.ts
├── index.html
├── main.ts
├── styles.scss
└── favicon.ico
```

## Install

```bash
npm install
```

## Run locally

```bash
npm start
```

Then open http://localhost:4200.

## Build and Test

```bash
npm run build
npm test
```

## Environment Configuration

The app uses `environment.ts` and `environment.development.ts` for API and mock settings.

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'https://localhost:7001/api',
  useMockData: true
};
```

Update `apiBaseUrl` when the ASP.NET Core backend is ready. Adjust `useMockData` to switch between safe local demo data and the real backend API.

## Mock Mode

Mock mode is intentionally isolated from the real backend calls. When `useMockData` is `true`, the services return in-memory demo payloads so the UI can still be developed and tested while the backend is being built.

## Routes

- `/dashboard`
- `/signals`
- `/signals/:id`
- `/paper-trades`
- `/instruments`
- `/strategies`
- `/performance`
- `/risk-settings`
- `/technical-analysis`

## Technical Analysis (MVP-2 frontend)

The `/technical-analysis` page provides instrument/timeframe controls, historical OHLCV candles, indicator cards, strategy-condition explanations, and summary warnings. Mock mode uses deterministic, dated sample history and is clearly identified as non-live.

The Technical Analysis service integrates the documented candle retrieval/import and analysis latest/history/calculate APIs using the standard response envelope and environment API URL. The backend returns stored historical candles; it does not provide live market data. Import can be called through the typed service, but this page does not include a candle-file upload workflow. The chart uses TradingView Lightweight Charts.

Frontend API models/adapters also map the documented flat signal DTOs and aggregate performance DTO, and paper-trade close requests include the required exit price and reason.

## MVP-1 Scope

- Research dashboard with risk summary cards
- Signal list and detail views
- Paper-trade list and creation flow
- Instruments read-only page with filter/search
- Strategy cards with active/inactive state
- Risk settings form with validation
- Performance section with empty-state handling
- Loading, error, empty-state, and toast UX
- Responsive layout for desktop and mobile screens

## Future Roadmap

- AI-powered signal scoring
- Real-time market data integration
- F&O support for options and futures
- AI-powered news and sentiment analysis
- Backtesting, analytics, and learning engine
- PWA/mobile notifications and broker integration in later phases
