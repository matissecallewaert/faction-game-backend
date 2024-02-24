import { RESOURCETYPE, Tile, UNITTYPE } from "../../prisma";
import { FastifyBaseLogger } from "fastify";
import { UnitContext } from "../../objects/Unit";
import { FactionContext } from "../../objects/FactionContext";
import { PostUnitMoveResponse } from "../../api/ApiUnitMove";
import { UNITMOVETYPE } from "../../constants/UnitMoveType";
import { Location } from "../../objects/Location";
import { Config } from "../../Config";
import { unitDamage } from "../../constants/constants";

export class UnitLogic {
  private log: FastifyBaseLogger;

  constructor(log: FastifyBaseLogger) {
    this.log = log;
  }

  executeUnitMove(
    unitMove: PostUnitMoveResponse,
    factions: FactionContext[],
    units: UnitContext[],
    tiles: Tile[],
    tilesToUpdateIds: number[],
    unitId: string
  ) {
    this.log.info("Executing unit move ...");

    const unit = units.find((unit) => unit.id === unitId);
    let executed = false;

    if (unit?.health === 0) {
      return;
    }

    switch (unit?.type) {
      case UNITTYPE.PIONEER:
        this.log.info("Executing Pioneer move ...");
        executed = this.basicUnitMoves(
          unitMove,
          units,
          tiles,
          factions,
          tilesToUpdateIds,
          unit
        );
        if (executed) {
          break;
        }

        this.pioneerMove(
          unitMove,
          factions,
          units,
          tiles,
          tilesToUpdateIds,
          unit
        );
        break;

      case UNITTYPE.WORKER:
        this.log.info("Executing Worker move ...");
        executed = this.basicUnitMoves(
          unitMove,
          units,
          tiles,
          factions,
          tilesToUpdateIds,
          unit
        );
        if (executed) {
          break;
        }

        this.workerMove(unitMove, factions, tiles, tilesToUpdateIds, unit);
        break;

      case UNITTYPE.WARRIOR:
        this.log.info("Executing Warrior move ...");
        executed = this.basicUnitMoves(
          unitMove,
          units,
          tiles,
          factions,
          tilesToUpdateIds,
          unit
        );
        if (executed) {
          break;
        }

        this.warriorMove(
          unitMove,
          factions,
          units,
          tiles,
          tilesToUpdateIds,
          unit
        );
        break;

      case UNITTYPE.MINER:
        this.log.info("Executing Miner move ...");
        executed = this.basicUnitMoves(
          unitMove,
          units,
          tiles,
          factions,
          tilesToUpdateIds,
          unit
        );
        if (executed) {
          break;
        }

        this.minerMove(
          unitMove,
          factions,
          units,
          tiles,
          tilesToUpdateIds,
          unit
        );
        break;
    }
  }

  private pioneerMove(
    unitMove: PostUnitMoveResponse,
    factions: FactionContext[],
    units: UnitContext[],
    tiles: Tile[],
    tilesToUpdateIds: number[],
    unit: UnitContext
  ) {
    switch (unitMove.unitMoveType) {
      case UNITMOVETYPE.CONQUER_NEUTRAL_TILE:
        this.conquerNeutralTile(unit, tiles, factions, tilesToUpdateIds);
        break;

      case UNITMOVETYPE.NEUTRALIZE_ENEMY_TILE:
        this.conquerEnemyTile(unit, tiles, factions, tilesToUpdateIds);
        break;

      case UNITMOVETYPE.GENERATE_GOLD:
        factions.find((faction) => faction.id === unit.factionId)!.gold += 200;
        break;

      case UNITMOVETYPE.ATTACK:
        this.attack(unit, tiles, units, factions, tilesToUpdateIds);
        break;
    }
  }

  private workerMove(
    unitMove: PostUnitMoveResponse,
    factions: FactionContext[],
    tiles: Tile[],
    tilesToUpdateIds: number[],
    unit: UnitContext
  ) {
    switch (unitMove.unitMoveType) {
      case UNITMOVETYPE.CONQUER_NEUTRAL_TILE:
        this.conquerNeutralTile(unit, tiles, factions, tilesToUpdateIds);
        break;

      case UNITMOVETYPE.FORTIFY:
        const tile = tiles.find(
          (tile) =>
            tile.id === unit.location.y * Config.getWidth() + unit.location.x
        );

        if (!tile) {
          throw new Error("Tile not found");
        }

        if (tile.factionId !== unit.factionId) {
          throw new Error("Tile is not owned by the unit's faction");
        }

        if (tile.resourceType === RESOURCETYPE.BASE) {
          throw new Error("Cannot fortify a base tile");
        }

        tile.fortified = true;
        tilesToUpdateIds.push(tile.id);

        break;

      case UNITMOVETYPE.GENERATE_GOLD:
        let gold = 200;
        const tileOfWorker = tiles.find(
          (tile) =>
            tile.id === unit.location.y * Config.getWidth() + unit.location.x
        );

        if (!tileOfWorker) {
          throw new Error("Tile not found");
        }

        if (
          tileOfWorker.factionId === unit.factionId &&
          tileOfWorker.resourceType === RESOURCETYPE.RESOURCE
        ) {
          gold = 1000;
        }

        factions.find((faction) => faction.id === unit.factionId)!.gold += gold;
        break;
    }
  }

