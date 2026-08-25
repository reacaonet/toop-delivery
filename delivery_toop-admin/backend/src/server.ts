import mongoose from "mongoose";
import http from "http";
import app from "./app";
import { env } from "./config";
import { initSocket } from "./socket";

const PORT = env.PORT || 3000;

async function startServer() {
  try {
    await mongoose.connect(env.URL_MONGO);
    console.log("Conectado ao MongoDB");

    const httpServer = http.createServer(app);
    initSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Socket.io inicializado`);
    });

    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} recebido. Encerrando graciosamente...`);
      httpServer.close(async () => {
        await mongoose.disconnect();
        console.log("Conexão com MongoDB fechada");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("Erro ao iniciar servidor:", error);
    process.exit(1);
  }
}

startServer();
