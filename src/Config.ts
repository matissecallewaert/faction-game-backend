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
}
