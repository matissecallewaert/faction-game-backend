import { UNITTYPE } from "../prisma";
import { UNITMOVETYPE } from "../constants/UnitMoveType";

export type GameContext = {
  id: string;
  name: string;
  height: number;
  width: number;
  amountOfMoves: number;
  unitHealth: Map<UNITTYPE, number>;
  unitCost: Map<UNITTYPE, number>;
  unitMoveCost: Map<UNITMOVETYPE, number>;
};
