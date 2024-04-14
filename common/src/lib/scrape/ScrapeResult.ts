import { LibrarySource } from '../storage/LibrarySource';

import { ScraperHelpers } from './ScraperHelpers';

export type ScrapeResult = {
  data?: string[];
  allURLs?: Record<string, string[]>;
  allPosts?: Record<string, string>;
  weight?: string;
  helpers?: ScraperHelpers;
  source?: LibrarySource;
  timeout?: number;
  systemMessage?: string;
  captcha?: string;
  warning?: string;
  error?: string;
};
