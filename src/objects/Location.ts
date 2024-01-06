import { UnitWithoutId } from "./Unit";

export type Location = {
  x: number;
  y: number;
  unit: UnitWithoutId | null;
};
