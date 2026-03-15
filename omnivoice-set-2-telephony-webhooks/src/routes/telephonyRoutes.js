import express from "express";
import twilioRouter from "../telephony/providers/twilioWebhookHandler.js";
import telnyxRouter from "../telephony/providers/telnyxWebhookHandler.js";
import sipRouter from "../telephony/providers/sipWebhookHandler.js";

const router = express.Router();

router.use("/twilio", twilioRouter);
router.use("/telnyx", telnyxRouter);
router.use("/sip", sipRouter);

export default router;
