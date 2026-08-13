export function isValidEmail(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0 || value.length > 254) {
    return false;
  }
  if (value !== value.trim()) return false;

  const at = value.indexOf("@");
  if (at <= 0 || at !== value.lastIndexOf("@") || at > 64) return false;

  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  if (!domain || domain.length > 253 || local.startsWith(".") || local.endsWith(".")) {
    return false;
  }
  if (local.includes("..") || domain.includes("..")) return false;

  for (const char of value) {
    const code = char.charCodeAt(0);
    if (code <= 32 || code === 127) return false;
  }

  const labels = domain.split(".");
  if (labels.length < 2) return false;
  return labels.every((label) => {
    if (!label || label.length > 63 || label.startsWith("-") || label.endsWith("-")) {
      return false;
    }
    for (const char of label) {
      const code = char.toLowerCase().charCodeAt(0);
      const letter = code >= 97 && code <= 122;
      const digit = code >= 48 && code <= 57;
      if (!letter && !digit && char !== "-") return false;
    }
    return true;
  });
}
