import lifecycle from './lifecycle';
import type { Core } from '@strapi/strapi';

const lifecycleService = ({ strapi }: { strapi: Core.Strapi }) => {
  return {
    ...lifecycle({ strapi }),
  };
};

export type LifecycleService = ReturnType<typeof lifecycleService>;

export default lifecycleService;
