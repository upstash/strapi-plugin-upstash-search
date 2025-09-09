import type { Core } from '@strapi/strapi';

const error = ({ strapi }: { strapi: Core.Strapi }) => {
  const store = strapi.plugin('upstash-search').service('store');
  return {
    async createError(e) {
      strapi.log.error(`upstash-search: ${e.message}`);
      const prefix = e.stack.split(':')[0];
      if (prefix === 'UpstashSearchApiError') {
        return {
          error: {
            message: e.message,
            link: {
              url: e.link || 'https://upstash.com/docs/search/overall/getstarted',
              label: {
                id: 'notification.upstash-search',
                defaultMessage: 'See more',
              },
            },
          },
        };
      } else if (e.type === 'UpstashSearchCommunicationError') {
        const { host } = await store.getCredentials();
        return {
          error: {
            message: `Could not connect with Upstash Search, please check your host: ${host}`,
          },
        };
      } else {
        const message = e.message;
        return {
          error: {
            message: message,
          },
        };
      }
    },
  };
};

export type ErrorService = ReturnType<typeof error>;

export default error;
