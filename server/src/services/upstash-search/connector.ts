import UpstashSearch from './client';
import type { AdapterService } from './adapter';
import { StoreService } from '../store';
import { ContentTypeService } from '../content-types';
import { LifecycleService } from '../lifecycle';
import type { Core } from '@strapi/strapi';

const sanitizeEntries = async function ({
  contentType,
  entries,
  adapter,
}: {
  contentType: string;
  entries: Record<string, any>[];
  adapter: AdapterService;
}) {
  if (!Array.isArray(entries)) entries = [entries];

  // Filter out unpublished entries to prevent duplicates
  entries = entries.filter((entry) => {
    // Only index published entries
    if (entry.publishedAt === null || entry.publishedAt === undefined) {
      return false;
    }
    return true;
  });

  // Add content-type prefix to id
  entries = await adapter.addCollectionNamePrefix({
    contentType,
    entries,
  });

  return entries;
};

function buildUpstashPayload(document: Record<string, any>, searchableFields?: string[]) {
  const { _upstash_search_id, ...rest } = document;

  if (!Array.isArray(searchableFields) || searchableFields.length === 0) {
    return {
      id: _upstash_search_id,
      content: rest,
      metadata: {},
    };
  }

  const content: Record<string, any> = {};
  const metadata: Record<string, any> = {};
  const pick = new Set(searchableFields);

  Object.keys(rest).forEach((key) => {
    if (pick.has(key)) {
      content[key] = rest[key];
    } else {
      metadata[key] = rest[key];
    }
  });

  return { id: _upstash_search_id, content, metadata };
}

