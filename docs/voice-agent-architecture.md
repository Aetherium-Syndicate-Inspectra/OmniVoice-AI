# OmniVoice AI — Voice Agent Architecture

## Overview

OmniVoice AI is structured in layers:

1. **Telephony layer** — Twilio, Telnyx, SIP bridge
2. **Speech layer** — STT and optional external TTS
3. **Conversation layer** — sales engine and prompt shaping
4. **Business action layer** — product lookup, order status, appointment, handoff
5. **Delivery layer** — TwiML, Telnyx call control, or SIP bridge response

## Request lifecycle

### Twilio
Incoming call → Voice webhook → TwiML `<Gather>` → transcript → sales engine → TwiML `<Say>` or `<Play>`

### Telnyx
Voice webhook → answer call → AI gather → structured fields → sales engine → speak command

### SIP bridge
PBX event → transcript/audio POST → pipeline → JSON response with speak text or audio URL

## Replaceable integrations

- catalog service → Shopify / WooCommerce / custom API
- order service → OMS / shipping system
- appointment service → Google Calendar / CRM
- handoff service → email / Slack / CRM task