  private warriorMove(
    unitMove: PostUnitMoveResponse,
    factions: FactionContext[],
    units: UnitContext[],
    tiles: Tile[],
    tilesToUpdateIds: number[],
    unit: UnitContext
  ) {
    switch (unitMove.unitMoveType) {
      case UNITMOVETYPE.CONQUER_NEUTRAL_TILE:
        this.conquerNeutralTile(unit, tiles, factions, tilesToUpdateIds);
        break;

      case UNITMOVETYPE.NEUTRALIZE_ENEMY_TILE:
        this.conquerEnemyTile(unit, tiles, factions, tilesToUpdateIds);
        break;

      case UNITMOVETYPE.ATTACK:
        this.attack(unit, tiles, units, factions, tilesToUpdateIds);
        break;
    }
  }

  private minerMove(
    unitMove: PostUnitMoveResponse,
    factions: FactionContext[],
    units: UnitContext[],
    tiles: Tile[],
    tilesToUpdateIds: number[],
    unit: UnitContext
  ) {
    switch (unitMove.unitMoveType) {
      case UNITMOVETYPE.DEPLOY_MINE:
        const tile = tiles.find(
          (tile) =>
            tile.id === unit.location.y * Config.getWidth() + unit.location.x
        );

        if (!tile) {
          throw new Error("Tile not found");
        }

        if (tile.factionId !== unit.factionId) {
          throw new Error("Tile is not owned by the unit's faction");
        }

        if (tile.resourceType !== RESOURCETYPE.EMPTY) {
          throw new Error("Cannot mine a not empty tile");
        }

        if (tile.fortified) {
          throw new Error("Cannot mine a fortified tile");
        }

        tile.bombed = true;
        tilesToUpdateIds.push(tile.id);

        break;

      case UNITMOVETYPE.CLEAR_MINE:
        const tileToClear = tiles.find(
          (tile) =>
            tile.id === unit.location.y * Config.getWidth() + unit.location.x
        );

        if (!tileToClear) {
          throw new Error("Tile not found");
        }

        if (tileToClear.factionId === unit.factionId) {
          throw new Error("Tile is owned by the unit's faction");
        }

        if (!tileToClear.bombed) {
          throw new Error("Tile is not mined");
        }

        tileToClear.bombed = false;
        tilesToUpdateIds.push(tileToClear.id);

        break;

      case UNITMOVETYPE.ATTACK:
        this.attack(unit, tiles, units, factions, tilesToUpdateIds);
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
    factions: FactionContext[],
    tilesToUpdateIds: number[],
    unitToUpdate: UnitContext
  ): boolean {
    switch (unitMove.unitMoveType) {
      case UNITMOVETYPE.TRAVEL:
        if (!unitMove.location) {
          throw new Error("No location provided for unit move TRAVEL...");
        }

        if (!this.isOneStepAway(unitToUpdate.location, unitMove.location))
          throw new Error("Unit can only travel one step away");

        if (this.otherUnitAtLocation(unitMove.location, units))
          throw new Error("Unit cannot travel to a location with another unit");

        const tileToLeave = tiles.find(
          (tile) =>
            tile.id ===
            unitToUpdate.location.y * Config.getWidth() +
              unitToUpdate.location.x
        );

        tileToLeave!.unit = null;

        tilesToUpdateIds.push(tileToLeave!.id);

        const tileToUpdate = tiles.find(
          (tile) =>
            tile.id ===
            unitMove.location!.y * Config.getWidth() + unitMove.location!.x
        );

        tilesToUpdateIds.push(tileToUpdate!.id);

        if (
          tileToUpdate?.bombed &&
          unitToUpdate.type !== UNITTYPE.MINER &&
          tileToUpdate?.factionId !== unitToUpdate.factionId
        ) {
          units.find((unit) => unit.id === unitToUpdate.id)!.health = 0;
          tileToUpdate!.bombed = false;

          factions.find(
            (faction) => faction.id === unitToUpdate.factionId
          )!.population -= 1;

          factions.find(
            (faction) => faction.id === tileToUpdate.factionId
          )!.kills += 1;
          return true;
        }
        units.find((unit) => unit.id === unitToUpdate.id)!.location =
          unitMove.location;

        tileToUpdate!.unit = unitToUpdate.id;
        return true;

      case UNITMOVETYPE.IDLE:
        return true;

      case UNITMOVETYPE.RETIRE:
        units.find((unit) => unit.id === unitToUpdate.id)!.health = 0;

        const tileWithUnitToRetire = tiles.find(
          (tile) =>
            tile.id ===
            unitToUpdate.location.y * Config.getWidth() +
              unitToUpdate.location.x
        );

        tileWithUnitToRetire!.unit = null;

        tilesToUpdateIds.push(tileWithUnitToRetire!.id);

        factions.find(
          (faction) => faction.id === unitToUpdate.factionId
        )!.population -= 1;

        return true;

      default:
        return false;
    }
  }

  private attack(
    unit: UnitContext,
    tiles: Tile[],
    units: UnitContext[],
    factions: FactionContext[],
    tilesToUpdateIds: number[]
  ): void {
    const tilesWithUnit: Tile[] = [];
    const unitIndex = unit.location.y * Config.getWidth() + unit.location.x;
    const neightbourLocations = tiles.filter((tile) => {
      return (
        tile.id === unitIndex - 1 ||
        tile.id === unitIndex + 1 ||
        tile.id === unitIndex - Config.getWidth() ||
        tile.id === unitIndex + Config.getWidth() ||
        tile.id === unitIndex - Config.getWidth() - 1 ||
        tile.id === unitIndex - Config.getWidth() + 1 ||
        tile.id === unitIndex + Config.getWidth() - 1 ||
        tile.id === unitIndex + Config.getWidth() + 1
      );
    });

    for (const tile of neightbourLocations) {
      if (tile.unit !== null) {
        tilesWithUnit.push(tile);
      }
    }

    let enemyUnit;
    for (const tile of tilesWithUnit) {
      enemyUnit = units.find(
        (neighbour) =>
          neighbour.id === tile.unit && neighbour.factionId !== unit.factionId
      );
      if (!enemyUnit) {
        continue;
      }

      enemyUnit!.health -= unitDamage.get(unit.type) || 0;

      if (enemyUnit!.health <= 0) {
        enemyUnit!.health = 0;
        tile.unit = null;

        tilesToUpdateIds.push(tile.id);

        factions.find(
          (faction) => faction.id === enemyUnit!.factionId
        )!.population -= 1;

        factions.find((faction) => faction.id === unit.factionId)!.kills += 1;
      }
      return;
    }
  }

  private conquerNeutralTile(
    unit: UnitContext,
    tiles: Tile[],
    factions: FactionContext[],
    tilesToUpdateIds: number[]
  ): void {
    const tileToConquer = tiles.find(
      (tile) =>
        tile.id === unit.location.y * Config.getWidth() + unit.location.x
    );
    if (!tileToConquer) {
      throw new Error("Tile not found");
    }

    if (tileToConquer.factionId !== -1) {
      throw new Error("Tile already conquered");
    }

    tileToConquer.factionId = unit.factionId;
    tilesToUpdateIds.push(tileToConquer.id);
    factions.find((faction) => faction.id === unit.factionId)!.land += 1;
  }

  private conquerEnemyTile(
    unit: UnitContext,
    tiles: Tile[],
    factions: FactionContext[],
    tilesToUpdateIds: number[]
  ): void {
    const tileToNeutralize = tiles.find(
      (tile) =>
        tile.id === unit.location.y * Config.getWidth() + unit.location.x
    );
    if (!tileToNeutralize) {
      throw new Error("Tile not found");
    }

    if (tileToNeutralize.factionId === -1) {
      throw new Error("Tile already neutralized");
    }

    if (tileToNeutralize.factionId === unit.factionId) {
      throw new Error("Tile is owned by the unit's faction");
    }

    if (tileToNeutralize.fortified) {
      tileToNeutralize.fortified = false;
    } else {
      const factionToUpdate = factions.find(
        (faction) => faction.id === tileToNeutralize.factionId
      );

      factionToUpdate!.land -= 1;
      tileToNeutralize.factionId = -1;

      if (tileToNeutralize.resourceType === RESOURCETYPE.BASE) {
        factionToUpdate!.destroyed = true;
      }
    }

    tilesToUpdateIds.push(tileToNeutralize.id);
  }
}
