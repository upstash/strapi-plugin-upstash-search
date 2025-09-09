export const PERMISSIONS = {
  main: [
    { action: 'plugin::upstash-search.read', subject: null },
    { action: 'plugin::upstash-search.collections.create', subject: null },
    { action: 'plugin::upstash-search.collections.update', subject: null },
    { action: 'plugin::upstash-search.collections.delete', subject: null },
    { action: 'plugin::upstash-search.settings.edit', subject: null },
  ],
  collections: [
    { action: 'plugin::upstash-search.read', subject: null },
    { action: 'plugin::upstash-search.collections.create', subject: null },
    { action: 'plugin::upstash-search.collections.update', subject: null },
    { action: 'plugin::upstash-search.collections.delete', subject: null },
  ],
  settings: [
    { action: 'plugin::upstash-search.read', subject: null },
    { action: 'plugin::upstash-search.settings.edit', subject: null },
  ],
  read: [{ action: 'plugin::upstash-search.read', subject: null }],
  create: [{ action: 'plugin::upstash-search.collections.create', subject: null }],
  update: [{ action: 'plugin::upstash-search.collections.update', subject: null }],
  delete: [{ action: 'plugin::upstash-search.collections.delete', subject: null }],
  settingsEdit: [{ action: 'plugin::upstash-search.settings.edit', subject: null }],
  createAndDelete: [
    { action: 'plugin::upstash-search.collections.create', subject: null },
    { action: 'plugin::upstash-search.collections.delete', subject: null },
  ],
};
