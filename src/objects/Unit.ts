import { UNITTYPE } from "../prisma";

export type UnitWithoutId = {
  type: UNITTYPE;
  health: number;
  index: number;
  factionId: number;
  gameId: string;
};
