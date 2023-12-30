import fastify, { FastifyServerOptions } from "fastify";
import prismaPlugin from "./plugins/prisma";
import fastifyCors from "@fastify/cors";
import fastifyAxios from "@guilhermegimenez/fastifyaxios";
import { factionRoutes } from "./routes/faction/factionRoutes";
import { GameLogic } from "./logic/game/gameLogic";
import { gameRoutes } from "./routes/game/gameRoutes";
import { tileRoutes } from "./routes/tile/tileRoutes";
import { unitRoutes } from "./routes/unit/unitRoutes";

export async function buildFastifyServer(opts: FastifyServerOptions = {}) {
  const server = fastify(opts);

  server.register(prismaPlugin);
  server.register(fastifyAxios);
  server.register(fastifyCors, {
    methods: ["GET", "POST", "PUT", "DELETE"],
    origin: "*",
  });

  server.addHook("preHandler", function (req, reply, done) {
    if (req.body) {
      req.log.info({ body: req.body }, "parsed body");
    }
    done();
  });

  server.register(factionRoutes, { prefix: "/api/faction" });
  server.register(gameRoutes, { prefix: "/api/game" });
  server.register(tileRoutes, { prefix: "/api/tile" });
  server.register(unitRoutes, { prefix: "/api/unit" });

  return server;
}

buildFastifyServer({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "yyyy-mm-dd HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
}).then((server) => {
  server.listen(
    { port: parseInt(process.env.PORT || "8080"), host: "0.0.0.0" },
    (err) => {
      if (err) {
        server.log.error(err);
        process.exit(1);
      }
    }
  );
  const game = new GameLogic(server.prisma, server.log);
});
