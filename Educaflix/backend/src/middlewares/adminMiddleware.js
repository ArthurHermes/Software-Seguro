const { authenticate, sendAccessDenied } = require("./authMiddleware");

function requireAdmin(req, res) {
  const user = req.user || authenticate(req, res);
  if (!user) return null;

  if (user.role !== "admin") {
    sendAccessDenied(res);
    return null;
  }

  return user;
}

module.exports = { requireAdmin };
