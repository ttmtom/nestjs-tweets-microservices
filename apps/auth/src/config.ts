class Config {
  private readonly envConfig: { [key: string]: any } = null;

  constructor() {
    this.envConfig = {
      port: process.env.AUTH_SERVICE_PORT,
      dbHost: process.env.AUTH_DB_HOST,
      dbPort: process.env.AUTH_DB_PORT,
      username: process.env.AUTH_DB_USERNAME,
      password: process.env.AUTH_DB_PASSWORD,
      dbName: process.env.AUTH_DB_NAME,
    };
  }

  get(key: keyof typeof this.envConfig): any {
    return this.envConfig[key];
  }
}

export const appConfig = new Config();
