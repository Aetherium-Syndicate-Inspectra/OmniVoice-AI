# OmniVoice AI 🎙️🤖

แพลตฟอร์ม AI รับสายโทรศัพท์อัตโนมัติสำหรับธุรกิจ E-commerce ที่เชื่อมต่อกับระบบร้านค้า เพื่อทำหน้าที่เป็นพนักงานขายอัจฉริยะ ตอบคำถาม ปิดการขาย และนัดหมายได้ตลอด 24 ชั่วโมง

## 📁 Directory Structure

```text
omni-voice-ai/
├── .github/
│   ├── dependabot.yml
│   ├── pull_request_template.md
│   └── workflows/
│       ├── ci.yml
│       ├── cd.yml
│       ├── security.yml
│       └── main.yml  (legacy/manual only)
├── src/
│   ├── config/
│   ├── controllers/
│   ├── services/
│   │   ├── knowledgeBase.js
│   │   ├── voiceAgent.js
│   │   ├── paymentService.js
│   │   ├── bookingService.js
│   │   └── summaryService.js
│   ├── utils/
│   └── app.js
├── docs/
├── .env.example
├── package.json
└── README.md
```

## 🔄 ขั้นตอนการทำงานของ AI รับสายแทน (Workflow)

1. **ลูกค้ายิงคำถาม:** ลูกค้าโทรเข้ามาถามเรื่องสินค้า ราคา หรือบริการ
2. **AI ประมวลผล:** ระบบค้นหาข้อมูลจาก Knowledge Base ของร้าน (รองรับการดึงข้อมูลจากไฟล์ PDF หรือ Google Sheets ที่อัปโหลดไว้) เพื่อหาคำตอบที่แม่นยำที่สุด
3. **ระบบโต้ตอบและปิดการขาย:** AI แจ้งรายละเอียดและสอบถามความต้องการด้วยน้ำเสียงเป็นธรรมชาติ หากลูกค้าตกลงซื้อ ระบบจะส่งลิงก์ชำระเงินทาง SMS หรือทำการจองคิวในปฏิทินให้ทันที
4. **สรุปข้อมูล:** หลังวางสาย AI จะประมวลผลและส่งสรุปบทสนทนา (Summary) ไปให้เจ้าของร้านหรือผู้ติดต่อทาง Line / Email เพื่อให้ทราบว่าใครโทรมาและต้องการสั่งอะไร

---

## 🛠️ การติดตั้งและการเชื่อมต่อ (Integrations)

แพลตฟอร์มนี้ออกแบบมาเพื่อธุรกิจขายของออนไลน์โดยเฉพาะ โดยรองรับการทำงานร่วมกับ:

- **Shopify:** ดึงข้อมูลสต็อกสินค้าแบบ Real-time และสร้างออเดอร์อัตโนมัติ
- **Ringly & Retell AI:** ขุมพลังหลักในการประมวลผลเสียง (Speech-to-Text / Text-to-Speech) รองรับทั้ง **ภาษาไทยและภาษาอังกฤษ** ให้สำเนียงที่เป็นมนุษย์และเป็นธรรมชาติที่สุด
- **Line Messaging API:** สำหรับส่งข้อความสรุปการสนทนาแจ้งเตือนแอดมินทันทีที่สายตัด

## 🚀 วิธีการเริ่มต้นใช้งาน (Getting Started)

1. Clone repository นี้
2. คัดลอกไฟล์ `.env.example` เป็น `.env` และใส่ค่า API Keys (Retell, Shopify, Line)
3. รันคำสั่ง `npm install`
4. รันเซิร์ฟเวอร์ด้วย `npm start`

---

## 🧭 ข้อเสนอการพัฒนาต่อยอดแพลตฟอร์ม (Platform Work Proposal)

> เอกสารนี้จัดทำตามกรอบ `CODEX /CREATE_PLATFORM_WORK` เพื่อกำหนดแผนต่อยอด OmniVoice AI สู่ระดับ Production Scale

### 1) Initiative Context

