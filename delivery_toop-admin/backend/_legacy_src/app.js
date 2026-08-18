require("dotenv").config({ path: "./src/config/.env" });

const express = require("express");
const app = express();
const https = require("https");
const fs = require("fs");
const compression = require("compression");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
// require("./cron/companyHours");
// require("./cron/driverAutoOffline");
// require("./cron/cancelOrder");
// require("./cron/accountBalance");

const port = process.env.PORT || 3000;

// CORS configurado antes de tudo
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:4201', 'http://localhost:4202'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(compression());
// app.use(helmet()); // Temporariamente desabilitado para CORS

process.env.production == "false" && app.use(morgan("dev"));

// Configurar parser com suporte a UTF-8
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.3",
    info: {
      title: process.env.DOC_TITLE,
      description: process.env.DOC_DESCRIPTION,
      version: process.env.DOC_VERSION,
    },
    servers: [
      {
        url: process.env.DOC_HOST,
        description: "API URL",
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/routes/*/*.js"],
};
const swaggerUiOptions = {
  customCss: ".swagger-ui .topbar { display: none } .swagger-ui .info { margin:20px 0 50px }",
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerUiOptions));

app.use(function (req, res, next) {
  var err = null;
  try {
    decodeURIComponent(req.path);
  } catch (e) {
    err = e;
  }
  if (err) {
    console.log(err, req.url);
    return res.redirect(["https://", req.get("Host"), "/404"].join(""));
  }
  next();
});

// Routes - versão essencial com autenticação
app.use("/", require("./routes/essential"));

if (process.env.production === "true") {
  console.log("Servidor Iniciado Porta ", port);
  https
    .createServer(
      {
        key: fs.readFileSync("src/config/privkey.pem").toString(),
        cert: fs.readFileSync("src/config/fullchain.pem").toString(),
        //passphrase: 'YOUR PASSPHRASE HERE'
      },
      app,
    )
    .listen(port);
} else {
  app.listen(port, () => {
    console.log("Servidor Iniciado Porta ", port);
  });
}

require("./database/Connection");
// cronCompanyHours();
// cronOrderCancel();
// cronAccountBalance();
// cronSetDriversOffline();