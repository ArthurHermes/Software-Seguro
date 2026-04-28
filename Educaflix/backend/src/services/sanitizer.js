function sanitizeText(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .trim();
}

function sanitizeSearch(value) {
  return sanitizeText(value).slice(0, 80);
}

module.exports = { sanitizeSearch, sanitizeText };
