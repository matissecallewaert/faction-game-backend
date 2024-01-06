import { Faction, PrismaClient, UNITTYPE } from "../../prisma";
import { FastifyBaseLogger } from "fastify";
import { BASEMOVETYPE } from "../../constants/BaseMoveType";
import { unitCost, unitHealth, unitUpkeep } from "../../constants/constants";
import { PostBaseMoveResponse } from "../../api/ApiBaseMove";
import { UnitContext, UnitWithoutId } from "../../objects/Unit";
import { UNITMOVETYPE } from "../../constants/UnitMoveType";
import { FactionContext } from "../../objects/FactionContext";
import { PostUnitMoveResponse } from "../../api/ApiUnitMove";

export class UnitLogic {
  private log: FastifyBaseLogger;

  constructor(log: FastifyBaseLogger) {
    this.log = log;
  }

  executeUnitMove(
    unitMove: PostUnitMoveResponse,
    gameId: string,
    factions: FactionContext[],
    units: UnitContext[],
    unitId: string
  ): { factions: FactionContext[]; units: UnitContext[] } {
    this.log.info("Executing unit move ...");
    const unit = units.find((unit) => unit.id === unitId);

    switch (unit?.type) {
      case UNITTYPE.PIONEER:
        this.pioneerMove(unitMove, gameId, factions, units, unitId);
        break;
      case UNITTYPE.WORKER:
        this.workerMove(unitMove, gameId, factions, units, unitId);
        break;
      case UNITTYPE.WARRIOR:
        this.warriorMove(unitMove, gameId, factions, units, unitId);
        break;
      case UNITTYPE.MINER:
        this.minerMove(unitMove, gameId, factions, units, unitId);
        break;
    }

    return { factions: factions, units: units };
  }

  pioneerMove(
    unitMove: PostUnitMoveResponse,
    gameId: string,
    factions: FactionContext[],
    units: UnitContext[],
    unitId: string
  ) {}

  workerMove(
    unitMove: PostUnitMoveResponse,
    gameId: string,
    factions: FactionContext[],
    units: UnitContext[],
    unitId: string
  ) {}

  warriorMove(
    unitMove: PostUnitMoveResponse,
    gameId: string,
    factions: FactionContext[],
    units: UnitContext[],
    unitId: string
  ) {}

  minerMove(
    unitMove: PostUnitMoveResponse,
    gameId: string,
    factions: FactionContext[],
    units: UnitContext[],
    unitId: string
  ) {}
}
