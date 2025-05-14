import { ServiceConfigType } from '../shared';

const tweetsConfig: ServiceConfigType = {
  port: Number(process.env.AUTH_PORT) || 6001,
};

export default tweetsConfig;