- **Initiative:** OmniVoice AI Platform Scale 2026
- **Scope:** Voice orchestration services, knowledge retrieval modules, observability/reliability stack, deployment infra, และ integration adapters
- **Drivers:**
  - เพิ่ม reliability ระดับ production
  - ลด latency ช่วงสนทนาแบบเรียลไทม์
  - ควบคุมต้นทุน inference และ telephony
  - ยกระดับ security/compliance สำหรับข้อมูลลูกค้า
  - เพิ่ม developer experience ให้ทีมออกฟีเจอร์เร็วขึ้น
- **Current state (As-Is):** มี workflow หลักรับสาย-ตอบคำถาม-ส่งสรุปแล้ว แต่ยังไม่ได้ระบุ SLO, benchmark gate, runbook, rollback strategy และการแบ่ง workstream ที่วัดผลได้ชัดเจน
- **Target state (To-Be):** แพลตฟอร์มพร้อม production ที่วัดผลได้ด้วย SLO/SLI, มีแผน rollout/rollback, มี observability ครบ, รองรับโหลดสูง และขยาย integration ได้อย่างปลอดภัย
- **Constraints:**
  - **SLO เป้าหมาย:** availability ≥ 99.95%, P95 response turn latency ≤ 1.8 วินาที, call failure rate ≤ 0.5%
  - **Budget:** คุมต้นทุนต่อสายไม่เกิน 85% ของ baseline ปัจจุบัน
  - **Timeline:** 3 phases ภายใน 16 สัปดาห์
  - **Compliance:** PDPA-ready, encryption at rest/in transit, audit log เข้าถึงข้อมูลสำคัญ
- **Dependencies:** ทีม Voice AI, ทีม Backend/Infra, ทีม Security, vendor (Ringly/Retell/Shopify/LINE), และฝ่ายปฏิบัติการลูกค้า

### 2) Workstreams

1. **Architecture**
   - ปรับโครงสร้าง service boundaries (call-session, knowledge, order/booking, notification)
   - รองรับ event-driven processing สำหรับ post-call summary
2. **Protocol**
   - กำหนด contract มาตรฐานระหว่าง voice engine ↔ orchestration ↔ integrations
   - versioning strategy สำหรับ webhook/event schema
3. **Reliability**
   - ออกแบบ retry/circuit breaker/idempotency
   - เพิ่ม auto-failover และ graceful degradation (เช่น fallback intent / human handoff)
4. **Benchmark**
   - สร้าง load profile สำหรับ concurrent calls
   - ตั้ง benchmark gate ใน CI/CD ก่อนปล่อยจริง
5. **Ops**
   - observability stack (metrics, logs, traces, alerting)
   - incident response + runbook + on-call playbook
6. **Migration**
   - progressive rollout จาก tenant กลุ่มเล็ก → กลาง → ทั้งระบบ
   - เตรียม rollback trigger/steps ที่ทดสอบแล้ว

### 3) Backlog (Epic → Story → Task + Acceptance Criteria)

#### Epic A: Core Architecture Hardening
- **Story A1: แยก Call Session Service**
  - **Task A1.1:** แยก state management ของสายออกจาก integration logic
  - **Task A1.2:** เพิ่ม persistent state สำหรับ reconnect/retry
  - **Acceptance Criteria:**
    - สายที่หลุดชั่วคราวกลับมาทำงานต่อได้ภายใน 5 วินาทีใน 95% ของกรณีทดสอบ
    - session data loss < 0.1% ต่อ 10,000 สาย

- **Story A2: Event-driven Post-call Pipeline**
  - **Task A2.1:** ส่ง event `call.ended` และ `summary.ready` ผ่าน queue
  - **Task A2.2:** รองรับ dead-letter queue และ replay
  - **Acceptance Criteria:**
    - summary delivery success rate ≥ 99.9%
    - replay ข้อมูลจาก DLQ สำเร็จ ≥ 99% ภายใน 30 นาที

#### Epic B: Protocol & Integration Reliability
- **Story B1: Standard Integration Contract**
  - **Task B1.1:** กำหนด schema สำหรับ inventory/order/booking APIs
  - **Task B1.2:** เพิ่ม schema validation และ compatibility test
  - **Acceptance Criteria:**
    - breaking change ผ่านไม่ได้ถ้าไม่ bump version
    - contract test coverage ≥ 90% ของ critical APIs

