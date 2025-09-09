import { useState, useEffect } from 'react';
import { useFetchClient } from '@strapi/strapi/admin';

import { PLUGIN_ID } from '../pluginId';
import useAlert from './useAlert';

export type Collection = {
  contentType: string;
  indexed: boolean;
  listened: boolean;
  reloadNeeded: string;
  isIndexing?: boolean;
  indexUid: string;
  numberOfDocuments: number;
  numberOfEntries: number;
  fields: string[];
  collection: string;
  [key: string]: any;
};

export function useCollection() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [refetchIndex, setRefetchIndex] = useState(true);
  const [reloadNeeded, setReloadNeeded] = useState(false);
  const [realTimeReports, setRealTimeReports] = useState(false);

  const { handleNotification, checkForbiddenError } = useAlert();
  const { get, del, post, put } = useFetchClient();

  const refetchCollection = () => setRefetchIndex((prevRefetchIndex) => !prevRefetchIndex);

  const hookingTextRendering = ({ indexed, listened }: { indexed: boolean; listened: boolean }) => {
    if (indexed && listened) return 'Hooked';

    if (!indexed && !listened) return '/';

    return 'Reload needed';
  };

  const fetchCollections = async () => {
    try {
      const {
        data: { data, error },
      } = await get(`/${PLUGIN_ID}/content-type/`);

      if (error) {
        handleNotification({
          type: 'warning',
          message: error.message,
          link: error.link,
        });
      } else {
        const collections = data.contentTypes.map((collection: Collection) => {
          collection['reloadNeeded'] = hookingTextRendering({
            indexed: collection.indexed,
            listened: collection.listened,
          });
          return collection;
        });
        const reload = collections.find((col: Collection) => col.reloadNeeded === 'Reload needed');

        const isIndexing = collections.find((col: Collection) => col.isIndexing === true);

        if (!isIndexing) setRealTimeReports(false);
        else setRealTimeReports(true);

        if (reload) {
          setReloadNeeded(true);
        } else setReloadNeeded(false);
        setCollections(collections);
      }
    } catch (error) {
      checkForbiddenError({ response: error });
    }
  };

  const deleteCollection = async ({ contentType }: { contentType: string }) => {
    try {
      const {
        data: { error },
      } = await del(`/${PLUGIN_ID}/content-type/${contentType}`);
      if (error) {
        handleNotification({
          type: 'warning',
          message: error.message,
          link: error.link,
        });
      } else {
        refetchCollection();
        handleNotification({
          type: 'success',
          message: 'Request to delete content-type is successful',
          blockTransition: false,
        });
      }
    } catch (error) {
      checkForbiddenError({ response: error });
    }
  };

  const addCollection = async ({
    contentType,
    searchableFields,
    indexUids,
  }: {
    contentType: string;
    searchableFields?: string[];
    indexUids?: string[];
  }) => {
    try {
      const {
        data: { error },
      } = await post(`/${PLUGIN_ID}/content-type`, {
        contentType,
        searchableFields,
        indexUids,
      });

      if (error) {
        handleNotification({
          type: 'warning',
          message: error.message,
          link: error.link,
        });
      } else {
        refetchCollection();
        handleNotification({
          type: 'success',
          message: 'Request to add a content-type is successful',
          blockTransition: false,
        });
      }
    } catch (error) {
      checkForbiddenError({ response: error });
    }
  };

  const updateCollection = async ({ contentType }: { contentType: string }) => {
    try {
      const {
        data: { error },
      } = await put(`/${PLUGIN_ID}/content-type`, {
        contentType,
      });

      if (error) {
        handleNotification({
          type: 'warning',
          message: error.message,
          link: error.link,
        });
      } else {
        refetchCollection();
        handleNotification({
          type: 'success',
          message: 'Request to update content-type is successful',
          blockTransition: false,
        });
      }
    } catch (error) {
      checkForbiddenError({ response: error });
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [refetchIndex]);

  // Start refreshing the collections when a collection is being indexed
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (realTimeReports) {
      interval = setInterval(() => {
        refetchCollection();
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [realTimeReports, refetchCollection]);

  return {
    collections,
    deleteCollection,
    addCollection,
    updateCollection,
    reloadNeeded,
    refetchCollection,
    handleNotification,
  };
}

export default useCollection;
