import crypto from "node:crypto";
import { logger } from "./logger.js";

export function buildAbsoluteUrl(req) {
  const host = req.get("host");
  const protocol = req.get("x-forwarded-proto") || req.protocol || "http";
  return `${protocol}://${host}${req.originalUrl}`;
}

export function validateTwilioRequest({ authToken, url, params, expectedSignature }) {
  if (!authToken || !expectedSignature) return false;

  const entries = Object.entries(params || {}).sort(([a], [b]) => a.localeCompare(b));
  let data = url;
  for (const [key, value] of entries) {
    data += `${key}${value}`;
  }

  const digest = crypto.createHmac("sha1", authToken).update(Buffer.from(data, "utf8")).digest("base64");
  const left = Buffer.from(digest);
  const right = Buffer.from(expectedSignature);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export async function validateTwilioRequestBestEffort(req, authToken) {
  const signature = req.get("x-twilio-signature");
  const url = buildAbsoluteUrl(req);
  return validateTwilioRequest({
    authToken,
    url,
    params: req.body || {},
    expectedSignature: signature || "",
  });
}

export function verifyTelnyxWebhook({ publicKey, timestamp, payload, signature }) {
  if (!publicKey || !timestamp || !payload || !signature) return false;
  try {
    const verifyPayload = Buffer.from(`${timestamp}|${payload}`, "utf8");
    const signatureBuffer = Buffer.from(signature, "base64");
    const publicKeyObject = crypto.createPublicKey({
      key: Buffer.from(publicKey, "base64"),
      format: "der",
      type: "spki",
    });
    return crypto.verify(null, verifyPayload, publicKeyObject, signatureBuffer);
  } catch (error) {
    logger.warn("Telnyx signature verification failed", { error: error.message });
    return false;
  }
}
