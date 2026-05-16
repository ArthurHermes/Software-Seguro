const { parseUrl, readJsonBody, sendJson } = require("../utils/http");

function sendValidationError(res, errors) {
  sendJson(res, 400, {
    erro: "Dados invalidos.",
    detalhes: errors.map((error) => ({
      campo: error.campo,
      mensagem: error.mensagem
    }))
  });
}

async function validateRequest(req, res, schema, options = {}) {
  const source = options.source || "body";
  let payload;

  try {
    payload = source === "query" ? parseUrl(req).query : await readJsonBody(req);
  } catch (error) {
    sendValidationError(res, [{ campo: "_body", mensagem: "JSON malformado." }]);
    return false;
  }

  const validation = schema(payload);
  if (!validation.ok) {
    sendValidationError(res, validation.errors);
    return false;
  }

  if (source === "query") {
    req.validatedQuery = validation.data;
  } else {
    req.validatedBody = validation.data;
  }

  return true;
}

module.exports = { validateRequest };
