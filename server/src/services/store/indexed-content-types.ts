import type { Store } from './store';

type IndexedContentType = {
  contentType: string;
  searchableFields: string[];
};

const createIndexedContentTypesStore = ({ store }: { store: Store }) => ({
  getIndexedContentTypes: async function () {
    const contentTypes = (await store.getStoreKey({
      key: 'upstash_search_indexed_content_types',
    })) as IndexedContentType[];
    return contentTypes || [];
  },

  setIndexedContentTypes: async function ({
    contentTypes,
  }: {
    contentTypes: IndexedContentType[];
  }) {
    return store.setStoreKey({
      key: 'upstash_search_indexed_content_types',
      value: contentTypes,
    });
  },

  addIndexedContentType: async function ({
    contentType,
    searchableFields,
  }: {
    contentType: string;
    searchableFields?: string[];
  }) {
    const indexedContentTypes = await this.getIndexedContentTypes();
    const filtered = indexedContentTypes.filter((ct) => ct.contentType !== contentType);
    const updated = [...filtered, { contentType, searchableFields }];
    return this.setIndexedContentTypes({ contentTypes: updated });
  },

  removeIndexedContentType: async function ({ contentType }: { contentType: string }) {
    const indexedContentTypes = await this.getIndexedContentTypes();
    const filtered = indexedContentTypes.filter((ct) => ct.contentType !== contentType);
    return this.setIndexedContentTypes({ contentTypes: filtered });
  },
});

export type IndexedContentTypesService = ReturnType<typeof createIndexedContentTypesStore>;

export default createIndexedContentTypesStore;
