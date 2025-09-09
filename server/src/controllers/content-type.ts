import type { Core } from '@strapi/strapi';
import { ErrorService } from 'src/services/error';
import { UpstashSearchService } from 'src/services/upstash-search';

export default ({ strapi }: { strapi: Core.Strapi }) => {
  const upstashSearch = strapi
    .plugin('upstash-search')
    .service('upstashSearch') as UpstashSearchService;
  const error = strapi.plugin('upstash-search').service('error') as ErrorService;

  return {
    async getContentTypes(ctx) {
      await upstashSearch
        .getContentTypesReport()
        .then((contentTypes) => {
          ctx.body = { data: contentTypes };
        })
        .catch(async (e) => {
          ctx.body = await error.createError(e);
        });
    },

    async addContentType(ctx) {
      const { contentType, searchableFields, indexUids } = ctx.request.body;

      await upstashSearch
        .addContentTypeInUpstashSearch({
          contentType,
          searchableFields,
          indexUids,
        })
        .then((taskUids) => {
          ctx.body = { data: taskUids };
        })
        .catch(async (e) => {
          ctx.body = await error.createError(e);
        });
    },

    async updateContentType(ctx) {
      const { contentType } = ctx.request.body;
      await upstashSearch
        .updateContentTypeInUpstashSearch({
          contentType,
        })
        .then((taskUids) => {
          ctx.body = { data: taskUids };
        })
        .catch(async (e) => {
          ctx.body = await error.createError(e);
        });
    },

    async removeContentType(ctx) {
      const { contentType } = ctx.request.params;

      await upstashSearch
        .emptyOrDeleteIndex({
          contentType,
        })
        .then(() => {
          ctx.body = { data: 'ok' };
        })
        .catch(async (e) => {
          ctx.body = await error.createError(e);
        });
    },
  };
};
