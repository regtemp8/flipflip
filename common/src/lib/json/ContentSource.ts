export type ContentSource = {
  id: number;
  url: string;
  type: string;
  offline: boolean;
  marked: boolean;
  lastCheck?: number;
  tags: number[]; // Array of Tag IDs
  clips: number[]; // Array of Clip IDs
  disabledClips: number[]; // Array of Clip IDs
  blacklist: string[];
  count: number;
  countComplete: boolean;
  weight: number;
  fileUrl: string;

  // Type specific properties
  // Local
  dirOfSources: boolean;
  // Video
  subtitleFile?: string;
  duration?: number;
  resolution?: number;
  // Reddit
  redditFunc?: string;
  redditTime?: string;
};
