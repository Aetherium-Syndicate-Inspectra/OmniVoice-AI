# AI Sales Conversation Engine

The sales engine is designed for Thai-first e-commerce phone sales.

## Current intents

- `sales`
- `order_status`
- `appointment`
- `human_handoff`
- `general`

## Business actions

- lead capture
- appointment creation
- human handoff
- product recommendation
- order lookup

## Design notes

- prefers safe business facts over hallucination
- uses sample catalog and order data now
- can optionally polish replies with an LLM
- keeps agent language polite, short, and sales-oriented
