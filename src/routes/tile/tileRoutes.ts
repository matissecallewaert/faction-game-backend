import { FastifyInstance } from "fastify";

export async function tileRoutes(server: FastifyInstance) {
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
      const { gameId, id } = request.params;

      const tile = await prisma.tile.findUnique({
        where: {
          id_gameId: {
            gameId: gameId,
            id: id,
          },
        },
      });
      if (!tile) {
        return reply.status(404).send({
          error: `Tile with gameId: ${gameId} and id: ${id} not found...`,
        });
      }

      return reply.status(200).send({ data: tile });
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

      const tiles = await prisma.tile.findMany({
        where: {
          gameId: gameId,
        },
      });
      if (tiles.length === 0) {
        return reply.status(404).send({
          error: `Tiles with gameId: ${gameId} not found...`,
        });
      }

      return reply.status(200).send({ data: tiles });
    }
  );
}
