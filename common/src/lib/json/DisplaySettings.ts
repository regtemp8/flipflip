export type DisplaySettings = {
  fullScreen: boolean;
  clickToProgress: boolean;
  clickToProgressWhilePlaying: boolean;
  startImmediately: boolean;
  easingControls: boolean;
  audioAlert: boolean;

  minImageSize: number;
  minVideoSize: number;
  maxInMemory: number;
  maxInHistory: number;
  maxLoadingAtOnce: number;

  ignoredTags: string[];
};
