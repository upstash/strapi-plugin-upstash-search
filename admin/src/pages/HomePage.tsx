import {
  BackButton,
  Layouts,
  Page,
  private_AutoReloadOverlayBlockerProvider as AutoReloadOverlayBlockerProvider,
} from '@strapi/strapi/admin';

import PluginTabs from '../components/tabs';

const HomePage = () => {
  return (
    <AutoReloadOverlayBlockerProvider>
      <Page.Main>
        <Layouts.Header
          title={'Upstash Search'}
          subtitle={'Index your content-types to Upstash Search'}
          navigationAction={<BackButton disabled={false} />}
        />
        <Layouts.Content>
          <PluginTabs />
        </Layouts.Content>
      </Page.Main>
    </AutoReloadOverlayBlockerProvider>
  );
};

export { HomePage };
