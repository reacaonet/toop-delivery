const router = require("express").Router();

// Health check básico para testar inicialização
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Toop Delivery API - Servidor iniciado com sucesso",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// Rota básica de teste
router.get("/", (req, res) => {
  res.json({
    message: "Toop Delivery API",
    status: "running",
    docs: "/api-docs"
  });
});

module.exports = router;
