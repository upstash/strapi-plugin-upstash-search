import contentTypeProvider from './content-types';
import type { Core } from '@strapi/strapi';

const contentTypeService = ({ strapi }: { strapi: Core.Strapi }) => {
  return {
    ...contentTypeProvider({ strapi }),
  };
};

export type ContentTypeService = ReturnType<typeof contentTypeService>;

export default contentTypeService;
