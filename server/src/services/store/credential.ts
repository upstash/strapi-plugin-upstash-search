import type { Store } from './store';

type Credentials = {
  host: string;
  apiKey: string;
};

const createCredentialStore = ({ store }: { store: Store }) => ({
  getApiKey: async function () {
    return store.getStoreKey({ key: 'upstash_search_api_key' }) as Promise<string>;
  },

  setApiKey: async function (apiKey: string) {
    return store.setStoreKey({
      key: 'upstash_search_api_key',
      value: apiKey || '',
    });
  },

  getHost: async function () {
    return store.getStoreKey({ key: 'upstash_search_host' }) as Promise<string>;
  },

  setHost: async function (value: string) {
    return store.setStoreKey({ key: 'upstash_search_host', value: value || '' });
  },

  addCredentials: async function ({ host, apiKey }: { host: string; apiKey: string }) {
    await this.setApiKey(apiKey || '');

    await this.setHost(host || '');

    return this.getCredentials();
  },

  getCredentials: async function (): Promise<Credentials> {
    const apiKey = await this.getApiKey();
    const host = await this.getHost();
    return { apiKey, host };
  },
});

export type CredentialService = ReturnType<typeof createCredentialStore>;

export default createCredentialStore;
