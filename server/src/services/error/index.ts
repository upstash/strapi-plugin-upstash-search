import error from './error';
import type { Core } from '@strapi/strapi';

const errorService = ({ strapi }: { strapi: Core.Strapi }) => {
  return {
    ...error({ strapi }),
  };
};

export type ErrorService = ReturnType<typeof errorService>;

export default errorService;
