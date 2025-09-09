import createStoreConnector from './store';
import createCredentialStore from './credential';
import createIndexedContentTypesStore from './indexed-content-types';
import createListenedContentTypesStore from './listened-content-types';
import createContentTypeIndexesStore from './content-type-indexes';
import type { Core } from '@strapi/strapi';

const storeService = ({ strapi }: { strapi: Core.Strapi }) => {
  const store = createStoreConnector({ strapi });
  return {
    ...createCredentialStore({ store }),
    ...createListenedContentTypesStore({ store }),
    ...createIndexedContentTypesStore({ store }),
    ...createContentTypeIndexesStore({ store }),
    ...createStoreConnector({ strapi }),
  };
};

export type StoreService = ReturnType<typeof storeService>;

export default storeService;
