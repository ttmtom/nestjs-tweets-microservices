import { ServiceConfigType } from '../shared';

const usersConfig: ServiceConfigType = {
  port: Number(process.env.AUTH_PORT) || 6001,
};

export default usersConfig;
