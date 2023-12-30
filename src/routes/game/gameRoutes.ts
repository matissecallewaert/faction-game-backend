import { FastifyInstance } from "fastify";

export async function gameRoutes(server: FastifyInstance) {
  const { prisma } = server;

  server.get<{ Params: { id: string } }>(
    "/:id",
    {
      schema: {
        response: 200,
        params: {
          id: {
            type: "string",
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const game = await prisma.game.findUnique({
        where: {
          id: id,
        },
      });
      if (!game) {
        return reply.status(404).send({
          error: `Game with id: ${id} not found...`,
        });
      }

      return reply.status(200).send({ data: game });
    }
  );

  server.get(
    "/currentGame",
    {
      schema: {
        response: 200,
      },
    },
    async (_, reply) => {
      const currentGame = await prisma.currentGame.findUnique({
        where: {
          id: 1,
        },
      });
      if (!currentGame) {
        return reply.status(404).send({
          error: `A current game could not be found...`,
        });
      }

      return reply.status(200).send({ data: currentGame });
    }
  );

  server.get(
    "/",
    {
      schema: {
        response: 200,
      },
    },
    async (_, reply) => {
      const games = await prisma.game.findMany();
      if (games.length === 0) {
        return reply.status(404).send({
          error: `No games found...`,
        });
      }

      return reply.status(200).send({ data: games });
    }
  );
}
