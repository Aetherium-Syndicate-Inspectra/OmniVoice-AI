import { env } from "../config/env.js";

const appointments = [];

export const appointmentService = {
  async create({ phone, preferredTime, reason, source = "voice-call" }) {
    const appointment = {
      id: `appt_${appointments.length + 1}`,
      phone,
      preferredTime: preferredTime || "โปรดติดต่อกลับเพื่อยืนยันเวลา",
      reason,
      source,
      timezone: env.appointmentTimezone,
      createdAt: new Date().toISOString(),
    };
    appointments.push(appointment);
    return appointment;
  },

  async list() {
    return appointments;
  },
};
