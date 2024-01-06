import { UnitWithoutIndex } from "./Unit";

export type Location = {
  x: number;
  y: number;
  unit: UnitWithoutIndex | null;
};
