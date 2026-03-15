const callSessions = new Map();

export function upsertCallSession(callId, patch = {}) {
  const current = callSessions.get(callId) || { callId, turns: [] };
  const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
  callSessions.set(callId, updated);
  return updated;
}

export function appendTurn(callId, turn) {
  const current = callSessions.get(callId) || { callId, turns: [] };
  current.turns = [...(current.turns || []), { ...turn, at: new Date().toISOString() }];
  current.updatedAt = new Date().toISOString();
  callSessions.set(callId, current);
  return current;
}

export function getCallSession(callId) {
  return callSessions.get(callId) || null;
}
