import { Faction, PrismaClient, UNITTYPE, Unit } from "../../prisma";
import { FastifyBaseLogger } from "fastify";
import { BASEMOVETYPE } from "../../constants/BaseMoveType";
import { unitCost, unitHealth, unitUpkeep } from "../../constants/constants";
import { PostBaseMoveResponse } from "../../api/ApiBaseMove";
import { UnitWithoutId } from "../../objects/Unit";

export class FactionLogic {
  private prisma: PrismaClient;
  private log: FastifyBaseLogger;

  constructor(prisma: PrismaClient, log: FastifyBaseLogger) {
    this.prisma = prisma;
    this.log = log;
  }

  async executeBaseMove(
    baseMove: PostBaseMoveResponse,
    gameId: string,
    factionId: number
  ): Promise<{ faction: Faction; unit?: UnitWithoutId }> {
    this.log.info("Executing base move ...");

    const faction = await this.prisma.faction.findUnique({
      where: {
        id_gameId: {
          id: factionId,
          gameId: gameId,
        },
      },
    });
    if (!faction) {
      throw new Error(
        `Faction with id: ${factionId} and gameId: ${gameId} not found...`
      );
    }

    faction.gold -= faction.currentUpkeep;

    let unit: UnitWithoutId | undefined = undefined;

    switch (baseMove.baseMoveType) {
      case BASEMOVETYPE.IDLE:
        break;
      case BASEMOVETYPE.RECEIVE_INCOME:
        faction.gold += 1000;
        break;
      case BASEMOVETYPE.START_BUILDING_UNIT:
        if (!baseMove.unitType) {
          throw new Error("Unit type is required for START_BUILDING_UNIT");
        }
        faction.gold -= unitCost.get(baseMove.unitType) || 0;
        faction.currentUpkeep += unitUpkeep.get(baseMove.unitType) || 0;
        faction.population += 1;

        unit = {
          type: baseMove.unitType,
          health: unitHealth.get(baseMove.unitType) || 3,
          index: faction.baseIndex,
          factionId: factionId,
          gameId: gameId,
        };

        break;
    }

    return { faction: faction, unit: unit };
  }
}
