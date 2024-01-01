function getConfigVar(key: string): string {
  const val = process.env[key];
  if (val === undefined) {
    throw new Error(`The variable with name ${key} is not set in .env.`);
  }
  return val;
}

export class Config {
  static getDatabaseUrl(): string {
    return getConfigVar("URL_DATABASE");
  }

  static getWidth(): number {
    return parseInt(getConfigVar("WIDTH"));
  }

  static getHeight(): number {
    return parseInt(getConfigVar("HEIGHT"));
  }

  static getPopulationCap(): number {
    return parseInt(getConfigVar("POPULATION_CAP"));
  }

  static getFactionUrl(id: number): string {
    return getConfigVar("URL_FACTION_" + id);
  }
}
