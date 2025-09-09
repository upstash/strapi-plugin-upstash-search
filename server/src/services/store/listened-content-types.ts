import type { Store } from './store';

const createListenedContentTypesStore = ({ store }: { store: Store }) => ({
  getListenedContentTypes: async function () {
    const contentTypes = (await store.getStoreKey({
      key: 'upstash_search_listened_content_types',
    })) as string[];
    return contentTypes || [];
  },

  setListenedContentTypes: async function ({ contentTypes = [] }: { contentTypes: string[] }) {
    return store.setStoreKey({
      key: 'upstash_search_listened_content_types',
      value: contentTypes,
    });
  },

  addListenedContentType: async function ({ contentType }: { contentType: string }) {
    const listenedContentTypes = await this.getListenedContentTypes();
    const newSet = new Set(listenedContentTypes);
    newSet.add(contentType);

    return this.setListenedContentTypes({
      contentTypes: [...newSet],
    });
  },

  addListenedContentTypes: async function ({ contentTypes }: { contentTypes: string[] }) {
    for (const contentType of contentTypes) {
      await this.addListenedContentType({ contentType });
    }
    return this.getListenedContentTypes();
  },

  emptyListenedContentTypes: async function () {
    await this.setListenedContentTypes({ contentTypes: [] });
    return this.getListenedContentTypes();
  },
});

export type ListenedContentTypesService = ReturnType<typeof createListenedContentTypesStore>;

export default createListenedContentTypesStore;
