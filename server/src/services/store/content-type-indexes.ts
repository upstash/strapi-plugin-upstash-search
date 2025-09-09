import type { ContentTypeService } from '../content-types/content-types';
import type { Store } from './store';

const createContentTypeIndexesStore = ({ store }: { store: Store }) => ({
  getIndexNamesOfContentType: async function ({ contentType }: { contentType: string }) {
    const contentTypeService = strapi
      .plugin('upstash-search')
      .service('contentType') as ContentTypeService;

    const collection = contentTypeService.getCollectionName({ contentType }) as string;
    const key = `upstash_search_index_names_${contentType}`;
    const indexNames = (await store.getStoreKey({ key })) as string[];
    return (indexNames || [collection]).filter((n) => typeof n === 'string' && n.trim().length > 0);
  },

  setIndexNamesForContentType: async function ({
    contentType,
    indexNames = [],
  }: {
    contentType: string;
    indexNames?: string[];
  }) {
    const key = `upstash_search_index_names_${contentType}`;
    const sanitized = (indexNames || []).filter(
      (n) => typeof n === 'string' && n.trim().length > 0
    );
    return store.setStoreKey({ key, value: sanitized });
  },

  clearIndexNamesForContentType: async function ({ contentType }: { contentType: string }) {
    return this.setIndexNamesForContentType({ contentType, indexNames: [] });
  },
});

export type ContentTypeIndexesService = ReturnType<typeof createContentTypeIndexesStore>;

export default createContentTypeIndexesStore;
