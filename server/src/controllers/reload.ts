import type { Core } from '@strapi/strapi';

async function reloadServer({ strapi }: { strapi: Core.Strapi }) {
  const {
    config: { autoReload },
  } = strapi;
  if (!autoReload) {
    return {
      message: 'Reload is only possible in develop mode. Please reload server manually.',
      title: 'Reload failed',
      error: true,
      link: 'https://docs.strapi.io/cms/cli#strapi-start',
    };
  } else {
    strapi.reload.isWatching = false;
    strapi.reload();
    return { message: 'ok' };
  }
}

export default ({ strapi }: { strapi: Core.Strapi }) => {
  return {
    reload(ctx) {
      ctx.send({ message: 'ok' });
      return reloadServer({ strapi });
    },
  };
};
