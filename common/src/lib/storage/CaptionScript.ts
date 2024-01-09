import { copy } from '../utils';

import { type FontSettings } from './FontSettings';
import { type Tag } from './Tag';

export type CaptionScript = {
  id: number;
  url?: string;
  script?: string;
  marked: boolean;
  tags: Tag[];
  opacity: number;
  stopAtEnd: boolean;
  nextSceneAtEnd: boolean;
  syncWithAudio: boolean;
  blink: FontSettings;
  caption: FontSettings;
  captionBig: FontSettings;
  count: FontSettings;
};

const initialCaptionScript: CaptionScript = {
  id: 0,
  marked: false,
  tags: [],
  opacity: 100,
  stopAtEnd: false,
  nextSceneAtEnd: false,
  syncWithAudio: true,
  blink: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Arial Black,Arial Bold,Gadget,sans-serif',
    border: false,
    borderpx: 5,
    borderColor: '#000000',
  },
  caption: {
    color: '#FFFFFF',
    fontSize: 8,
    fontFamily: 'Helvetica Neue,Helvetica,Arial,sans-serif',
    border: false,
    borderpx: 3,
    borderColor: '#000000',
  },
  captionBig: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Arial Black,Arial Bold,Gadget,sans-serif',
    border: false,
    borderpx: 4,
    borderColor: '#000000',
  },
  count: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Arial Black,Arial Bold,Gadget,sans-serif',
    border: false,
    borderpx: 5,
    borderColor: '#000000',
  },
};

export function newCaptionScript(init?: Partial<CaptionScript>) {
  const captionScript = Object.assign(
    copy<CaptionScript>(initialCaptionScript),
    init
  );

  if (captionScript.opacity == null || isNaN(captionScript.opacity)) {
    captionScript.opacity = 100;
  }

  return captionScript;
}
