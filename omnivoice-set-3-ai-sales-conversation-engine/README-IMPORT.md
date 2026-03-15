# OmniVoice AI — Production Pack Import Guide

This bundle adds three production-oriented modules to a Node/Express OmniVoice AI repository:

1. **AI Voice Call Pipeline (STT → LLM → TTS)**
2. **Telephony Webhooks (Twilio / Telnyx / SIP bridge)**
3. **AI Sales Conversation Engine**

## Quick import

Copy these folders into your repository root:

- `src/`
- `docs/`
- `data/`
- `.env.example`

## Install runtime dependencies

Your current `package.json` is close, but to use external provider helpers in production you will usually also want:

```bash
npm install twilio
```

`twilio` is optional in this bundle. If it is not installed, the Twilio routes still run, but signature validation falls back to a warning-only mode.

## Start

```bash
npm install
npm run dev
```

Default server URL:

```bash
http://localhost:3000
```

## Main endpoints

- `GET /health`
- `POST /api/pipeline/run-turn`
- `POST /api/webhooks/twilio/voice`
- `POST /api/webhooks/twilio/gather`
- `POST /api/webhooks/telnyx/voice`
- `POST /api/webhooks/sip/events`

## Notes

- This pack is designed to be **drop-in and extensible**, not a hidden black box.
- Product, order, booking, and lead services currently ship with **safe starter logic** and **sample data**.
- Replace sample data integrations with your real e-commerce, CRM, order, and calendar systems.
