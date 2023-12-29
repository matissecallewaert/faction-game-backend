"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildFastifyServer = void 0;
const fastify_1 = __importDefault(require("fastify"));
const prisma_1 = __importDefault(require("./plugins/prisma"));
const cors_1 = __importDefault(require("@fastify/cors"));
const fastifyaxios_1 = __importDefault(require("@guilhermegimenez/fastifyaxios"));
async function buildFastifyServer(opts = {}) {
    const server = (0, fastify_1.default)(opts);
    server.register(prisma_1.default);
    server.register(fastifyaxios_1.default);
    server.register(cors_1.default, {
        methods: ["GET", "POST", "PUT", "DELETE"],
        origin: "*",
    });
    server.addHook("preHandler", function (req, reply, done) {
        if (req.body) {
            req.log.info({ body: req.body }, "parsed body");
        }
        done();
    });
    return server;
}
exports.buildFastifyServer = buildFastifyServer;
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
    server.listen({ port: parseInt(process.env.PORT || "8080"), host: "0.0.0.0" }, (err) => {
        if (err) {
            server.log.error(err);
            process.exit(1);
        }
    });
});
