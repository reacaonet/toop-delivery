require("dotenv").config({ path: "./src/config/.env" });

const app = require("express")();
const https = require("https");
const fs = require("fs");
const bodyParser = require("body-parser");
const compression = require("compression");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const cronCompanyHours = require("./cron/companyHours");
const cronSetDriversOffline = require("./cron/driverAutoOffline");
const cronOrderCancel = require("./cron/cancelOrder");
const cronAccountBalance = require("./cron/accountBalance");

const port = process.env.PORT || 3000;
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

app.use(compression());
app.use(helmet());

process.env.production == "false" && app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ limit: "15mb", extended: false }));
app.use(bodyParser.json({ limit: "15mb" }));

const corsConfig = {
  origin: "*",
  methods: "POST, GET, PUT, DELETE, OPTIONS, PATCH",
};

app.use(cors(corsConfig));
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

// Routes
app.use("/", require("./routes"));

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
  https.createServer();
  app.listen(port, () => {
    console.log("Servidor Iniciado Porta ", port);
  });
}

require("./database/Connection");
cronCompanyHours();
// cronOrderCancel();
//cronAccountBalance();
cronSetDriversOffline();