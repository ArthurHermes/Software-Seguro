const { sendJson } = require("../utils/http");
const authController = require("../controllers/authController");
const videoController = require("../controllers/videoController");
const reviewController = require("../controllers/reviewController");
const adminController = require("../controllers/adminController");
const { authenticate, requireCsrf } = require("../middlewares/authMiddleware");
const { requireAdmin } = require("../middlewares/adminMiddleware");
const { validateRequest } = require("../middlewares/validateRequest");
const {
  validateCadastro,
  validateLogin,
  validateReview,
  validateUserStatus,
  validateVideo,
  validateVideoQuery
} = require("../validators/schemas");

async function routeRequest(req, res) {
  const url = new URL(req.url, "http://localhost");
  const path = url.pathname;

  if (req.method === "GET" && path === "/api/health") {
    return sendJson(res, 200, { status: "ok" });
  }

  if (req.method === "POST" && path === "/api/cadastro") {
    if (!(await validateRequest(req, res, validateCadastro))) return;
    return authController.cadastro(req, res);
  }

  if (req.method === "POST" && path === "/api/login") {
    if (!(await validateRequest(req, res, validateLogin))) return;
    return authController.login(req, res);
  }

  if (path === "/api/me") {
    if (!authenticate(req, res)) return;
    if (req.method === "GET") return authController.me(req, res);
  }

  if (path === "/api/logout") {
    if (!authenticate(req, res)) return;
    if (!requireCsrf(req, res)) return;
    if (req.method === "POST") return authController.logout(req, res);
  }

  if (req.method === "GET" && path === "/api/videos") {
    if (!(await validateRequest(req, res, validateVideoQuery, { source: "query" }))) return;
    return videoController.list(req, res);
  }
  if (req.method === "GET" && path === "/api/videos/options") return videoController.options(req, res);

  const videoDetailMatch = path.match(/^\/api\/videos\/([^/]+)$/);
  if (videoDetailMatch) {
    const id = decodeURIComponent(videoDetailMatch[1]);
    if (req.method === "GET") return videoController.detail(req, res, id);
    if (!requireAdmin(req, res)) return;
    if (!requireCsrf(req, res)) return;
    if (req.method === "PUT") {
      if (!(await validateRequest(req, res, validateVideo))) return;
      return videoController.update(req, res, id);
    }
    if (req.method === "DELETE") return videoController.remove(req, res, id);
  }

  if (req.method === "POST" && path === "/api/videos") {
    if (!requireAdmin(req, res)) return;
    if (!requireCsrf(req, res)) return;
    if (!(await validateRequest(req, res, validateVideo))) return;
    return videoController.create(req, res);
  }

  const videoReviewMatch = path.match(/^\/api\/videos\/([^/]+)\/avaliacoes$/);
  if (req.method === "POST" && videoReviewMatch) {
    if (!authenticate(req, res)) return;
    if (!requireCsrf(req, res)) return;
    if (!(await validateRequest(req, res, validateReview))) return;
    return reviewController.create(req, res, decodeURIComponent(videoReviewMatch[1]));
  }

  const reviewMatch = path.match(/^\/api\/avaliacoes\/([^/]+)$/);
  if (reviewMatch) {
    if (!authenticate(req, res)) return;
    if (!requireCsrf(req, res)) return;
    const id = decodeURIComponent(reviewMatch[1]);
    if (req.method === "PUT") {
      if (!(await validateRequest(req, res, validateReview))) return;
      return reviewController.update(req, res, id);
    }
    if (req.method === "DELETE") return reviewController.remove(req, res, id);
  }

  if (path === "/api/admin/usuarios") {
    if (!requireAdmin(req, res)) return;
    if (req.method === "GET") return adminController.listUsers(req, res);
  }

  const userStatusMatch = path.match(/^\/api\/admin\/usuarios\/([^/]+)\/status$/);
  if (userStatusMatch) {
    if (!requireAdmin(req, res)) return;
    if (!requireCsrf(req, res)) return;
    if (req.method === "PATCH") {
      if (!(await validateRequest(req, res, validateUserStatus))) return;
      return adminController.changeUserStatus(req, res, decodeURIComponent(userStatusMatch[1]));
    }
  }

  sendJson(res, 404, { erro: "Rota nao encontrada." });
}

module.exports = { routeRequest };
