import { StoreService } from 'src/services/store';
import type { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => {
  const store = strapi.plugin('upstash-search').service('store') as StoreService;
  return {
    async getCredentials(ctx) {
      await store
        .getCredentials()
        .then((credentials) => {
          ctx.body = { data: credentials };
        })
        .catch((e) => {
          const message = e.message;
          ctx.body = {
            error: {
              message: message,
            },
          };
        });
    },

    async addCredentials(ctx) {
      const { host, apiKey } = ctx.request.body;
      await store
        .addCredentials({ host, apiKey })
        .then((credentials) => {
          ctx.body = { data: credentials };
        })
        .catch((e) => {
          const message = e.message;
          ctx.body = {
            error: {
              message: message,
            },
          };
        });
    },
  };
};
