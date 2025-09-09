import { Box, Tabs } from '@strapi/design-system';
import { useRBAC } from '@strapi/strapi/admin';

import { PERMISSIONS } from '../constants';
import { CollectionTable } from './collections';
import { Settings } from './settings';

const PluginTabs = () => {
  const { allowedActions: allowedActionsCollection } = useRBAC(PERMISSIONS.collections);
  const { allowedActions: allowedActionsSettings } = useRBAC(PERMISSIONS.settings);

  const canSeeCollections = Object.values(allowedActionsCollection).some((value) => !!value);
  const canSeeSettings = Object.values(allowedActionsSettings).some((value) => !!value);

  return (
    <Tabs.Root defaultValue="collections">
      <Tabs.List>
        <Tabs.Trigger value="collections">{'Collections'}</Tabs.Trigger>
        <Tabs.Trigger value="credentials">{'Credentials'}</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="collections">
        {canSeeCollections && (
          <Box color="neutral800" padding={4} background="neutral0">
            <CollectionTable />
          </Box>
        )}
      </Tabs.Content>
      <Tabs.Content value="credentials">
        {canSeeSettings && (
          <Box color="neutral800" padding={4} background="neutral0">
            <Settings />
          </Box>
        )}
      </Tabs.Content>
    </Tabs.Root>
  );
};

export default PluginTabs;
