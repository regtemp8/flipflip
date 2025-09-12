export type ContentType = 'image' | 'video' | 'iframe';

export type ContentData = {
  url: string;
  sourceUrl?: string;
  sourceName?: string;
  postUrl?: string;
  type?: ContentType;
  error?: boolean;
  width?: number;
  height?: number;
  duration?: number;
  animated?: boolean;
  clip?: VideoClipData;
};

export type VideoClipData = {
  id: number;
  url: string;
  start: number;
  end: number;
  volume?: number;
};
