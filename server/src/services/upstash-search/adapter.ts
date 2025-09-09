import type { Core } from '@strapi/strapi';
import type { ContentTypeService } from '../content-types/content-types';

const adapterService = ({ strapi }: { strapi: Core.Strapi }) => {
  const contentTypeService = strapi
    .plugin('upstash-search')
    .service('contentType') as ContentTypeService;
  return {
    addCollectionNamePrefixToId: function ({
      contentType,
      entryId,
    }: {
      contentType: string;
      entryId: number;
    }) {
      const collectionName = contentTypeService.getCollectionName({
        contentType,
      });

      return `${collectionName}-${entryId}`;
    },

    addCollectionNamePrefix: function ({
      contentType,
      entries,
    }: {
      contentType: string;
      entries: Record<string, any>[];
    }) {
      return entries.map((entry) => ({
        ...entry,
        _upstash_search_id: this.addCollectionNamePrefixToId({
          entryId: entry.id,
          contentType,
        }),
      }));
    },
  };
};

export type AdapterService = ReturnType<typeof adapterService>;

export default adapterService;
