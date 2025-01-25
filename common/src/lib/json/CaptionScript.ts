export type CaptionScript = {
  id: number;
  url: string;
  type: string;
  script?: string;
  marked: boolean;
  tags: number[]; // Array of Tag IDs
  opacity: number;
  stopAtEnd: boolean;
  nextSceneAtEnd: boolean;
  syncWithAudio: boolean;
  fileUrl: string;
};
