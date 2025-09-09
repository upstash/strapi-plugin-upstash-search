import type { Core, Schema } from '@strapi/strapi';

const IGNORED_PLUGINS = ['admin', 'upload', 'i18n', 'review-workflows', 'content-releases'];
const IGNORED_CONTENT_TYPES = [
  'plugin::users-permissions.permission',
  'plugin::users-permissions.role',
];

const removeIgnoredAPIs = ({ contentTypes }: { contentTypes: Record<string, any> }) => {
  const contentTypeUids = Object.keys(contentTypes);

  return contentTypeUids.reduce(
    (sanitized, contentType) => {
      if (
        !(
          IGNORED_PLUGINS.includes(contentTypes[contentType].plugin) ||
          IGNORED_CONTENT_TYPES.includes(contentType)
        )
      ) {
        sanitized[contentType] = contentTypes[contentType];
      }
      return sanitized;
    },
    {} as Record<string, any>
  );
};

const contentTypeService = ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Get all content types name being plugins or API's existing in Strapi instance.
   * Content Types are formated like this: `type::apiName.contentType`.
   */
  getContentTypesUid() {
    const contentTypes = removeIgnoredAPIs({
      contentTypes: strapi.contentTypes,
    });

    return Object.keys(contentTypes);
  },

  /**
   * Get the content type uid in this format: "type::service.contentType".
   *
   * If it is already an uid it returns it. If not it searches for it
   */
  getContentTypeUid({ contentType }: { contentType: string }) {
    const contentTypes = strapi.contentTypes;
    const contentTypeUids = Object.keys(contentTypes);
    if (contentTypeUids.includes(contentType)) return contentType;

    const contentTypeUid = contentTypeUids.find((uid) => {
      return contentTypes[uid].modelName === contentType;
    });

    return contentTypeUid;
  },

  /**
   * Get the content type uid in this format: "type::service.contentType".
   *
   * If it is already an uid it returns it. If not it searches for it
   */
  getCollectionName({ contentType }: { contentType: string }) {
    const contentTypes = strapi.contentTypes;
    const contentTypeUids = Object.keys(contentTypes);
    if (contentTypeUids.includes(contentType)) return contentTypes[contentType].modelName;

    return contentType;
  },

  numberOfEntries: async function ({
    contentType,
    filters = {},
    status = 'published',
  }: {
    contentType: string;
    filters?: Record<string, any>;
    status?: 'published' | 'draft';
  }) {
    const contentTypeUid = this.getContentTypeUid({ contentType });
    if (contentTypeUid === undefined) return 0;

    try {
      const count = await strapi.documents(contentTypeUid as any).count({
        filters,
        status,
      });

      return count;
    } catch (e) {
      strapi.log.warn(e);
      return 0;
    }
  },

  async getEntries({
    contentType,
    fields = '*',
    start = 0,
    limit = 100,
    filters = {},
    sort = 'id',
    populate = '*',
    status = 'published',
    locale,
  }: {
    contentType: string;
    fields?: string;
    start?: number;
    limit?: number;
    filters?: Record<string, any>;
    sort?: string;
    populate?: string;
    status?: 'published' | 'draft';
    locale?: string;
  }) {
    const contentTypeUid = this.getContentTypeUid({ contentType });
    if (contentTypeUid === undefined) return [];

    const queryOptions = {
      fields: fields || '*',
      filters,
      sort,
      populate,
      status,
      pagination: {
        start,
        limit,
      },
      ...(locale ? { locale } : {}),
    };

    const entries = await strapi.documents(contentTypeUid as any).findMany(queryOptions);

    // Safe guard in case the content-type is a single type.
    // In which case it is wrapped in an array for consistency.
    if (entries && !Array.isArray(entries)) return [entries];
    return entries || [];
  },

  actionInBatches: async function <T = any>({
    contentType,
    callback = () => void 0,
  }: {
    contentType: string;
    callback?: ({ entries, contentType }: { entries: T[]; contentType: string }) => T;
  }) {
    const batchSize = 100;
    // Need total number of entries in contentType
    const entries_count = await this.numberOfEntries({
      contentType,
    });
    const cbResponse: T[] = [];
    for (let index = 0; index < entries_count; index += batchSize) {
      const entries =
        ((await this.getEntries({
          start: index,
          contentType,
        })) as T[]) || [];

      if (entries.length > 0) {
        const info = await callback({ entries, contentType });
        if (Array.isArray(info)) cbResponse.push(...info);
        else if (info) cbResponse.push(info);
      }
    }
    return cbResponse;
  },
});

export type ContentTypeService = ReturnType<typeof contentTypeService>;

export default contentTypeService;
