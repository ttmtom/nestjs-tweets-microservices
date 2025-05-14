import { ServiceConfigType } from '../shared';

const authConfig: ServiceConfigType = {
  port: Number(process.env.AUTH_PORT) || 6001,
};

export default authConfig;
