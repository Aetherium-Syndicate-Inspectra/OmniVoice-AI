function escapeXml(input = "") {
  return String(input)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function twimlResponse(innerXml) {
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${innerXml}</Response>`;
}

export function say(text, attrs = {}) {
  const attributes = Object.entries(attrs)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => ` ${key}="${escapeXml(value)}"`)
    .join("");
  return `<Say${attributes}>${escapeXml(text)}</Say>`;
}

export function play(url) {
  return `<Play>${escapeXml(url)}</Play>`;
}

export function gather({
  action,
  input = "speech dtmf",
  timeout = 4,
  hints = "",
  method = "POST",
  speechTimeout = "auto",
  prompt = "",
}) {
  const hintsAttr = hints ? ` hints="${escapeXml(hints)}"` : "";
  return `<Gather input="${escapeXml(input)}" action="${escapeXml(action)}" method="${escapeXml(method)}" timeout="${escapeXml(timeout)}" speechTimeout="${escapeXml(speechTimeout)}"${hintsAttr}>${prompt}</Gather>`;
}

export function redirect(url, method = "POST") {
  return `<Redirect method="${escapeXml(method)}">${escapeXml(url)}</Redirect>`;
}

export function hangup() {
  return "<Hangup/>";
}