const connectorService = ({
  strapi,
  adapter,
}: {
  strapi: Core.Strapi;
  adapter: AdapterService;
}) => {
  const store = strapi.plugin('upstash-search').service('store') as StoreService;
  const contentTypeService = strapi
    .plugin('upstash-search')
    .service('contentType') as ContentTypeService;
  const lifecycle = strapi.plugin('upstash-search').service('lifecycle') as LifecycleService;

  return {
    getIndexUids: async function () {
      try {
        const { apiKey, host } = await store.getCredentials();

        const client = UpstashSearch({ token: apiKey, url: host });
        const indexes = await client.listIndexes();
        return indexes;
      } catch (e) {
        strapi.log.error(`upstash-search: ${e.message}`);
        return [];
      }
    },

    deleteEntriesFromUpstashSearch: async function ({
      contentType,
      entriesId,
    }: {
      contentType: string;
      entriesId: number[];
    }) {
      const { apiKey, host } = await store.getCredentials();

      const client = UpstashSearch({ token: apiKey, url: host });

      const indexUids = await store.getIndexNamesOfContentType({ contentType });
      const documentsIds = entriesId.map((entryId) =>
        adapter.addCollectionNamePrefixToId({ entryId, contentType })
      );

      const tasks = await Promise.all(
        indexUids.map(async (indexUid) => {
          const task = await client.index(indexUid).delete(documentsIds);

          strapi.log.info(
            `A task to delete ${documentsIds.length} documents of the index "${indexUid}" in Upstash Search has been enqueued.`
          );

          return task;
        })
      );

      return tasks.flat();
    },

    updateEntriesInUpstashSearch: async function ({
      contentType,
      entries,
      searchableFields,
    }: {
      contentType: string;
      entries: Record<string, any>[];
      searchableFields?: string[];
    }) {
      const { apiKey, host } = await store.getCredentials();

      const client = UpstashSearch({ token: apiKey, url: host });

      if (!Array.isArray(entries)) entries = [entries];

      const indexUids = await store.getIndexNamesOfContentType({ contentType });

      const addDocuments = await sanitizeEntries({
        contentType,
        entries,
        adapter,
      });

      // Check which documents are not in sanitized documents and need to be deleted
      const deleteDocuments = entries.filter(
        (entry) => !addDocuments.map((document) => document.id).includes(entry.id)
      );
      // Collect delete tasks
      const deleteTasks = await Promise.all(
        indexUids.map(async (indexUid) => {
          const tasks = await Promise.all(
            deleteDocuments.map(async (document) => {
              const task = await client.index(indexUid).delete(
                adapter.addCollectionNamePrefixToId({
                  contentType,
                  entryId: document.id,
                })
              );

              strapi.log.info(
                `A task to delete one document from the Upstash Search index "${indexUid}" has been enqueued.`
              );

              return task;
            })
          );
          return tasks;
        })
      );

      // Collect update tasks
      const updateTasks = await Promise.all(
        indexUids.map(async (indexUid) => {
          const task = client
            .index(indexUid)
            .upsert(
              addDocuments.map((document) => buildUpstashPayload(document, searchableFields))
            );

          strapi.log.info(
            `A task to update ${addDocuments.length} documents to the Upstash Search index "${indexUid}" has been enqueued.`
          );

          return task;
        })
      );

      return [...deleteTasks.flat(), ...updateTasks];
    },

    getStats: async function ({ indexUid }: { indexUid: string }) {
      try {
        const { apiKey, host } = await store.getCredentials();

        const client = UpstashSearch({ token: apiKey, url: host });
        const stats = await client.index(indexUid).info();

        return {
          numberOfDocuments: stats.documentCount || 0,
          isIndexing: stats.pendingDocumentCount > 0,
        };
      } catch (e) {
        return {
          numberOfDocuments: 0,
          isIndexing: false,
        };
      }
    },

    getContentTypesReport: async function () {
      const indexUids = await this.getIndexUids();

      // All listened contentTypes
      const listenedContentTypes = await store.getListenedContentTypes();
      // All indexed contentTypes
      const indexedContentTypes = await store.getIndexedContentTypes();

      const contentTypes = contentTypeService.getContentTypesUid();

      const reports = await Promise.all(
        contentTypes.flatMap(async (contentType) => {
          const collectionName = contentTypeService.getCollectionName({
            contentType,
          });
          const indexUidsForContentType = await store.getIndexNamesOfContentType({
            contentType,
          });
          return Promise.all(
            indexUidsForContentType.map(async (indexUid) => {
              const indexInUpstashSearch = indexUids.includes(indexUid);
              const contentTypeInIndexStore = indexedContentTypes.find(
                (ct) => ct.contentType === contentType
              );
              const indexed = indexInUpstashSearch && contentTypeInIndexStore;

              // safe guard in case index does not exist anymore in Upstash Search
              if (!indexInUpstashSearch && contentTypeInIndexStore) {
                await store.removeIndexedContentType({ contentType });
              }

              const { numberOfDocuments, isIndexing } = indexed
                ? await this.getStats({ indexUid })
                : { isIndexing: false, numberOfDocuments: 0 };

              const attrs = strapi.contentTypes[contentType]?.attributes || {};
              const fieldNames = Object.keys(attrs).sort();

              const numberOfEntries = await contentTypeService.numberOfEntries({
                contentType,
              });
              return {
                collection: collectionName,
                contentType: contentType,
                indexUid,
                indexed,
                isIndexing,
                numberOfDocuments,
                numberOfEntries,
                listened: listenedContentTypes.includes(contentType),
                fields: fieldNames,
              };
            })
          );
        })
      );
      return { contentTypes: reports.flat() };
    },

    addEntriesToUpstashSearch: async function ({
      contentType,
      entries,
      searchableFields,
    }: {
      contentType: string;
      entries: Record<string, any>[];
      searchableFields?: string[];
    }) {
      const { apiKey, host } = await store.getCredentials();

      const client = UpstashSearch({ token: apiKey, url: host });

      if (!Array.isArray(entries)) entries = [entries];

      const indexUids = await store.getIndexNamesOfContentType({ contentType });
      const documents = await sanitizeEntries({
        contentType,
        entries,
        adapter,
      });

      const tasks = await Promise.all(
        indexUids.map(async (indexUid) => {
          const task = await client
            .index(indexUid)
            .upsert(documents.map((document) => buildUpstashPayload(document, searchableFields)));

          strapi.log.info(
            `The task to add ${documents.length} documents to the Upstash Search index "${indexUid}" has been enqueued.`
          );
          return task;
        })
      );

      // Register this content type as indexed
      await store.addIndexedContentType({ contentType, searchableFields });

      return tasks.flat();
    },

    addContentTypeInUpstashSearch: async function ({
      contentType,
      searchableFields,
      indexUids,
    }: {
      contentType: string;
      searchableFields?: string[];
      indexUids?: string[];
    }) {
      const { apiKey, host } = await store.getCredentials();

      const client = UpstashSearch({ token: apiKey, url: host });
      await store.setIndexNamesForContentType({ contentType, indexNames: indexUids });
      const indexNames = indexUids || (await store.getIndexNamesOfContentType({ contentType }));

      // Callback function for batching action
      const addDocuments = async ({ entries, contentType }) => {
        // Sanitize entries
        const documents = await sanitizeEntries({
          contentType,
          entries,
          adapter,
        });

        // Add documents in Upstash Search
        const taskUids = await Promise.all(
          indexNames.map(async (indexUid) => {
            const taskUid = await client
              .index(indexUid)
              .upsert(documents.map((document) => buildUpstashPayload(document, searchableFields)));

            strapi.log.info(
              `A task to add ${documents.length} documents to the Upstash Search index "${indexUid}" has been enqueued.`
            );

            return taskUid;
          })
        );

        return taskUids.flat();
      };

      const tasksUids = await contentTypeService.actionInBatches({
        contentType,
        callback: addDocuments,
      });

      await store.addIndexedContentType({ contentType, searchableFields });
      await lifecycle.subscribeContentType({ contentType, searchableFields });

      return tasksUids;
    },

    getContentTypesWithSameIndex: async function ({ contentType }: { contentType: string }) {
      const indexUids = await store.getIndexNamesOfContentType({ contentType });

      // Initialize an empty array to hold contentTypes with the same index names
      let contentTypesWithSameIndex = [];

      // Iterate over each indexUid to fetch and accumulate contentTypes that have the same indexName
      for (const indexUid of indexUids) {
        const contentTypesForCurrentIndex = await this.listContentTypesWithCustomIndexName({
          indexName: indexUid,
        });

        contentTypesWithSameIndex = [...contentTypesWithSameIndex, ...contentTypesForCurrentIndex];
      }

      // Remove duplicates
      contentTypesWithSameIndex = [...new Set(contentTypesWithSameIndex)];

      // Get all contentTypes (not indexes) indexed in Upstash Search.
      const indexedContentTypes = await store.getIndexedContentTypes();

      // Take intersection of both arrays
      const indexedContentTypesWithSameIndex = indexedContentTypes.filter((ct) =>
        contentTypesWithSameIndex.includes(ct.contentType)
      );

      return indexedContentTypesWithSameIndex;
    },

    listContentTypesWithCustomIndexName: async function ({ indexName }: { indexName: string }) {
      const contentTypes = (contentTypeService.getContentTypesUid() as string[]) || [];

      const matchingContentTypes = [];
      for (const contentTypeUid of contentTypes) {
        const indexNames = await store.getIndexNamesOfContentType({
          contentType: contentTypeUid,
        });
        if (indexNames.includes(indexName)) {
          matchingContentTypes.push(contentTypeUid);
        }
      }

      return matchingContentTypes;
    },

    emptyOrDeleteIndex: async function ({ contentType }: { contentType: string }) {
      const indexedContentTypesWithSameIndex = await this.getContentTypesWithSameIndex({
        contentType,
      });
      if (indexedContentTypesWithSameIndex.length > 1) {
        const deleteEntries = async ({ entries, contentType }) => {
          await this.deleteEntriesFromUpstashSearch({
            contentType,
            entriesId: entries.map((entry) => entry.id),
          });
        };
        await contentTypeService.actionInBatches({
          contentType,
          callback: deleteEntries,
        });
      } else {
        const { apiKey, host } = await store.getCredentials();

        const client = UpstashSearch({ token: apiKey, url: host });

        const indexUids = await store.getIndexNamesOfContentType({ contentType });
        await Promise.all(
          indexUids.map(async (indexUid) => {
            const response = await client.index(indexUid).deleteIndex();
            strapi.log.info(
              `A task to delete the Upstash Search index "${indexUid}" has been added to the queue.`
            );
            return response;
          })
        );
      }

      await store.removeIndexedContentType({ contentType });
    },

    updateContentTypeInUpstashSearch: async function ({ contentType }: { contentType: string }) {
      const indexedContentTypes = await store.getIndexedContentTypes();
      if (indexedContentTypes.find((ct) => ct.contentType === contentType)) {
        await this.emptyOrDeleteIndex({ contentType });
      }
      const searchableFields = indexedContentTypes.find(
        (ct) => ct.contentType === contentType
      )?.searchableFields;
      return this.addContentTypeInUpstashSearch({ contentType, searchableFields });
    },
  };
};

export type ConnectorService = ReturnType<typeof connectorService>;

export default connectorService;
