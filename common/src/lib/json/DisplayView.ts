export type DisplayView = {
  id: number;
  name: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
  visible: boolean;
  playlistID?: number;
  sync: boolean;
  syncWithView?: number;
  mirrorSyncedView: string;
  error?: string;
};
