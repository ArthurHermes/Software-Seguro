const http = require("http");
const { routeRequest } = require("./routes");
const { applyCors, applySecurityHeaders } = require("./middlewares/securityHeaders");
const { sendJson } = require("./utils/http");

function createServer() {
  return http.createServer(async (req, res) => {
    try {
      applyCors(req, res);
      applySecurityHeaders(res);

      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }

      await routeRequest(req, res);
    } catch (error) {
      console.error("Erro inesperado:", error.message);
      sendJson(res, 500, { erro: "Erro interno. Tente novamente mais tarde." });
    }
  });
}

module.exports = { createServer };
