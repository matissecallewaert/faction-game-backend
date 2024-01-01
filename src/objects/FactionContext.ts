import { Location } from "./Location";

export type FactionContext = {
  id: number;
  base_location: Location;
  gold: number;
  land: number;
  population: number;
  populationCap: number;
  kills: number;
  score: number;
  destroyed: boolean;
  currentUpkeep: number;
};
