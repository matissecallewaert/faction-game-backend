import { Tile, UNITTYPE } from "../../prisma";
import { FastifyBaseLogger } from "fastify";
import { UnitContext } from "../../objects/Unit";
import { FactionContext } from "../../objects/FactionContext";
import { PostUnitMoveResponse } from "../../api/ApiUnitMove";
import { UNITMOVETYPE } from "../../constants/UnitMoveType";
import { Location } from "../../objects/Location";
import { Config } from "../../Config";

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
    tiles: Tile[],
    unitId: string
  ) {
    this.log.info("Executing unit move ...");

    const unit = units.find((unit) => unit.id === unitId);
    let executed;

    switch (unit?.type) {
      case UNITTYPE.PIONEER:
        executed = this.basicUnitMoves(unitMove, units, tiles, unit);
        if (executed) {
          break;
        }

        this.pioneerMove(unitMove, gameId, factions, units, tiles, unit);
        break;

      case UNITTYPE.WORKER:
        executed = this.basicUnitMoves(unitMove, units, tiles, unit);
        if (executed) {
          break;
        }

        this.workerMove(unitMove, gameId, factions, units, unitId, unit);
        break;

      case UNITTYPE.WARRIOR:
        executed = this.basicUnitMoves(unitMove, units, tiles, unit);
        if (executed) {
          break;
        }

        this.warriorMove(unitMove, gameId, factions, units, unitId, unit);
        break;

      case UNITTYPE.MINER:
        executed = this.basicUnitMoves(unitMove, units, tiles, unit);
        if (executed) {
          break;
        }

        this.minerMove(unitMove, gameId, factions, units, unitId, unit);
        break;
    }
  }

  private pioneerMove(
    unitMove: PostUnitMoveResponse,
    gameId: string,
    factions: FactionContext[],
    units: UnitContext[],
    tiles: Tile[],
    unit: UnitContext
  ) {
    switch (unitMove.unitMoveType) {
      case UNITMOVETYPE.CONQUER_NEUTRAL_TILE:
        break;

      case UNITMOVETYPE.NEUTRALIZE_ENEMY_TILE:
        break;

      case UNITMOVETYPE.GENERATE_GOLD:
        break;

      case UNITMOVETYPE.ATTACK:
        break;
    }
  }

  private workerMove(
    unitMove: PostUnitMoveResponse,
    gameId: string,
    factions: FactionContext[],
    units: UnitContext[],
    unitId: string,
    unit: UnitContext
  ) {
    switch (unitMove.unitMoveType) {
      case UNITMOVETYPE.CONQUER_NEUTRAL_TILE:
        break;

      case UNITMOVETYPE.FORTIFY:
        break;

      case UNITMOVETYPE.GENERATE_GOLD:
        break;
    }
  }

  private warriorMove(
    unitMove: PostUnitMoveResponse,
    gameId: string,
    factions: FactionContext[],
    units: UnitContext[],
    unitId: string,
    unit: UnitContext
  ) {
    switch (unitMove.unitMoveType) {
      case UNITMOVETYPE.CONQUER_NEUTRAL_TILE:
        break;

      case UNITMOVETYPE.NEUTRALIZE_ENEMY_TILE:
        break;

      case UNITMOVETYPE.PREPARE_DEFENSE:
        break;

      case UNITMOVETYPE.ATTACK:
        break;
    }
  }

  private minerMove(
    unitMove: PostUnitMoveResponse,
    gameId: string,
    factions: FactionContext[],
    units: UnitContext[],
    unitId: string,
    unit: UnitContext
  ) {
    switch (unitMove.unitMoveType) {
      case UNITMOVETYPE.DEPLOY_MINE:
        break;

      case UNITMOVETYPE.CLEAR_MINE:
        break;

      case UNITMOVETYPE.PREPARE_DEFENSE:
        break;

      case UNITMOVETYPE.ATTACK:
        break;
    }
  }

  private isOneStepAway(location1: Location, location2: Location): boolean {
    const dx = Math.abs(location1.x - location2.x);
    const dy = Math.abs(location1.y - location2.y);

    const maxWidth = Config.getWidth();
    const maxHeight = Config.getHeight();

    const isInBounds =
      location2.x >= 0 &&
      location2.x < maxWidth &&
      location2.y >= 0 &&
      location2.y < maxHeight;
    return (
      isInBounds &&
      ((dx === 1 && dy === 0) ||
        (dx === 0 && dy === 1) ||
        (dx === 1 && dy === 1))
    );
  }

  private otherUnitAtLocation(
    location: Location,
    units: UnitContext[]
  ): boolean {
    return units.some(
      (unit) => unit.location.x === location.x && unit.location.y === location.y
    );
  }

  private basicUnitMoves(
    unitMove: PostUnitMoveResponse,
    units: UnitContext[],
    tiles: Tile[],
    unitToUpdate: UnitContext
  ): boolean {
    switch (unitMove.unitMoveType) {
      case UNITMOVETYPE.TRAVEL:
        if (!unitMove.location) {
          throw new Error("No location provided for unit move TRAVEL...");
        }

        if (!this.isOneStepAway(unitToUpdate.location, unitMove.location))
          break;

        if (this.otherUnitAtLocation(unitMove.location, units)) break;

        tiles.find(
          (tile) =>
            tile.id ===
            unitToUpdate.location.y * Config.getWidth() +
              unitToUpdate.location.x
        )!.unit = null;
        units.find((unit) => unit.id === unitToUpdate.id)!.location =
          unitMove.location;
        tiles.find(
          (tile) =>
            tile.id ===
            unitToUpdate.location.y * Config.getWidth() +
              unitToUpdate.location.x
        )!.unit = unitToUpdate.id;

        return true;

      case UNITMOVETYPE.IDLE:
        return true;

      case UNITMOVETYPE.RETIRE:
        units.find((unit) => unit.id === unitToUpdate.id)!.health = 0;
        return true;

      default:
        return true;
    }
    return false;
  }
}