- **Story B2: Idempotent External Actions**
  - **Task B2.1:** เพิ่ม idempotency key ในการสร้าง order/booking
  - **Task B2.2:** deduplicate webhook retries
  - **Acceptance Criteria:**
    - duplicate order rate < 0.05%
    - retry แล้วไม่มี side-effect ซ้ำในทุกกรณี test matrix

#### Epic C: Reliability, SLO & Benchmark Gate
- **Story C1: SLO/SLI Definition and Alerting**
  - **Task C1.1:** นิยาม SLI สำหรับ availability, latency, quality
  - **Task C1.2:** ตั้ง alert policy (warn/critical) พร้อม error budget
  - **Acceptance Criteria:**
    - มี dashboard ครบทุก SLI และ alert noise < 10% false positives

- **Story C2: Performance Benchmarking**
  - **Task C2.1:** ทำ synthetic load test 50/100/300 concurrent calls
  - **Task C2.2:** เก็บ baseline cost-per-call และ compute efficiency
  - **Acceptance Criteria:**
    - P95 turn latency ≤ 1.8s ที่ 100 concurrent calls
    - ไม่มี memory leak ต่อเนื่องเกิน 5% ใน 2 ชั่วโมงทดสอบ

#### Epic D: Security & Compliance Readiness
- **Story D1: Data Protection Controls**
  - **Task D1.1:** จัดการ encryption at rest + in transit ครบทุก service
  - **Task D1.2:** policy สำหรับ PII redaction ใน logs/transcripts
  - **Acceptance Criteria:**
    - log ที่มีข้อมูลอ่อนไหวถูก mask 100% ใน test corpus
    - ผ่าน security review checklist โดยไม่มี critical finding

#### Epic E: Ops & Migration Execution
- **Story E1: Runbook + Incident Drill**
  - **Task E1.1:** สร้าง runbook สำหรับ incident หลัก 5 ประเภท
  - **Task E1.2:** ซ้อม game day รายเดือน
  - **Acceptance Criteria:**
    - MTTR < 30 นาทีใน simulated incidents
    - on-call handoff ครบถ้วนตาม checklist 100%

- **Story E2: Progressive Rollout**
  - **Task E2.1:** canary rollout (5% → 25% → 100%)
  - **Task E2.2:** feature flag สำหรับ fallback รุ่นก่อนหน้า
  - **Acceptance Criteria:**
    - rollback ใช้งานได้จริงภายใน 10 นาที
    - error budget burn ไม่เกิน threshold ที่กำหนดในทุก phase

### 4) Options + Tradeoffs + Recommendation

#### Option 1: Monolith+ (ปรับปรุงระบบเดิมแบบ incremental)
- **ข้อดี:** ส่งมอบเร็ว, เปลี่ยนแปลงน้อย, ความเสี่ยง migration ต่ำ
- **ข้อเสีย:** scalability/reliability เพดานต่ำกว่า, technical debt โตต่อเนื่อง
- **เหมาะเมื่อ:** timeline สั้นมาก และโหลดยังไม่สูง

#### Option 2: Modular Services with Event Backbone (**Recommended**)
- **ข้อดี:** scale ตามโดเมนได้, isolation ดี, สอดคล้องกับ SLO/observability, รองรับอนาคต multi-tenant
- **ข้อเสีย:** complexity สูงขึ้น, ต้องลงทุน ops/platform เพิ่ม
- **เหตุผลที่เลือก:** สมดุลระหว่างความเสี่ยงกับผลระยะยาว สามารถ rollout แบบค่อยเป็นค่อยไปโดยไม่หยุดบริการ

#### Option 3: Full Microservices Rebuild
- **ข้อดี:** flexibility สูงสุด, architecture สะอาด
- **ข้อเสีย:** ใช้เวลานาน, เสี่ยงต่อ delivery, migration cost สูง
- **เหมาะเมื่อ:** มีทีม platform พร้อมและยอมรับการลงทุนยาว

### 5) Risks, Failure Modes, Mitigation

- **Vendor outage (STT/TTS/Telephony):**
  - *Failure mode:* สายค้าง/คุณภาพเสียงตก
  - *Mitigation:* multi-provider fallback, circuit breaker, SLA monitoring
- **Knowledge retrieval latency spike:**
  - *Failure mode:* ตอบช้าเกินธรรมชาติ
  - *Mitigation:* response caching, prefetch top intents, timeout + fallback response
