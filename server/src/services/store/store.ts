import type { Core } from '@strapi/strapi';

const createStoreConnector = ({ strapi }: { strapi: Core.Strapi }) => {
  const strapiStore = strapi.store({
    type: 'plugin',
    name: 'upstash-search',
  });

  return {
    getStoreKey: async function ({ key }: { key: string }) {
      return strapiStore.get({ key });
    },

    setStoreKey: async function ({ key, value }: { key: string; value: any }) {
      return strapiStore.set({
        key,
        value,
      });
    },

    deleteStore: async function ({ key }: { key: string }) {
      return strapiStore.delete({
        key,
      });
    },
  };
};

export type Store = ReturnType<typeof createStoreConnector>;

export default createStoreConnector;
