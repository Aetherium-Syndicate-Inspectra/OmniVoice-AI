import express from "express";
import { VoiceCallPipeline } from "../pipeline/voiceCallPipeline.js";
import { logger } from "../utils/logger.js";

const router = express.Router();
const pipeline = new VoiceCallPipeline();

router.post("/run-turn", async (req, res) => {
  try {
    const { transcript, audioBase64, mimeType, callContext = {}, transcriptionPrompt = "" } = req.body || {};

    if (!transcript && !audioBase64) {
      return res.status(400).json({ error: "Either transcript or audioBase64 is required." });
    }

    const result = transcript
      ? await pipeline.runTextTurn({ transcript, callContext })
      : await pipeline.runAudioTurn({ audioBase64, mimeType, callContext, transcriptionPrompt });

    return res.json(result);
  } catch (error) {
    logger.error("Pipeline route failed", { error: error.message });
    return res.status(500).json({ error: error.message });
  }
});

router.post("/transcribe", async (req, res) => {
  try {
    const { audioBase64, mimeType, prompt = "" } = req.body || {};
    if (!audioBase64) return res.status(400).json({ error: "audioBase64 is required." });

    const transcript = await pipeline.sttProvider.transcribeBase64Audio({ audioBase64, mimeType, prompt });
    return res.json({ transcript });
  } catch (error) {
    logger.error("Transcribe route failed", { error: error.message });
    return res.status(500).json({ error: error.message });
  }
});

router.post("/reply", async (req, res) => {
  try {
    const { transcript = "", callContext = {} } = req.body || {};
    if (!transcript) return res.status(400).json({ error: "transcript is required." });

    const result = await pipeline.runTextTurn({ transcript, callContext });
    return res.json(result);
  } catch (error) {
    logger.error("Reply route failed", { error: error.message });
    return res.status(500).json({ error: error.message });
  }
});

router.post("/synthesize", async (req, res) => {
  try {
    const { text = "" } = req.body || {};
    if (!text) return res.status(400).json({ error: "text is required." });

    const audio = await pipeline.ttsProvider.synthesizeToPublicFile({ text, filePrefix: "manual" });
    return res.json(audio);
  } catch (error) {
    logger.error("Synthesize route failed", { error: error.message });
    return res.status(500).json({ error: error.message });
  }
});

export default router;
