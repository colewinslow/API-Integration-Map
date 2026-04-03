# IntegrationMap

A visual tool for exploring how CRM platforms connect at the API level. Pick two platforms and see their data object mappings, API endpoints, webhook events, and sync conflicts side by side.

## Supported Platforms

- GoHighLevel (GHL)
- Follow Up Boss (FUB)
- kvCORE
- HubSpot
- Lofty (formerly Chime)

## What It Shows

- **Data Object Mappings** — How objects (contacts, deals, etc.) translate between platforms, with field-level mapping and confidence ratings
- **API Endpoints** — Key REST endpoints for each platform
- **Webhook Events** — Available webhook events and their payload shapes
- **Sync Conflicts & Gotchas** — Real-world issues like structural mismatches, auth differences, rate limits, and pipeline incompatibilities

## Tech Stack

- React + Vite
- Deployed on Vercel

## Getting Started

```bash
npm install
npm run dev
```

## Author

[Cole Winslow](https://colewinslow.com)
