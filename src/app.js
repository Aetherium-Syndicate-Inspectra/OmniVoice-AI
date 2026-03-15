import express from "express";
import path from "node:path";
import { env, projectRoot } from "./config/env.js";
import pipelineRoutes from "./routes/pipelineRoutes.js";
import telephonyRoutes from "./routes/telephonyRoutes.js";
import { logger } from "./utils/logger.js";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use("/audio", express.static(path.join(projectRoot, "public", "audio")));

app.get("/", (_req, res) => {
  res.json({
    name: "OmniVoice AI",
    status: "ok",
    endpoints: {
      health: "/health",
      pipeline: "/api/pipeline/run-turn",
      twilio: "/api/webhooks/twilio/voice",
      telnyx: "/api/webhooks/telnyx/voice",
      sipBridge: "/api/webhooks/sip/events",
    },
  });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "OmniVoice AI",
    time: new Date().toISOString(),
  });
});

app.use("/api/pipeline", pipelineRoutes);
app.use("/api/webhooks", telephonyRoutes);

app.use((error, _req, res, _next) => {
  logger.error("Unhandled app error", { error: error.message });
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(env.port, () => {
  logger.info("OmniVoice AI server started", {
    port: env.port,
    appBaseUrl: env.appBaseUrl,
  });
});
