import { UNITTYPE } from "../prisma";
import { UNITMOVETYPE } from "./UnitMoveType";

export const unitHealth = new Map<UNITTYPE, number>([
  [UNITTYPE.PIONEER, 100], // adjust to actual values
  [UNITTYPE.WORKER, 100],
  [UNITTYPE.WARRIOR, 100],
  [UNITTYPE.HEALER, 100],
  [UNITTYPE.MINER, 100],
]);

export const unitCost = new Map<UNITTYPE, number>([
  [UNITTYPE.PIONEER, 100], // adjust to actual values
  [UNITTYPE.WORKER, 100],
  [UNITTYPE.WARRIOR, 100],
  [UNITTYPE.HEALER, 100],
  [UNITTYPE.MINER, 100],
]);

export const unitMoveCost = new Map<UNITMOVETYPE, number>([
  [UNITMOVETYPE.ATTACK, 100], // adjust to actual values
  [UNITMOVETYPE.CLEAR_MINE, 100],
  [UNITMOVETYPE.CONQUER_NEUTRAL_TILE, 100],
  [UNITMOVETYPE.CONVERT, 100],
  [UNITMOVETYPE.DEPLOY_MINE, 100],
  [UNITMOVETYPE.FORTIFY, 100],
  [UNITMOVETYPE.GENERATE_GOLD, 100],
  [UNITMOVETYPE.HEAL, 100],
  [UNITMOVETYPE.IDLE, 100],
  [UNITMOVETYPE.NEUTRALIZE_ENEMY_TILE, 100],
  [UNITMOVETYPE.PRAY, 100],
  [UNITMOVETYPE.PREPARE_DEFENSE, 100],
  [UNITMOVETYPE.RETIRE, 100],
  [UNITMOVETYPE.TRAVEL, 100],
]);