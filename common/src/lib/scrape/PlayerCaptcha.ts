import { ContentSource } from '../json/ContentSource';
import { ScraperHelpers } from './ScraperHelpers';

export type PlayerCaptcha = {
  helpers?: ScraperHelpers;
  source?: ContentSource;
  captcha: string;
};
