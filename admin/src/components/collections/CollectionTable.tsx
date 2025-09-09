import {
  Box,
  Button,
  Flex,
  Grid,
  Typography,
  EmptyStateLayout,
  ProgressBar,
} from '@strapi/design-system';
import { Plus, Database, Cross } from '@strapi/icons';
import { private_useAutoReloadOverlayBlocker, useFetchClient } from '@strapi/strapi/admin';

import { memo, useEffect, useState } from 'react';

import useCollection from '../../hooks/useCollection';
import { PLUGIN_ID } from '../../pluginId';
import CollectionColumn from './CollectionColumn';
import { serverRestartWatcher } from '../../utils/serverRestartWatcher';
import { SkeletonCard } from './CardSkeleton';

const Collection = () => {
  const {
    collections,
    deleteCollection,
    addCollection,
    updateCollection,
    reloadNeeded,
    refetchCollection,
  } = useCollection();
  const { lockAppWithAutoreload, unlockAppWithAutoreload } = private_useAutoReloadOverlayBlocker();
  const { get } = useFetchClient();

  const [reload, setReload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  /**
   * Reload the servers and wait for the server to be reloaded.
   */
  const reloadServer = async () => {
    try {
      lockAppWithAutoreload();
      await get(`/${PLUGIN_ID}/reload`);
      await serverRestartWatcher(true);
      setReload(false);
    } catch (err) {
      console.error(err);
    } finally {
      unlockAppWithAutoreload();
      refetchCollection();
    }
  };

  useEffect(() => {
    if (reload) reloadServer();
  }, [reload]);

  // Automatically reload when needed
  useEffect(() => {
    if (reloadNeeded) {
      setReload(true);
    }
  }, [reloadNeeded]);

  useEffect(() => {
    if (collections !== undefined) {
      if (!hasInitialLoad) {
        setTimeout(() => {
          setIsLoading(false);
          setHasInitialLoad(true);
        }, 500);
      } else {
        setIsLoading(false);
      }
    }
  }, [collections, hasInitialLoad]);

  return (
    <Box background="neutral0" padding={8}>
      {isLoading ? (
        <Box
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '24px',
            alignItems: 'flex-start',
          }}
        >
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </Box>
      ) : collections.length > 0 ? (
        <Box
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '24px',
            alignItems: 'flex-start',
          }}
        >
          {collections.map((collection) => (
            <Box
              key={collection.contentType}
              background="neutral0"
              padding={6}
              borderRadius="4px"
              borderWidth="1px"
              borderStyle="solid"
              borderColor="neutral200"
              style={{
                width: '270px',
                minHeight: '400px',
                boxShadow: '0px 1px 4px rgba(33, 33, 52, 0.1)',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0px 4px 8px rgba(33, 33, 52, 0.12)';
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0px 1px 4px rgba(33, 33, 52, 0.1)';
              }}
              role="article"
              aria-labelledby={`collection-${collection.contentType}-title`}
            >
              <Box textAlign="center" marginBottom={4}>
                <Box
                  display="inline-flex"
                  padding={4}
                  background={collection.indexed ? 'primary100' : 'neutral100'}
                  borderRadius="4px"
                  justifyContent="center"
                  alignItems="center"
                  width="64px"
                  height="64px"
                >
                  <Database
                    fill={collection.indexed ? 'primary600' : 'neutral500'}
                    width="32px"
                    height="32px"
                    aria-hidden="true"
                  />
                </Box>
              </Box>

              <Box textAlign="center" marginBottom={3}>
                <Typography
                  variant="delta"
                  fontWeight="semiBold"
                  textColor="neutral800"
                  marginBottom={1}
                  id={`collection-${collection.contentType}-title`}
                  tag="h3"
                >
                  {collection.collection}
                </Typography>
                <Typography variant="pi" textColor="neutral600" fontWeight="regular">
                  {collection.indexUid && collection.indexUid.length > 0
                    ? collection.indexUid
                    : 'Default Index'}
                </Typography>
              </Box>

              <Box textAlign="center" marginBottom={3}>
                <Flex justifyContent="center" gap={2} wrap="wrap">
                  <Box
                    padding={1}
                    paddingLeft={3}
                    paddingRight={3}
                    borderRadius="4px"
                    background={collection.indexed ? 'success100' : 'neutral150'}
                    role="status"
                    aria-label={`Collection status: ${collection.indexed ? 'Active' : 'Inactive'}`}
                  >
                    <Typography
                      variant="pi"
                      textColor={collection.indexed ? 'success700' : 'neutral600'}
                      fontWeight="semiBold"
                    >
                      {collection.indexed ? 'Active' : 'Inactive'}
                    </Typography>
                  </Box>

                  {collection.indexed && collection.isIndexing && (
                    <Box
                      padding={1}
                      paddingLeft={3}
                      paddingRight={3}
                      borderRadius="4px"
                      background="warning100"
                      role="status"
                      aria-label="Currently indexing"
                    >
                      <Typography variant="pi" textColor="warning700" fontWeight="semiBold">
                        Indexing...
                      </Typography>
                    </Box>
                  )}
                </Flex>
              </Box>

              <Box marginBottom={4}>
                <Typography
                  variant="pi"
                  textColor="neutral600"
                  fontWeight="medium"
                  textAlign="center"
                  marginBottom={2}
                  tag="div"
                >
                  Indexed Documents
                </Typography>
                <Typography
                  variant="delta"
                  textColor="neutral800"
                  fontWeight="semiBold"
                  textAlign="center"
                  tag="div"
                  role="status"
                  aria-label={`${collection.indexed ? collection.numberOfEntries : 0} documents indexed`}
                >
                  {collection.indexed
                    ? `${collection.numberOfEntries} / ${collection.numberOfEntries}`
                    : `0 / ${collection.numberOfEntries}`}
                </Typography>
              </Box>

              <Box height="1px" background="neutral150" marginBottom={4} role="separator" />

              <Box>
                <CollectionColumn
                  entry={collection}
                  deleteCollection={deleteCollection}
                  addCollection={addCollection}
                  updateCollection={updateCollection}
                />
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <EmptyStateLayout
          icon={<Database fill="neutral500" width="32px" height="32px" aria-hidden="true" />}
        />
      )}
    </Box>
  );
};

export default memo(Collection);
