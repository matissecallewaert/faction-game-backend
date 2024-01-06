import { UNITTYPE } from "../prisma";
import { Location } from "./Location";

export type UnitWithoutId = {
  type: UNITTYPE;
  health: number;
  index: number;
  factionId: number;
  gameId: string;
};

export type UnitContext = {
  id: string;
  type: UNITTYPE;
  health: number;
  factionId: number;
  location: Location;
  neightbourLocations: Location[];
};
