import { SystemConstants } from '../SystemConstants';
import {
  BT,
  EA,
  GO,
  HTF,
  IF,
  IT,
  OF,
  OT,
  RP,
  SC,
  SL,
  SOF,
  STF,
  TF,
  VO,
  VTF,
  WF,
} from '../const';
import { copy, urlToPath } from '../utils';

import { type Audio } from './Audio';
import { newAudio } from './Audio';
import { type AudioPlaylist } from './AudioPlaylist';
import { newCaptionScript } from './CaptionScript';
import { type LibrarySource } from './LibrarySource';
import { type Overlay } from './Overlay';
import { newOverlay } from './Overlay';
import { type ScriptPlaylist } from './ScriptPlaylist';
import { type WeightGroup } from './WeightGroup';

export type Scene = {
  id: number;
  name: string;
  sources: LibrarySource[];
  useWeights: boolean;

  timingFunction: string;
  timingConstant: number;
  timingMin: number;
  timingMax: number;
  timingSinRate: number;
  timingBPMMulti: number;
  backForth: boolean;
  backForthTF: string;
  backForthConstant: number;
  backForthMin: number;
  backForthMax: number;
  backForthSinRate: number;
  backForthBPMMulti: number;
  imageType: string;
  backgroundType: string;
  backgroundColor: string;
  backgroundColorSet: string[];
  backgroundBlur: number;

  imageTypeFilter: string;
  fullSource: boolean;
  imageOrientation: string;
  gifOption: string;
  gifTimingConstant: number;
  gifTimingMin: number;
  gifTimingMax: number;
  videoOrientation: string;
  videoOption: string;
  videoTimingConstant: number;
  videoTimingMin: number;
  videoTimingMax: number;
  videoSpeed: number;
  videoRandomSpeed: boolean;
  videoSpeedMin: number;
  videoSpeedMax: number;
  videoSkip: number;
  randomVideoStart: boolean;
  continueVideo: boolean;
  playVideoClips: boolean;
  skipVideoStart: number;
  skipVideoEnd: number;
  videoVolume: number;
  weightFunction: string;
  sourceOrderFunction: string;
  forceAllSource: boolean;
  orderFunction: string;
  forceAll: boolean;

  zoom: boolean;
  zoomRandom: boolean;
  zoomStart: number;
  zoomStartMin: number;
  zoomStartMax: number;
  zoomEnd: number;
  zoomEndMin: number;
  zoomEndMax: number;
  horizTransType: string;
  horizTransLevel: number;
  horizTransLevelMin: number;
  horizTransLevelMax: number;
  horizTransRandom: boolean;
  vertTransType: string;
  vertTransLevel: number;
  vertTransLevelMin: number;
  vertTransLevelMax: number;
  vertTransRandom: boolean;
  transTF: string;
  transDuration: number;
  transDurationMin: number;
  transDurationMax: number;
  transSinRate: number;
  transBPMMulti: number;
  transEase: string;
  transExp: number;
  transAmp: number;
  transPer: number;
  transOv: number;

  crossFade: boolean;
  crossFadeAudio: boolean;
  fadeTF: string;
  fadeDuration: number;
  fadeDurationMin: number;
  fadeDurationMax: number;
  fadeSinRate: number;
  fadeBPMMulti: number;
  fadeEase: string;
  fadeExp: number;
  fadeAmp: number;
  fadePer: number;
  fadeOv: number;

  slide: boolean;
  slideTF: string;
  slideType: string;
  slideDistance: number;
  slideDuration: number;
  slideDurationMin: number;
  slideDurationMax: number;
  slideSinRate: number;
  slideBPMMulti: number;
  slideEase: string;
  slideExp: number;
  slideAmp: number;
  slidePer: number;
  slideOv: number;

  strobe: boolean;
  strobePulse: boolean;
  strobeLayer: string;
  strobeOpacity: number;
  strobeTF: string;
  strobeTime: number;
  strobeTimeMin: number;
  strobeTimeMax: number;
  strobeSinRate: number;
  strobeBPMMulti: number;
  strobeDelayTF: string;
  strobeDelay: number;
  strobeDelayMin: number;
  strobeDelayMax: number;
  strobeDelaySinRate: number;
  strobeDelayBPMMulti: number;
  strobeColorType: string;
  strobeColor: string;
  strobeColorSet: string[];
  strobeEase: string;
  strobeExp: number;
  strobeAmp: number;
  strobePer: number;
  strobeOv: number;

  fadeInOut: boolean;
  fadeIOPulse: boolean;
  fadeIOTF: string;
  fadeIODuration: number;
  fadeIODurationMin: number;
  fadeIODurationMax: number;
  fadeIOSinRate: number;
  fadeIOBPMMulti: number;
  fadeIODelayTF: string;
  fadeIODelay: number;
  fadeIODelayMin: number;
  fadeIODelayMax: number;
  fadeIODelaySinRate: number;
  fadeIODelayBPMMulti: number;
  fadeIOStartEase: string;
  fadeIOStartExp: number;
  fadeIOStartAmp: number;
  fadeIOStartPer: number;
  fadeIOStartOv: number;
  fadeIOEndEase: string;
  fadeIOEndExp: number;
  fadeIOEndAmp: number;
  fadeIOEndPer: number;
  fadeIOEndOv: number;

  panning: boolean;
  panTF: string;
  panDuration: number;
  panDurationMin: number;
  panDurationMax: number;
  panSinRate: number;
  panBPMMulti: number;
  panHorizTransType: string;
  panHorizTransImg: boolean;
  panHorizTransLevel: number;
  panHorizTransLevelMax: number;
  panHorizTransLevelMin: number;
  panHorizTransRandom: boolean;
  panVertTransType: string;
  panVertTransImg: boolean;
  panVertTransLevel: number;
  panVertTransLevelMax: number;
  panVertTransLevelMin: number;
  panVertTransRandom: boolean;
  panStartEase: string;
  panStartExp: number;
  panStartAmp: number;
  panStartPer: number;
  panStartOv: number;
  panEndEase: string;
  panEndExp: number;
  panEndAmp: number;
  panEndPer: number;
  panEndOv: number;

  overrideIgnore: boolean;
  gridScene: boolean;
  scriptScene: boolean;
  downloadScene: boolean;
  generatorMax: number;
  overlayEnabled: boolean;
  overlays: Overlay[];
  nextSceneID: number;
  nextSceneTime: number;
  nextSceneAllImages: boolean;
  persistAudio: boolean;
  persistText: boolean;
  nextSceneRandomID: number;
  nextSceneRandoms: number[];
  libraryID: number;
  audioScene: boolean;
  audioEnabled: boolean;
  audioPlaylists: AudioPlaylist[];
  audioStartIndex: number;
  textEnabled: boolean;
  scriptPlaylists: ScriptPlaylist[];
  scriptStartIndex: number;
  regenerate: boolean;
  generatorWeights?: WeightGroup[];
  openTab: number;

  // unused; migration only
  effectLevel?: number;
  textKind?: string;
  audioURL?: string;
  overlaySceneID?: number;
  overlaySceneOpacity?: number;
  transFull?: boolean;
  fadeFull?: boolean;
  playFullGif?: boolean;
  playFullVideo?: boolean;
  gridView?: boolean;
  grid?: number[][];
  tagWeights?: string;
  sceneWeights?: string;
  audios?: Audio[];
  textSource?: string;
  textEndStop?: boolean;
  textNextScene?: boolean;
  blinkColor?: string;
  blinkFontSize?: number;
  blinkFontFamily?: string;
  blinkBorder?: boolean;
  blinkBorderpx?: number;
  blinkBorderColor?: string;
  captionColor?: string;
  captionFontSize?: number;
  captionFontFamily?: string;
  captionBorder?: boolean;
  captionBorderpx?: number;
  captionBorderColor?: string;
  captionBigColor?: string;
  captionBigFontSize?: number;
  captionBigFontFamily?: string;
  captionBigBorder?: boolean;
  captionBigBorderpx?: number;
  captionBigBorderColor?: string;
  countColor?: string;
  countFontSize?: number;
  countFontFamily?: string;
  countBorder?: boolean;
  countBorderpx?: number;
  countBorderColor?: string;
  rotatePortrait?: boolean;
};

