import { Search } from '@upstash/search';

type Config = {
  url: string;
  token: string;
};

export default (config: Config) => {
  return new Search({
    ...config,
  });
};
