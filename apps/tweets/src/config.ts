class Config {
  private readonly envConfig: { [key: string]: any } = null;

  constructor() {
    this.envConfig = {
      port: process.env.TWEET_SERVICE_PORT,
    };
  }

  get(key: keyof typeof this.envConfig): any {
    return this.envConfig[key];
  }
}

export const appConfig = new Config();