export const initialScene: Scene = {
  id: 0,
  name: 'Unnamed scene',
  sources: [],
  useWeights: false,
  timingFunction: TF.constant,
  timingConstant: 1000,
  timingMin: 200,
  timingMax: 1200,
  timingSinRate: 100,
  timingBPMMulti: 10,
  backForth: false,
  backForthTF: TF.constant,
  backForthConstant: 1000,
  backForthMin: 200,
  backForthMax: 1200,
  backForthSinRate: 100,
  backForthBPMMulti: 10,
  imageType: IT.fitBestNoClip,
  backgroundType: BT.blur,
  backgroundColor: '#000000',
  backgroundColorSet: [],
  backgroundBlur: 8,
  imageTypeFilter: IF.any,
  fullSource: false,
  imageOrientation: OT.original,
  gifOption: GO.none,
  gifTimingConstant: 3000,
  gifTimingMin: 1000,
  gifTimingMax: 3000,
  videoOrientation: OT.original,
  videoOption: VO.none,
  videoTimingConstant: 3000,
  videoTimingMin: 1000,
  videoTimingMax: 3000,
  videoSpeed: 10,
  videoRandomSpeed: false,
  videoSpeedMin: 5,
  videoSpeedMax: 20,
  videoSkip: 10,
  randomVideoStart: false,
  continueVideo: false,
  playVideoClips: true,
  skipVideoStart: 0,
  skipVideoEnd: 0,
  videoVolume: 0,
  weightFunction: WF.sources,
  sourceOrderFunction: SOF.random,
  forceAllSource: false,
  orderFunction: OF.random,
  forceAll: false,
  zoom: false,
  zoomRandom: false,
  zoomStart: 1,
  zoomStartMin: 0.5,
  zoomStartMax: 1,
  zoomEnd: 2,
  zoomEndMin: 1.5,
  zoomEndMax: 2,
  horizTransType: HTF.none,
  horizTransLevel: 10,
  horizTransLevelMin: 5,
  horizTransLevelMax: 10,
  horizTransRandom: false,
  vertTransType: VTF.none,
  vertTransLevel: 10,
  vertTransLevelMin: 5,
  vertTransLevelMax: 10,
  vertTransRandom: false,
  transTF: TF.constant,
  transDuration: 5000,
  transDurationMin: 1000,
  transDurationMax: 7000,
  transSinRate: 100,
  transBPMMulti: 10,
  transEase: EA.linear,
  transExp: 6,
  transAmp: 20,
  transPer: 6,
  transOv: 3,
  crossFade: false,
  crossFadeAudio: false,
  fadeTF: TF.constant,
  fadeDuration: 500,
  fadeDurationMin: 100,
  fadeDurationMax: 700,
  fadeSinRate: 100,
  fadeBPMMulti: 10,
  fadeEase: EA.linear,
  fadeExp: 6,
  fadeAmp: 20,
  fadePer: 6,
  fadeOv: 3,
  slide: false,
  slideTF: TF.constant,
  slideType: STF.left,
  slideDistance: 100,
  slideDuration: 500,
  slideDurationMin: 100,
  slideDurationMax: 700,
  slideSinRate: 100,
  slideBPMMulti: 10,
  slideEase: EA.linear,
  slideExp: 6,
  slideAmp: 20,
  slidePer: 6,
  slideOv: 3,
  strobe: false,
  strobePulse: false,
  strobeLayer: SL.top,
  strobeOpacity: 1,
  strobeTF: TF.constant,
  strobeTime: 200,
  strobeTimeMin: 100,
  strobeTimeMax: 300,
  strobeSinRate: 100,
  strobeBPMMulti: 10,
  strobeDelayTF: TF.constant,
  strobeDelay: 200,
  strobeDelayMin: 100,
  strobeDelayMax: 300,
  strobeDelaySinRate: 100,
  strobeDelayBPMMulti: 10,
  strobeColorType: SC.color,
  strobeColor: '#FFFFFF',
  strobeColorSet: [],
  strobeEase: EA.linear,
  strobeExp: 6,
  strobeAmp: 20,
  strobePer: 6,
  strobeOv: 3,
  fadeInOut: false,
  fadeIOPulse: false,
  fadeIOTF: TF.constant,
  fadeIODuration: 2000,
  fadeIODurationMin: 2000,
  fadeIODurationMax: 5000,
  fadeIOSinRate: 100,
  fadeIOBPMMulti: 10,
  fadeIODelayTF: TF.constant,
  fadeIODelay: 2000,
  fadeIODelayMin: 2000,
  fadeIODelayMax: 5000,
  fadeIODelaySinRate: 100,
  fadeIODelayBPMMulti: 10,
  fadeIOStartEase: EA.linear,
  fadeIOStartExp: 6,
  fadeIOStartAmp: 20,
  fadeIOStartPer: 6,
  fadeIOStartOv: 3,
  fadeIOEndEase: EA.linear,
  fadeIOEndExp: 6,
  fadeIOEndAmp: 20,
  fadeIOEndPer: 6,
  fadeIOEndOv: 3,
  panning: false,
  panTF: TF.constant,
  panDuration: 2000,
  panDurationMin: 2000,
  panDurationMax: 5000,
  panSinRate: 100,
  panBPMMulti: 10,
  panHorizTransType: HTF.none,
  panHorizTransImg: false,
  panHorizTransLevel: 10,
  panHorizTransLevelMax: 10,
  panHorizTransLevelMin: 5,
  panHorizTransRandom: false,
  panVertTransType: VTF.none,
  panVertTransImg: false,
  panVertTransLevel: 10,
  panVertTransLevelMax: 10,
  panVertTransLevelMin: 5,
  panVertTransRandom: false,
  panStartEase: EA.linear,
  panStartExp: 6,
  panStartAmp: 20,
  panStartPer: 6,
  panStartOv: 3,
  panEndEase: EA.linear,
  panEndExp: 6,
  panEndAmp: 20,
  panEndPer: 6,
  panEndOv: 3,
  overrideIgnore: false,
  gridScene: false,
  scriptScene: false,
  downloadScene: false,
  generatorMax: 100,
  overlayEnabled: false,
  overlays: [],
  nextSceneID: 0,
  nextSceneTime: 900000,
  nextSceneAllImages: false,
  persistAudio: false,
  persistText: false,
  nextSceneRandomID: 0,
  nextSceneRandoms: [],
  libraryID: -1,
  audioScene: false,
  audioEnabled: false,
  audioPlaylists: [],
  audioStartIndex: 0,
  textEnabled: false,
  scriptPlaylists: [],
  scriptStartIndex: 0,
  regenerate: true,
  openTab: 3,
};

