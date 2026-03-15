import { env } from "../config/env.js";

const handoffs = [];

export const handoffService = {
  async request({ callId, phone, reason, summary }) {
    const record = {
      id: `handoff_${handoffs.length + 1}`,
      callId,
      phone,
      reason,
      summary,
      routedTo: env.salesHandoffEmail,
      createdAt: new Date().toISOString(),
    };
    handoffs.push(record);
    return record;
  },

  async list() {
    return handoffs;
  },
};
