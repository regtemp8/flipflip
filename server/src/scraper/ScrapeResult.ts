import { ContentSource, ScraperHelpers } from 'flipflip-common';

export type ScrapeResult = {
  data?: string[];
  allURLs?: Record<string, string[]>;
  allPosts?: Record<string, string>;
  weight?: string;
  helpers?: ScraperHelpers;
  source?: ContentSource;
  timeout?: number;
  systemMessage?: string;
  captcha?: string;
  warning?: string;
  error?: string;
};