export function newScene(context: SystemConstants, init?: Partial<Scene>) {
  const scene = Object.assign(copy<Scene>(initialScene), init);
  scene.sources = scene.sources.filter((d) => !!d);

  if (scene.gridView) {
    scene.gridView = false;
  }
  if (scene.grid) {
    scene.grid = undefined;
  }

  if (
    !scene.transDuration &&
    scene.effectLevel != null &&
    scene.effectLevel !== 0
  ) {
    scene.transDuration = scene.effectLevel * 1000;
    scene.effectLevel = 0;
  }
  if (!!scene.overlaySceneID && scene.overlaySceneID !== 0) {
    const opacity =
      scene.overlaySceneOpacity != null
        ? scene.overlaySceneOpacity * 100
        : undefined;

    scene.overlays.push(
      newOverlay({
        sceneID: scene.overlaySceneID,
        opacity,
      })
    );
    scene.overlaySceneID = 0;
  }

  if (scene.audioURL && scene.audioURL !== '') {
    const audio = newAudio({ url: scene.audioURL });
    if (scene.audios == null) {
      scene.audios = [audio];
    } else {
      scene.audios.push(audio);
    }

    scene.audioURL = '';
  }

  if (typeof scene.timingConstant === 'string') {
    scene.timingConstant = parseInt(scene.timingConstant);
  }

  if (scene.timingFunction === 'tf.variableFaster') {
    scene.timingFunction = TF.sin;
    scene.timingMin = 0;
    scene.timingMax = 600;
  } else if (scene.timingFunction === 'tf.variableMedium') {
    scene.timingFunction = TF.sin;
    scene.timingMin = 3000;
    scene.timingMax = 5000;
  } else if (scene.timingFunction === 'tf.variableSlow') {
    scene.timingFunction = TF.sin;
    scene.timingMin = 3500;
    scene.timingMax = 6500;
  } else if (scene.timingFunction === 'tf.variableSlower') {
    scene.timingFunction = TF.sin;
    scene.timingMin = 10000;
    scene.timingMax = 20000;
  } else if (scene.timingFunction === 'tf.variableSlowest') {
    scene.timingFunction = TF.sin;
    scene.timingMin = 30000;
    scene.timingMax = 60000;
  } else if (scene.timingFunction === 'at.random') {
    scene.timingFunction = 'tf.random';
  } else if (scene.timingFunction === 'at.sin') {
    scene.timingFunction = 'tf.sin';
  }

  if (scene.transFull) {
    scene.transTF = TF.scene;
    scene.transFull = false;
  }

  if (scene.fadeFull) {
    scene.fadeTF = TF.scene;
    scene.fadeFull = false;
  }

  if (scene.playFullGif) {
    scene.gifOption = GO.full;
    scene.playFullGif = false;
  }

  if (scene.playFullVideo) {
    scene.videoOption = VO.full;
    scene.playFullVideo = false;
  }

  if (scene.textEndStop && scene.textNextScene) {
    scene.textEndStop = false;
    scene.textNextScene = false;
  }

  if (scene.textKind && scene.textKind === 'tot.hastebin') {
    scene.textKind = '';
    scene.textSource = 'https://hastebin.com/raw/' + scene.textSource;
  }

  if (scene.timingBPMMulti <= 0) {
    scene.timingBPMMulti = -1 * (scene.timingBPMMulti - 2);
  }
  if (scene.transBPMMulti <= 0) {
    scene.transBPMMulti = -1 * (scene.transBPMMulti - 2);
  }
  if (scene.fadeBPMMulti <= 0) {
    scene.fadeBPMMulti = -1 * (scene.fadeBPMMulti - 2);
  }
  if (scene.strobeBPMMulti <= 0) {
    scene.strobeBPMMulti = -1 * (scene.strobeBPMMulti - 2);
  }
  if (scene.strobeDelayBPMMulti <= 0) {
    scene.strobeDelayBPMMulti = -1 * (scene.strobeDelayBPMMulti - 2);
  }

  if (scene.audios) {
    scene.audioPlaylists = scene.audios
      .filter((a) => !!a.url && a.url.length)
      .map((a) => {
        if (!a.name) {
          const url = a.url ?? '';
          if (url.startsWith('http')) {
            a.name = url.substring(
              url.lastIndexOf('/') + 1,
              url.lastIndexOf('.')
            );
          } else {
            a.url = urlToPath(url, context.isWin32).replace(
              /\//g,
              context.pathSep
            );
            a.name = a.url.substring(
              a.url.lastIndexOf(context.pathSep) + 1,
              a.url.lastIndexOf('.')
            );
          }
          a.duration = 0;
        }
        return { audios: [a], shuffle: false, repeat: RP.all };
      });
    scene.audios = undefined;
  }

  if (scene.textSource && scene.textSource.length > 0) {
    const newScripts = [
      newCaptionScript({
        url: scene.textSource,
        stopAtEnd: scene.textEndStop,
        nextSceneAtEnd: scene.textNextScene,
        blink: {
          color: scene.blinkColor ?? '',
          fontSize: scene.blinkFontSize ?? 0,
          fontFamily: scene.blinkFontFamily ?? '',
          border: scene.blinkBorder ?? false,
          borderpx: scene.blinkBorderpx ?? 0,
          borderColor: scene.blinkBorderColor ?? '',
        },
        caption: {
          color: scene.captionColor ?? '',
          fontSize: scene.captionFontSize ?? 0,
          fontFamily: scene.captionFontFamily ?? '',
          border: scene.captionBorder ?? false,
          borderpx: scene.captionBorderpx ?? 0,
          borderColor: scene.captionBorderColor ?? '',
        },
        captionBig: {
          color: scene.captionBigColor ?? '',
          fontSize: scene.captionBigFontSize ?? 0,
          fontFamily: scene.captionBigFontFamily ?? '',
          border: scene.captionBigBorder ?? false,
          borderpx: scene.captionBigBorderpx ?? 0,
          borderColor: scene.captionBigBorderColor ?? '',
        },
        count: {
          color: scene.countColor ?? '',
          fontSize: scene.countFontSize ?? 0,
          fontFamily: scene.countFontFamily ?? '',
          border: scene.countBorder ?? false,
          borderpx: scene.countBorderpx ?? 0,
          borderColor: scene.countBorderColor ?? '',
        },
      }),
    ];
    scene.scriptPlaylists = [
      { scripts: newScripts, shuffle: false, repeat: RP.all },
    ];
    scene.textSource = undefined;
    scene.textEndStop = undefined;
    scene.textNextScene = undefined;
    scene.blinkColor = undefined;
    scene.blinkFontSize = undefined;
    scene.blinkFontFamily = undefined;
    scene.blinkBorder = undefined;
    scene.blinkBorderpx = undefined;
    scene.blinkBorderColor = undefined;
    scene.captionColor = undefined;
    scene.captionFontSize = undefined;
    scene.captionFontFamily = undefined;
    scene.captionBorder = undefined;
    scene.captionBorderpx = undefined;
    scene.captionBorderColor = undefined;
    scene.captionBigColor = undefined;
    scene.captionBigFontSize = undefined;
    scene.captionBigFontFamily = undefined;
    scene.captionBigBorder = undefined;
    scene.captionBigBorderpx = undefined;
    scene.captionBigBorderColor = undefined;
    scene.countColor = undefined;
    scene.countFontSize = undefined;
    scene.countFontFamily = undefined;
    scene.countBorder = undefined;
    scene.countBorderpx = undefined;
    scene.countBorderColor = undefined;
  }
  for (const playlist of scene.scriptPlaylists) {
    for (const script of playlist.scripts) {
      if (isNaN(script.opacity)) {
        script.opacity = 100;
      }
    }
  }

  if (scene.rotatePortrait) {
    scene.videoOrientation = OT.forceLandscape;
    scene.rotatePortrait = false;
  }

  if (scene.generatorWeights) {
    for (const wg of scene.generatorWeights) {
      if (wg.tag != null) {
        if (wg.tag.typeTag) {
          wg.search = '{' + wg.tag.name + '}';
        } else {
          wg.search = '[' + wg.tag.name + ']';
        }
        wg.tag = undefined;
      }
      if (wg.rules) {
        for (const wgr of wg.rules) {
          if (wgr.tag != null) {
            if (wgr.tag.typeTag) {
              wgr.search = '{' + wgr.tag.name + '}';
            } else {
              wgr.search = '[' + wgr.tag.name + ']';
            }
            wgr.tag = undefined;
          }
        }
      }
    }
  }

  return scene;
}
