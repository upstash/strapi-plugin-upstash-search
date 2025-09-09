import type { ContentTypeService } from './services/content-types';
import type { LifecycleService } from './services/lifecycle';
import type { StoreService } from './services/store';
import type { UpstashSearchService } from './services/upstash-search';
import type { Core } from '@strapi/strapi';

async function subscribeToLifecycles({
  lifecycle,
  store,
}: {
  lifecycle: LifecycleService;
  store: StoreService;
}) {
  const indexedContentTypes = await store.getIndexedContentTypes();
  await store.emptyListenedContentTypes();
  let lifecycles;
  for (const ct of indexedContentTypes) {
    lifecycles = await lifecycle.subscribeContentType({
      contentType: ct.contentType,
      searchableFields: ct.searchableFields,
    });
  }

  return lifecycles;
}

async function syncIndexedCollections({
  store,
  contentTypeService,
  upstashSearch,
}: {
  store: StoreService;
  contentTypeService: ContentTypeService;
  upstashSearch: UpstashSearchService;
}) {
  const indexUids = await upstashSearch.getIndexUids();
  // All indexed contentTypes
  const indexedContentTypes = await store.getIndexedContentTypes();
  const contentTypes = contentTypeService.getContentTypesUid();

  for (const contentType of contentTypes) {
    const contentTypeIndexUids = await store.getIndexNamesOfContentType({
      contentType,
    });
    const indexesInUpstashSearch = contentTypeIndexUids.some((indexUid) =>
      indexUids.includes(indexUid)
    );
    const contentTypeInIndexStore = indexedContentTypes.find(
      (ct) => ct.contentType === contentType
    );

    // Remove any collection that is not in Upstash Search anymore
    if (!indexesInUpstashSearch && contentTypeInIndexStore) {
      await store.removeIndexedContentType({ contentType });
    }
  }
}

const registerPermissionActions = async () => {
  // Role Based Access Control
  const RBAC_ACTIONS = [
    {
      section: 'plugins',
      displayName: 'Access the Upstash Search',
      uid: 'read',
      pluginName: 'upstash-search',
    },
    {
      section: 'plugins',
      displayName: 'Create',
      uid: 'collections.create',
      subCategory: 'collections',
      pluginName: 'upstash-search',
    },
    {
      section: 'plugins',
      displayName: 'Update',
      uid: 'collections.update',
      subCategory: 'collections',
      pluginName: 'upstash-search',
    },
    {
      section: 'plugins',
      displayName: 'Delete',
      uid: 'collections.delete',
      subCategory: 'collections',
      pluginName: 'upstash-search',
    },
    {
      section: 'plugins',
      displayName: 'Edit',
      uid: 'settings.edit',
      subCategory: 'settings',
      pluginName: 'upstash-search',
    },
  ];

  await strapi.admin.services.permission.actionProvider.registerMany(RBAC_ACTIONS);
};

export default async ({ strapi }: { strapi: Core.Strapi }) => {
  const store = strapi.plugin('upstash-search').service('store') as StoreService;
  const lifecycle = strapi.plugin('upstash-search').service('lifecycle') as LifecycleService;
  const upstashSearch = strapi
    .plugin('upstash-search')
    .service('upstashSearch') as UpstashSearchService;
  const contentTypeService = strapi
    .plugin('upstash-search')
    .service('contentType') as ContentTypeService;

  await syncIndexedCollections({
    store,
    contentTypeService,
    upstashSearch,
  });
  await subscribeToLifecycles({
    lifecycle,
    store,
  });
  await registerPermissionActions();
};
