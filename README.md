# OmniVoice AI

OmniVoice AI คือแพลตฟอร์ม **AI รับสายโทรศัพท์อัตโนมัติสำหรับธุรกิจ E-commerce** ที่เชื่อมต่อกับระบบร้านค้าเพื่อทำหน้าที่เป็นพนักงานขายอัจฉริยะ ตอบคำถามลูกค้า แนะนำสินค้า ปิดการขาย ตรวจสอบคำสั่งซื้อ และนัดหมายได้ตลอด 24 ชั่วโมง

## Repository Structure

```text
OmniVoice-AI
│
├─ .github
│  ├─ workflows
│  │  ├─ main.yml
│  │  ├─ docs-guard.yml
│  │  └─ security.yml
│  │
│  ├─ ISSUE_TEMPLATE
│  │  ├─ bug_report.md
│  │  ├─ feature_request.md
│  │  └─ ai-behavior.md
│  │
│  └─ pull_request_template.md
│
├─ CODEOWNERS
├─ CONTRIBUTING.md
├─ SECURITY.md
│
├─ docker
│  └─ entrypoint.sh
│
├─ Dockerfile
├─ docker-compose.yml
│
├─ docs
│  └─ voice-agent-architecture.md
│
├─ src
│  ├─ app.js
│  └─ routes
│
├─ tests
│
├─ package.json
├─ AGENTS.md
└─ README.md
```

## System Architecture Diagram (Database-driven)

แผนภาพด้านล่างแสดงโครงสร้างระบบที่เชื่อมระหว่าง telephony, AI orchestration, integration layer และโครงสร้างฐานข้อมูลหลักสำหรับการทำงานจริงของ OmniVoice AI

```mermaid
flowchart LR
    A[Customer Phone Call] --> B[Telephony Provider / SIP]
    B --> C[Voice Gateway]
    C --> D[Speech-to-Text]
    D --> E[Conversation Engine]
    E --> F[Sales & Support Agent Orchestrator]
    F --> G[Business APIs\nProduct / Order / Booking / CRM]
    F --> H[Text-to-Speech]
    H --> B

    G --> DB[(Operational Database)]
    F --> DB

    DB --> T1[(customers)]
    DB --> T2[(calls)]
    DB --> T3[(transcripts)]
    DB --> T4[(orders)]
    DB --> T5[(appointments)]
    DB --> T6[(leads)]
    DB --> T7[(knowledge_base)]
    DB --> T8[(handoff_events)]

    F --> I[QA / Analytics]
    I --> J[Dashboard / Admin]
    DB --> J
```

## Database Relationship Diagram

```mermaid
erDiagram
    CUSTOMERS ||--o{ CALLS : places
    CALLS ||--o{ TRANSCRIPTS : contains
    CUSTOMERS ||--o{ ORDERS : creates
    CUSTOMERS ||--o{ APPOINTMENTS : books
    CUSTOMERS ||--o{ LEADS : becomes
    CALLS ||--o{ HANDOFF_EVENTS : escalates
    CALLS }o--o{ KNOWLEDGE_BASE : references

    CUSTOMERS {
      string customer_id PK
      string name
      string phone
      string channel
      datetime created_at
    }

    CALLS {
      string call_id PK
      string customer_id FK
      string status
      string intent
      datetime started_at
      datetime ended_at
    }

    TRANSCRIPTS {
      string transcript_id PK
      string call_id FK
      string speaker
      text utterance
      datetime created_at
    }

    ORDERS {
      string order_id PK
      string customer_id FK
      string order_status
      decimal amount
      datetime created_at
    }

    APPOINTMENTS {
      string appointment_id PK
      string customer_id FK
      datetime appointment_time
      string assignee
      string status
    }

    LEADS {
      string lead_id PK
      string customer_id FK
      string stage
      string source
      datetime created_at
    }

    KNOWLEDGE_BASE {
      string kb_id PK
      string category
      string title
      text content
      datetime updated_at
    }

    HANDOFF_EVENTS {
      string handoff_id PK
      string call_id FK
      string reason
      string handoff_to
      datetime created_at
    }
```

## Getting Started

```bash
npm ci
npm run dev
```

หรือรันผ่าน Docker

```bash
docker compose up --build
```


## Troubleshooting npm install (Node 22 / inotify)

หากเจอ error ตอนติดตั้งที่เกี่ยวกับ `node_modules/inotify` และ `node-gyp rebuild` ให้ล้าง dependency เดิมแล้วติดตั้งใหม่จาก lockfile:

```bash
rm -rf node_modules
npm ci
```

โปรเจกต์นี้ไม่ต้องพึ่ง native module `inotify` โดยตรง ดังนั้นการติดตั้งจาก `package-lock.json` ควรผ่านได้บน Node.js 20+.
