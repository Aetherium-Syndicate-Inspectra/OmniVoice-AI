const leads = [];

export const leadService = {
  async create({ phone, customerNeed, source = "voice-call" }) {
    const lead = {
      id: `lead_${leads.length + 1}`,
      phone,
      customerNeed,
      source,
      createdAt: new Date().toISOString(),
    };
    leads.push(lead);
    return lead;
  },

  async list() {
    return leads;
  },
};
