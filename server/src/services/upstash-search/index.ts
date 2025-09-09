import connectorService from './connector';
import adapterService from './adapter';
import type { Core } from '@strapi/strapi';

const upstashSearchService = ({ strapi }: { strapi: Core.Strapi }) => {
  const adapter = adapterService({ strapi });
  return {
    ...connectorService({ strapi, adapter }),
    ...adapterService({ strapi }),
  };
};

export type UpstashSearchService = ReturnType<typeof upstashSearchService>;

export default upstashSearchService;
