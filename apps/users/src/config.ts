class Config {
  private readonly envConfig: {
    port: string;
  } = null;

  constructor() {
    this.envConfig = {
      port: process.env.USERS_SERVICE_PORT,
    };
  }

  get(key: keyof typeof this.envConfig): any {
    return this.envConfig[key];
  }
}

export const appConfig = new Config();
