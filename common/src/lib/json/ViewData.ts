export type BackgroundStyle = {
  backgroundColor?: string;
  filter?: string;
  overflow?: 'hidden';
};

export type ViewVideoData = {
  url: string;
  volume: number;
  speed: number;
  start: number;
  end: number;
  playStart: number;
  playEnd: number;
};

export type ViewData = {
  timeToNextFrame: number;
  video?: ViewVideoData;
  imageType: string;
  backgroundType: string;
  backgroundStyle?: BackgroundStyle;
};
