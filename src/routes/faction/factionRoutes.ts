import { FastifyInstance } from "fastify";

export async function factionRoutes(server: FastifyInstance) {
  const { prisma } = server;

  server.get<{ Params: { gameId: string; id: number } }>(
    "/:gameId/:id",
    {
      schema: {
        response: 200,
        params: {
          gameId: {
            type: "string",
          },
          id: {
            type: "number",
          },
        },
      },
    },
    async (request, reply) => {
      const { id, gameId } = request.params;

      const faction = await prisma.faction.findUnique({
        where: {
          id_gameId: {
            id: id,
            gameId: gameId,
          },
        },
      });
      if (!faction) {
        return reply.status(404).send({
          error: `Faction with id: ${id} and gameId: ${gameId} not found...`,
        });
      }

      return reply.status(200).send({ data: faction });
    }
  );

  server.get<{ Params: { gameId: string } }>(
    "/:gameId",
    {
      schema: {
        response: 200,
        params: {
          gameId: {
            type: "string",
          },
        },
      },
    },
    async (request, reply) => {
      const { gameId } = request.params;

      const game = await prisma.game.findUnique({
        where: {
          id: gameId,
        },
      });
      if (!game) {
        return reply
          .status(404)
          .send({ Error: `Game with id: ${gameId} not found...` });
      }

      const factions = await prisma.faction.findMany({
        where: {
          gameId: gameId,
        },
      });
      if (factions.length === 0) {
        return reply
          .status(404)
          .send({ Error: `No factions found for game with id: ${gameId}...` });
      }

      return reply.status(200).send({ data: factions });
    }
  );
}
