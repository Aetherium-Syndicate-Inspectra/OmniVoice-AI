# Telephony Webhooks

This module provides webhook receivers for:

- Twilio Voice
- Telnyx Voice API
- SIP / PBX bridge webhook

## Twilio

### Endpoints

- `POST /api/webhooks/twilio/voice`
- `POST /api/webhooks/twilio/gather`
- `POST /api/webhooks/twilio/status`

### Flow

1. Incoming call hits `/voice`
2. Server returns TwiML with greeting and `<Gather input="speech dtmf">`
3. Gather results hit `/gather`
4. The sales engine generates a reply
5. TwiML returns `<Say>` or `<Play>`

## Telnyx

### Endpoint

- `POST /api/webhooks/telnyx/voice`

### Flow

1. `call.initiated` → answer call
2. `call.answered` → start AI gather
3. `call.ai_gather.ended` → run sales engine and speak reply
4. loop to gather again

## SIP bridge

### Endpoint

- `POST /api/webhooks/sip/events`

This is a generic HTTP bridge for a PBX or SIP application server. It is intentionally vendor-neutral so you can connect Asterisk, FreeSWITCH, Kamailio, or your own middleware.
