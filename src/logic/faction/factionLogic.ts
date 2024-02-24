import { FastifyBaseLogger } from "fastify";
import { BASEMOVETYPE } from "../../constants/BaseMoveType";
import { unitCost, unitHealth, unitUpkeep } from "../../constants/constants";
import { PostBaseMoveResponse } from "../../api/ApiBaseMove";
import { UnitWithoutId } from "../../objects/Unit";
import { FactionContext } from "../../objects/FactionContext";
import { Config } from "../../Config";
import { Tile } from "../../prisma";

export class FactionLogic {
  private log: FastifyBaseLogger;
  private maxPopulation: number = 52;

  constructor(log: FastifyBaseLogger) {
    this.log = log;
  }

  async executeBaseMove(
    baseMove: PostBaseMoveResponse,
    gameId: string,
    factionContext: FactionContext,
    baseTile: Tile | undefined
  ): Promise<{ faction: FactionContext; unit?: UnitWithoutId }> {
    this.log.info("Executing base move ...");

    factionContext.gold -= factionContext.currentUpkeep;

    let unit: UnitWithoutId | undefined = undefined;

    switch (baseMove.baseMoveType) {
      case BASEMOVETYPE.IDLE:
        this.log.info("Executing base IDLE move ...");
        break;
      case BASEMOVETYPE.RECEIVE_INCOME:
        this.log.info("Executing base RECEIVE_INCOME move ...");
        factionContext.gold += 1000;
        break;
      case BASEMOVETYPE.START_BUILDING_UNIT:
        this.log.info("Executing base START_BUILDING_UNIT move ...");
        if (!baseMove.unitType) {
          throw new Error("Unit type is required for START_BUILDING_UNIT");
        }
        let cost = unitCost.get(baseMove.unitType) || 0;
        if(factionContext.gold < cost) {
          throw new Error("Not enough gold to build unit");
        }
        if(factionContext.population >= this.maxPopulation) {
          throw new Error("Population is at max capacity");
        }
        if(baseTile?.unit !== null) {
          throw new Error("Cannot build unit when an existing unit is standing on base tile");
        }

        factionContext.gold -= cost;
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