- **Duplicate transaction (order/booking):**
  - *Failure mode:* ลูกค้าถูกสร้างออเดอร์ซ้ำ
  - *Mitigation:* idempotency key, reconciliation job รายชั่วโมง
- **Observability gap:**
  - *Failure mode:* ตรวจจับ incident ช้า
  - *Mitigation:* บังคับ trace propagation + golden dashboards ก่อน production
- **Security/PII leakage:**
  - *Failure mode:* หลุดข้อมูลลูกค้า
  - *Mitigation:* redaction policy, DLP scans, least privilege IAM, audit log review

### 6) Rollout / Rollback Plan + Owner + Timeline

| Phase | Timeline | Scope | Owner | Exit Criteria | Rollback Trigger |
| :-- | :-- | :-- | :-- | :-- | :-- |
| Phase 0 (Foundation) | สัปดาห์ 1-4 | SLO/SLI, observability, protocol baseline | Platform Lead + SRE | Dashboard/alerts/runbook พร้อมใช้งาน | Alert critical ต่อเนื่อง > 30 นาที |
| Phase 1 (Canary) | สัปดาห์ 5-8 | tenant กลุ่ม 5-10% | Voice Backend Lead | P95 latency ผ่านเกณฑ์ 7 วันต่อเนื่อง | call failure > 1% หรือ quality drop ชัดเจน |
| Phase 2 (Scale-out) | สัปดาห์ 9-12 | ขยาย 25-50% พร้อม benchmark gate | Engineering Manager | error budget burn อยู่ในเกณฑ์ | budget burn หรือ incident severity สูง |
| Phase 3 (General Availability) | สัปดาห์ 13-16 | 100% traffic + deprecate flow เดิม | Product + Ops | ผ่าน DoD ครบทุกข้อ | rollback playbook รันได้ < 10 นาที |

**Rollback หลัก:**
1. Freeze traffic expansion และปิด feature flag ใหม่
2. Route traffic กลับ legacy path
3. Replay queue ที่ค้าง + reconcile ธุรกรรม
4. Incident review ภายใน 24 ชั่วโมง พร้อม corrective actions

### 7) Architecture / Protocol Update Outline

- แยกชั้น **Voice Orchestrator**, **Knowledge Service**, **Commerce Adapter**, **Notification Service**
- กำหนด event schema กลาง: `call.started`, `intent.detected`, `order.created`, `call.ended`, `summary.sent`
- ใช้ API contract versioning (`v1`, `v2`) และ compatibility window 90 วัน
- บังคับ correlation ID end-to-end เพื่อ trace ข้าม service

### 8) Reliability & Ops Readiness Checklist

- [ ] SLO/SLI ประกาศใช้อย่างเป็นทางการและผูกกับ alerting
- [ ] Load test + soak test ผ่าน benchmark gate ตาม concurrency target
- [ ] Chaos tests สำหรับ dependency failure (vendor/API/queue)
- [ ] Dashboards ครอบคลุม: call success, latency, ASR/TTS errors, order conversion
- [ ] Runbooks พร้อมสำหรับ incident P1/P2/P3
- [ ] On-call rotation และ escalation path ชัดเจน
- [ ] Security checks: secrets rotation, IAM least privilege, dependency scan
- [ ] Compliance checks: PDPA data retention + consent + audit evidence

### 9) Definition of Done (Production)

งานถือว่า “Done” เมื่อผ่านทุกเกณฑ์ด้านล่าง:

1. **Tests**
   - unit/integration tests ผ่าน 100%
   - contract tests ครอบคลุม critical integration ≥ 90%
2. **SLO Gates**
   - availability ≥ 99.95%
   - P95 turn latency ≤ 1.8s
   - call failure rate ≤ 0.5%
3. **Benchmarking Gates**
   - รองรับ 100 concurrent calls ตามเกณฑ์ latency
   - cost-per-call ไม่เกิน budget threshold
4. **Observability**
   - metrics/logs/traces ครบทุก critical path
   - alert policy ทดสอบแล้วด้วย synthetic incidents
5. **Runbooks**
   - มี playbook สำหรับ failover/rollback/recovery ที่ทดสอบจริง
6. **Security Checks**
   - ผ่าน vulnerability scan (critical = 0)
   - PII redaction และ encryption controls ผ่าน audit checklist
