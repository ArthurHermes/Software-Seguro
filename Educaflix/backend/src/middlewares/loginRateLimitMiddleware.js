const { sendJson } = require("../utils/http");
const { getBlockedAttempt, logLoginAttempt } = require("../services/loginAttemptService");

const GENERIC_LOGIN_ERROR = "E-mail ou senha invalidos.";

function enforceLoginRateLimit(req, res, email, ip) {
  const blockedAttempt = getBlockedAttempt(email, ip);

  if (!blockedAttempt) return true;

  logLoginAttempt({
    email,
    ip,
    outcome: "blocked",
    reason: `blocked_by_${blockedAttempt.scope}`
  });
  sendJson(res, 429, { erro: GENERIC_LOGIN_ERROR });
  return false;
}

module.exports = {
  GENERIC_LOGIN_ERROR,
  enforceLoginRateLimit
};
