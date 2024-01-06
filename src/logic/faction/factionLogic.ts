import { FastifyBaseLogger } from "fastify";
import { BASEMOVETYPE } from "../../constants/BaseMoveType";
import { unitCost, unitHealth, unitUpkeep } from "../../constants/constants";
import { PostBaseMoveResponse } from "../../api/ApiBaseMove";
import { UnitWithoutId } from "../../objects/Unit";
import { FactionContext } from "../../objects/FactionContext";
import { Config } from "../../Config";

export class FactionLogic {
  private log: FastifyBaseLogger;

  constructor(log: FastifyBaseLogger) {
    this.log = log;
  }

  async executeBaseMove(
    baseMove: PostBaseMoveResponse,
    gameId: string,
    factionContext: FactionContext
  ): Promise<{ faction: FactionContext; unit?: UnitWithoutId }> {
    this.log.info("Executing base move ...");

    factionContext.gold -= factionContext.currentUpkeep;

    let unit: UnitWithoutId | undefined = undefined;

    switch (baseMove.baseMoveType) {
      case BASEMOVETYPE.IDLE:
        break;
      case BASEMOVETYPE.RECEIVE_INCOME:
        factionContext.gold += 1000;
        break;
      case BASEMOVETYPE.START_BUILDING_UNIT:
        if (!baseMove.unitType) {
          throw new Error("Unit type is required for START_BUILDING_UNIT");
        }
        factionContext.gold -= unitCost.get(baseMove.unitType) || 0;
        factionContext.currentUpkeep += unitUpkeep.get(baseMove.unitType) || 0;
        factionContext.population += 1;

        unit = {
          type: baseMove.unitType,
          health: unitHealth.get(baseMove.unitType) || 3,
          index:
            factionContext.base_location.y * Config.getWidth() +
            factionContext.base_location.x,
          factionId: factionContext.id,
          gameId: gameId,
        };

        break;
    }

    return { faction: factionContext, unit: unit };
  }
}
