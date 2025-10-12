import { SelectOption } from './SelectOption';

export type SceneSelectOption = {
  hasSources: boolean;
  hasValidWeights: boolean;
} & SelectOption;
