import { Box, Button, Field, Typography, Link } from '@strapi/design-system';
import React, { memo } from 'react';
import { useCredential } from '../../hooks/useCredential';
import { PERMISSIONS } from '../../constants';
import { useRBAC } from '@strapi/strapi/admin';

const Credentials = () => {
  const { host, apiKey, setHost, setApiKey, updateCredentials } = useCredential();
  const {
    allowedActions: { canEdit },
  } = useRBAC(PERMISSIONS.settingsEdit);

  return (
    <Box>
      <Box padding={2}>
        <Field.Root id="host">
          <Field.Label>URL</Field.Label>
          <Field.Input
            type="text"
            name="host"
            value={host}
            placeholder="UPSTASH_SEARCH_REST_URL"
            onChange={(e: any) => setHost(e.target.value)}
          />
        </Field.Root>
      </Box>
      <Box padding={2}>
        <Field.Root id="apiKey">
          <Field.Label>Token</Field.Label>
          <Field.Input
            type="password"
            name="apiKey"
            placeholder="UPSTASH_SEARCH_REST_TOKEN"
            value={apiKey}
            onChange={(e: any) => setApiKey(e.target.value)}
          />
        </Field.Root>
      </Box>
      <Box paddingTop={1} paddingLeft={2}>
        <Typography variant="pi" style={{ color: 'neutral600' }}>
          You can find these credentials in Upstash console Search tab.
          <Link isExternal href="https://upstash.com/docs/search/overall/getstarted">
            <Typography variant="pi" style={{ color: 'neutral600', marginLeft: '6px' }}>
              {' '}
              Check out docs
            </Typography>
          </Link>
        </Typography>
      </Box>

      <Box paddingTop={2} paddingLeft={2} paddingRight={2} paddingBottom={2}>
        {canEdit && (
          <Button variant="secondary" onClick={() => updateCredentials()}>
            Save Credentials
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default memo(Credentials);
