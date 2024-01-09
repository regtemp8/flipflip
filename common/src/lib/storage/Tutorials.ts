export type Tutorials = {
  [key: string]: string | undefined;

  scenePicker?: string;
  sceneDetail?: string;
  sceneGenerator?: string;
  sceneGrid?: string;
  library?: string;
  audios?: string;
  scripts?: string;
  player?: string;
  scriptor?: string;
  videoClipper?: string;
};

export const initialTutorials: Tutorials = {};
