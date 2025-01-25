export type Audio = {
  id: number;
  url: string;
  type: string;
  marked: boolean;
  tags: number[]; // Array of Tag IDs
  volume: number;
  speed: number;
  stopAtEnd: boolean;
  nextSceneAtEnd: boolean;
  tick: boolean;
  tickMode: string;
  tickDelay: number;
  tickMinDelay: number;
  tickMaxDelay: number;
  tickSinRate: number;
  tickBPMMulti: number;
  bpm: number;
  thumb?: string;
  name?: string;
  artist?: string;
  album?: string;
  trackNum?: number;
  duration?: number;
  comment?: string;
  playedCount: number;
  fileUrl: string;
};
