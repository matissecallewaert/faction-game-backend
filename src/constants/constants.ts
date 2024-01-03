import { UNITTYPE } from "../prisma";
import { UNITMOVETYPE } from "./UnitMoveType";

export const unitHealth = new Map<UNITTYPE, number>([
  [UNITTYPE.PIONEER, 3],
  [UNITTYPE.WORKER, 5],
  [UNITTYPE.WARRIOR, 6],
  [UNITTYPE.MINER, 6],
]);

export const unitCost = new Map<UNITTYPE, number>([
  [UNITTYPE.PIONEER, 200],
  [UNITTYPE.WORKER, 350],
  [UNITTYPE.WARRIOR, 700],
  [UNITTYPE.MINER, 850],
]);

export const unitMoveCost = new Map<UNITMOVETYPE, number>([
  [UNITMOVETYPE.ATTACK, 0],
  [UNITMOVETYPE.CLEAR_MINE, 0],
  [UNITMOVETYPE.CONQUER_NEUTRAL_TILE, 0],
  [UNITMOVETYPE.DEPLOY_MINE, 25],
  [UNITMOVETYPE.FORTIFY, 0],
  [UNITMOVETYPE.GENERATE_GOLD, 0],
  [UNITMOVETYPE.IDLE, 0],
  [UNITMOVETYPE.NEUTRALIZE_ENEMY_TILE, 0],
  [UNITMOVETYPE.PREPARE_DEFENSE, 0],
  [UNITMOVETYPE.RETIRE, 0],
  [UNITMOVETYPE.TRAVEL, 0],
]);

export const unitDamage = new Map<UNITTYPE, number>([
  [UNITTYPE.PIONEER, 2],
  [UNITTYPE.WORKER, 0],
  [UNITTYPE.WARRIOR, 3],
  [UNITTYPE.MINER, 2],
]);

export const unitUpkeep = new Map<UNITTYPE, number>([
  [UNITTYPE.PIONEER, 25],
  [UNITTYPE.WORKER, 45],
  [UNITTYPE.WARRIOR, 90],
  [UNITTYPE.MINER, 90],
]);