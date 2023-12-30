import { FastifyInstance } from "fastify";

export async function unitRoutes(server: FastifyInstance) {
  const { prisma } = server;

  server.get<{ Params: { gameId: string; factionId: number; id: string } }>(
    "/:gameId/:factionId/:id",
    {
      schema: {
        response: 200,
        params: {
          gameId: {
            type: "string",
          },
          factionId: {
            type: "number",
          },
          id: {
            type: "string",
          },
        },
      },
    },
    async (request, reply) => {
      const { gameId, factionId, id } = request.params;

      const unit = await prisma.unit.findUnique({
        where: {
          id: id,
          gameId: gameId,
          factionId: factionId,
        },
      });
      if (!unit) {
        return reply.status(404).send({
          error: `Unit with gameId: ${gameId}, factionId: ${factionId} and id: ${id} not found...`,
        });
      }

      return reply.status(200).send({ data: unit });
    }
  );

  server.get<{ Params: { gameId: string; factionId: number } }>(
    "/:gameId/:factionId",
    {
      schema: {
        response: 200,
        params: {
          gameId: {
            type: "string",
          },
          factionId: {
            type: "number",
          },
        },
      },
    },
    async (request, reply) => {
      const { gameId, factionId } = request.params;

      const units = await prisma.unit.findMany({
        where: {
          gameId: gameId,
          factionId: factionId,
        },
      });
      if (units.length === 0) {
        return reply.status(404).send({
          error: `Units with gameId: ${gameId} and factionId: ${factionId} not found...`,
        });
      }

      return reply.status(200).send({ data: units });
    }
  );
}
