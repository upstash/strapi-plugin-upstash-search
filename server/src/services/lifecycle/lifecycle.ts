import type { Core } from '@strapi/strapi';
import type { ContentTypeService } from '../content-types/content-types';
import type { StoreService } from '../store';
import type { UpstashSearchService } from '../upstash-search';

const lifecycleService = ({ strapi }: { strapi: Core.Strapi }) => {
  const contentTypeService = strapi
    .plugin('upstash-search')
    .service('contentType') as ContentTypeService;
  const store = strapi.plugin('upstash-search').service('store') as StoreService;
  return {
    /**
     * Subscribe the content type to all required lifecycles
     *
     * @param  {object} options
     * @param  {string} options.contentType
     *
     * @returns {Promise<object>}
     */
    async subscribeContentType({
      contentType,
      searchableFields,
    }: {
      contentType: string;
      searchableFields: string[];
    }) {
      const contentTypeUid = contentTypeService.getContentTypeUid({
        contentType: contentType,
      });
      await strapi.db.lifecycles.subscribe({
        models: [contentTypeUid],
        async afterCreate(event) {
          const { result } = event;
          const upstashSearch = strapi
            .plugin('upstash-search')
            .service('upstashSearch') as UpstashSearchService;

          await upstashSearch
            .addEntriesToUpstashSearch({
              contentType: contentType,
              entries: [result],
              searchableFields: searchableFields,
            })
            .catch((e) => {
              strapi.log.error(
                `Upstash Search could not add entry with id: ${result.id}: ${e.message}`
              );
            });
        },
        async afterCreateMany(event) {
          const { result } = event;
          const upstashSearch = strapi
            .plugin('upstash-search')
            .service('upstashSearch') as UpstashSearchService;

          const nbrEntries = result.count;
          const ids = result.ids;

          const entries = [];
          const BATCH_SIZE = 100;
          for (let pos = 0; pos < nbrEntries; pos += BATCH_SIZE) {
            const batch = await contentTypeService.getEntries({
              contentType: contentTypeUid,
              start: pos,
              limit: BATCH_SIZE,
              filters: {
                id: {
                  $in: ids,
                },
              },
            });
            entries.push(...batch);
          }

          upstashSearch
            .updateEntriesInUpstashSearch({
              contentType: contentTypeUid,
              entries: entries,
              searchableFields: searchableFields,
            })
            .catch((e) => {
              strapi.log.error(`Upstash Search could not update the entries: ${e.message}`);
            });
        },
        async afterUpdate(event) {
          const { result } = event;
          const upstashSearch = strapi
            .plugin('upstash-search')
            .service('upstashSearch') as UpstashSearchService;

          await upstashSearch
            .updateEntriesInUpstashSearch({
              contentType: contentTypeUid,
              entries: [result],
              searchableFields: searchableFields,
            })
            .catch((e) => {
              strapi.log.error(
                `Upstash Search could not update entry with id: ${result.id}: ${e.message}`
              );
            });
        },
        async afterUpdateMany(event) {
          const upstashSearch = strapi
            .plugin('upstash-search')
            .service('upstashSearch') as UpstashSearchService;

          const nbrEntries = await contentTypeService.numberOfEntries({
            contentType: contentTypeUid,
            filters: event.params.where,
          });

          const entries = [];
          const BATCH_SIZE = 100;

          for (let pos = 0; pos < nbrEntries; pos += BATCH_SIZE) {
            const batch = await contentTypeService.getEntries({
              contentType: contentTypeUid,
              filters: event.params.where,
              start: pos,
              limit: BATCH_SIZE,
            });
            entries.push(...batch);
          }

          upstashSearch
            .updateEntriesInUpstashSearch({
              contentType: contentTypeUid,
              entries: entries,
              searchableFields: searchableFields,
            })
            .catch((e) => {
              strapi.log.error(`Upstash Search could not update the entries: ${e.message}`);
            });
        },
        async afterDelete(event) {
          const { result, params } = event;
          const upstashSearch = strapi
            .plugin('upstash-search')
            .service('upstashSearch') as UpstashSearchService;

          let entriesId = [];
          // Different ways of accessing the id's depending on the number of entries being deleted
          // In case of multiple deletes:
          if (params?.where?.$and && params?.where?.$and[0] && params?.where?.$and[0].id?.$in)
            entriesId = params?.where?.$and[0].id.$in;
          // In case there is only one entry being deleted
          else entriesId = [result.id];

          upstashSearch
            .deleteEntriesFromUpstashSearch({
              contentType: contentTypeUid,
              entriesId: entriesId,
            })
            .catch((e) => {
              strapi.log.error(
                `Upstash Search could not delete entry with id: ${result.id}: ${e.message}`
              );
            });
        },
        async afterDeleteMany(event) {
          const { result, params } = event;
          const upstashSearch = strapi
            .plugin('upstash-search')
            .service('upstashSearch') as UpstashSearchService;

          let entriesId = [];
          // Different ways of accessing the id's depending on the number of entries being deleted
          // In case of multiple deletes:
          if (params?.where?.$and && params?.where?.$and[0] && params?.where?.$and[0].id?.$in)
            entriesId = params?.where?.$and[0].id.$in;
          // In case there is only one entry being deleted
          else entriesId = [result.id];

          upstashSearch
            .deleteEntriesFromUpstashSearch({
              contentType: contentTypeUid,
              entriesId: entriesId,
            })
            .catch((e) => {
              strapi.log.error(
                `Upstash Search could not delete entry with id: ${result.id}: ${e.message}`
              );
            });
        },
      });

      return store.addListenedContentType({
        contentType: contentTypeUid,
      });
    },
  };
};

export type LifecycleService = ReturnType<typeof lifecycleService>;

export default lifecycleService;
