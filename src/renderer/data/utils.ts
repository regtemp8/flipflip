import * as easings from "d3-ease";
import "core-js/features/array/flat";

import { getSourceType } from "../../common/utils";
import {
  BT,
  EA,
  GO,
  HTF,
  IF,
  IT,
  OF,
  OT,
  SC,
  SL,
  SOF,
  ST,
  STF,
  TF,
  TT,
  VO,
  VTF,
  WF,
} from "../../common/const";
import en from "../../common/en";
import LibrarySource from "../../common/LibrarySource";
import Audio from "../../common/Audio";
import WeightGroup from "../../common/WeightGroup";
import Scene from "../../common/Scene";
import Clip from "../../common/Clip";

export function flatten(array: Array<any>) {
  return array.flat(1);
}

export function getEaseFunction(
  ea: string,
  exp: number,
  amp: number,
  per: number,
  ov: number,
) {
  switch (ea) {
    case EA.linear:
      return easings.easeLinear;
    case EA.sinIn:
      return easings.easeSinIn;
    case EA.sinOut:
      return easings.easeSinOut;
    case EA.sinInOut:
      return easings.easeSinInOut;
    case EA.expIn:
      return easings.easeExpIn;
    case EA.expOut:
      return easings.easeExpOut;
    case EA.expInOut:
      return easings.easeExpInOut;
    case EA.circleIn:
      return easings.easeCircleIn;
    case EA.circleOut:
      return easings.easeCircleOut;
    case EA.circleInOut:
      return easings.easeCircleInOut;
    case EA.bounceIn:
      return easings.easeBounceIn;
    case EA.bounceOut:
      return easings.easeBounceOut;
    case EA.bounceInOut:
      return easings.easeBounceInOut;
    case EA.polyIn:
      return easings.easePolyIn.exponent(exp);
    case EA.polyOut:
      return easings.easePolyOut.exponent(exp);
    case EA.polyInOut:
      return easings.easePolyInOut.exponent(exp);
    case EA.elasticIn:
      return easings.easeElasticIn.amplitude(amp).period(per);
    case EA.elasticOut:
      return easings.easeElasticOut.amplitude(amp).period(per);
    case EA.elasticInOut:
      return easings.easeElasticInOut.amplitude(amp).period(per);
    case EA.backIn:
      return easings.easeBackIn.overshoot(ov);
    case EA.backOut:
      return easings.easeBackOut.overshoot(ov);
    case EA.backInOut:
      return easings.easeBackInOut.overshoot(ov);
  }
}

export function convertFromEpoch(backupFile: string) {
  const epochString = backupFile.substring(backupFile.lastIndexOf(".") + 1);
  const date = new Date(Number.parseInt(epochString));
  return date.toLocaleString();
}

export function getTimingFromString(tf: string): string | null {
  switch (tf) {
    case "constant":
    case "const":
      return TF.constant;
    case "random":
    case "rand":
      return TF.random;
    case "wave":
    case "sin":
      return TF.sin;
    case "bpm":
    case "audio":
      return TF.bpm;
    case "scene":
      return TF.scene;
    default:
      return null;
  }
}

export function getTimeout(
  tf: string,
  c: number,
  min: number,
  max: number,
  sinRate: number,
  bpmMulti: number,
  audio?: Audio,
  timeToNextFrame?: number,
) {
  let timeout;
  switch (tf) {
    case TF.random:
      timeout = Math.floor(Math.random() * (max - min + 1)) + min;
      break;
    case TF.sin:
      sinRate = (Math.abs(sinRate - 100) + 2) * 1000;
      timeout =
        Math.floor(Math.abs(Math.sin(Date.now() / sinRate)) * (max - min + 1)) +
        min;
      break;
    case TF.constant:
      timeout = c;
      break;
    case TF.bpm:
      if (audio) {
        timeout = 60000 / (audio.bpm * bpmMulti);
      }

      // If we cannot parse this, default to 1s
      timeout = timeout || 1000;
      break;
    case TF.scene:
      timeout = timeToNextFrame ?? 1000;
      break;
    default:
      throw new Error("Unsupported timing function: " + tf);
  }
  return timeout;
}

export function getTimestamp(secs: number): string {
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const seconds = Math.floor((secs % 3600) % 60);
  if (hours > 0) {
    return (
      hours +
      ":" +
      (minutes >= 10 ? minutes : "0" + minutes) +
      ":" +
      (seconds >= 10 ? seconds : "0" + seconds)
    );
  } else {
    return minutes + ":" + (seconds >= 10 ? seconds : "0" + seconds);
  }
}

export function getMsRemainder(sec: number): string | null {
  if (Number.isNaN(sec) || sec < 0) {
    return null;
  }

  const ms = Math.round(sec * 1000);
  let remainder = (Math.floor((ms % 1000) * 1000) / 1000).toString();
  while (remainder.length < 3) {
    remainder = "0" + remainder;
  }
  return "." + remainder;
}

export function getMsTimestampValue(value: string): number | null {
  const split = value.split(":");
  const splitInt = [];
  let milli = null;
  if (split.length > 3 || split.length == 0) return null;
  if (split[split.length - 1].includes(".")) {
    const splitMili = split[split.length - 1].split("\.");
    if (splitMili.length > 2) return null;
    split[split.length - 1] = splitMili[0];
    milli = splitMili[1];
    if (milli.length > 3) return null;
    while (milli.length < 3) {
      milli += "0";
    }
    milli = Number.parseInt(milli);
    if (Number.isNaN(milli)) return null;
  }
  for (let n = 0; n < split.length; n++) {
    if (n != 0) {
      if (split[n].length != 2) return null;
    }
    const int = Number.parseInt(split[n]);
    if (Number.isNaN(int)) return null;
    splitInt.push(int);
  }

  let ms = null;
  if (split.length == 3) {
    ms = splitInt[0] * 60 * 60 + splitInt[1] * 60 + splitInt[2];
  } else if (split.length == 2) {
    ms = splitInt[0] * 60 + splitInt[1];
  } else if (split.length == 1) {
    ms = splitInt[0];
  }
  if (ms != null) {
    ms *= 1000;
    if (milli != null) {
      ms += milli;
    }
  }

  return ms;
}

export function getTimestampValue(value: string): number | null {
  const split = value.split(":");
  const splitInt = [];
  if (split.length > 3 || split.length == 0) return null;
  for (let n = 0; n < split.length; n++) {
    if (n != 0) {
      if (split[n].length != 2) return null;
    }
    const int = Number.parseInt(split[n]);
    if (Number.isNaN(int)) return null;
    splitInt.push(int);
  }

  if (split.length == 3) {
    return splitInt[0] * 60 * 60 + splitInt[1] * 60 + splitInt[2];
  } else if (split.length == 2) {
    return splitInt[0] * 60 + splitInt[1];
  } else if (split.length == 1) {
    return splitInt[0];
  } else {
    return null;
  }
}

export function htmlEntities(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\\n/g, "<br/>");
}

export function arrayMove(arr: any[], old_index: number, new_index: number) {
  if (new_index >= arr.length) {
    let k = new_index - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
}

export function getRandomColor() {
  let letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function randomizeList(list: any[]) {
  let currentIndex = list.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = list[currentIndex];
    list[currentIndex] = list[randomIndex];
    list[randomIndex] = temporaryValue;
  }

  return list;
}

export function getRandomIndex(list: any[]) {
  return Math.floor(Math.random() * list.length);
}

export function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomListItem(list: any[], count: number = 1) {
  if (count <= 0) {
    return;
  } else if (count == 1) {
    return list[getRandomIndex(list)];
  } else {
    let newList = [];
    for (let c = 0; c < count && list.length > 0; c++) {
      newList.push(list.splice(getRandomIndex(list), 1)[0]);
    }
    return newList;
  }
}

function areRulesValid(wg: WeightGroup) {
  const orRules = wg.rules.filter((r) => r.type == TT.or);
  const weightRules = wg.rules.filter((r) => r.type == TT.weight);
  let rulesRemaining = 100;
  for (const rule of weightRules) {
    rulesRemaining = rulesRemaining - rule.percent;
  }
  return (
    wg.rules.length > 0 &&
    (orRules.length == 0 ||
      (orRules.length + weightRules.length == wg.rules.length &&
        rulesRemaining == 0) ||
      orRules.length == wg.rules.length) &&
    (rulesRemaining == 0 || (rulesRemaining == 100 && weightRules.length == 0))
  );
}

export function areWeightsValid(scene: Scene): boolean {
  if (!scene.generatorWeights) return false;
  let remaining = 100;
  const orRules = scene.generatorWeights.filter((r) => r.type == TT.or);
  const weightRules = scene.generatorWeights.filter((r) => r.type == TT.weight);
  for (const wg of scene.generatorWeights) {
    if (wg.rules) {
      const rulesValid = areRulesValid(wg);
      if (!rulesValid) return false;
    }
    if (wg.type == TT.weight) {
      remaining = remaining - wg.percent;
    }
  }
  return (
    scene.generatorWeights.length > 0 &&
    (orRules.length == 0 ||
      (orRules.length + weightRules.length == scene.generatorWeights.length &&
        remaining == 0) ||
      orRules.length == scene.generatorWeights.length) &&
    (remaining == 0 || (remaining == 100 && weightRules.length == 0))
  );
}

export function filterSource(
  filter: string,
  source: LibrarySource,
  clip?: Clip,
  mergeSources?: Array<LibrarySource>,
): boolean {
  let matchesFilter = true;
  let countRegex;
  if (filter == "<Mergeable>") {
    matchesFilter = !!mergeSources && mergeSources.includes(source);
  } else if (filter == "-<Mergeable>") {
    matchesFilter = !(!!mergeSources && mergeSources.includes(source));
  } else if (filter == "<Offline>") {
    // This is offline filter
    matchesFilter = source.offline;
  } else if (filter == "-<Offline>") {
    // This is offline filter
    matchesFilter = !source.offline;
  } else if (filter == "<Marked>") {
    // This is a marked filter
    matchesFilter = source.marked;
  } else if (filter == "-<Marked>") {
    // This is a marked filter
    matchesFilter = !source.marked;
  } else if (filter == "<Untagged>") {
    // This is untagged filter
    matchesFilter =
      clip && clip.tags && clip.tags.length > 0
        ? clip.tags.length === 0
        : source.tags.length === 0;
  } else if (filter == "-<Untagged>") {
    // This is untagged filter
    matchesFilter = !(clip && clip.tags && clip.tags.length > 0
      ? clip.tags.length === 0
      : source.tags.length === 0);
  } else if (filter == "<Unclipped>") {
    matchesFilter =
      getSourceType(source.url) == ST.video && source.clips.length === 0;
  } else if (filter == "-<Unclipped>") {
    matchesFilter = !(
      getSourceType(source.url) == ST.video && source.clips.length === 0
    );
  } else if (
    (filter.startsWith("[") || filter.startsWith("-[")) &&
    filter.endsWith("]")
  ) {
    // This is a tag filter
    let tags =
      clip && clip.tags && clip.tags.length > 0 ? clip.tags : source.tags;
    if (filter.startsWith("-")) {
      const tag = filter.substring(2, filter.length - 1);
      matchesFilter = tags.every((t) => t.name != tag);
    } else {
      const tag = filter.substring(1, filter.length - 1);
      matchesFilter = tags.some((t) => t.name == tag);
    }
  } else if (
    (filter.startsWith("{") || filter.startsWith("-{")) &&
    filter.endsWith("}")
  ) {
    // This is a type filter
    if (filter.startsWith("-")) {
      let type = filter.substring(2, filter.length - 1);
      matchesFilter = en.get(getSourceType(source.url)) != type;
    } else {
      let type = filter.substring(1, filter.length - 1);
      matchesFilter = en.get(getSourceType(source.url)) == type;
    }
  } else if ((countRegex = /^count(\+?)([>=<])(\d*)$/.exec(filter)) != null) {
    const all = countRegex[1] == "+";
    const symbol = countRegex[2];
    const value = Number.parseInt(countRegex[3]);
    const type = getSourceType(source.url);
    const count = type == ST.video ? source.clips.length : source.count;
    const countComplete = type == ST.video ? true : source.countComplete;
    switch (symbol) {
      case "=":
        matchesFilter = (all || countComplete) && count == value;
        break;
      case ">":
        matchesFilter = (all || countComplete) && count > value;
        break;
      case "<":
        matchesFilter = (all || countComplete) && count < value;
        break;
    }
  } else if ((countRegex = /^duration([>=<])([\d:]*)$/.exec(filter)) != null) {
    const type = getSourceType(source.url);
    if (type == ST.video) {
      const duration = clip ? clip.end - clip.start : source.duration;
      const value = countRegex[2].includes(":")
        ? getTimestampValue(countRegex[2])
        : Number.parseInt(countRegex[2]);

      if (duration == null || value == null) {
        matchesFilter = false;
      } else {
        const symbol = countRegex[1];
        switch (symbol) {
          case "=":
            matchesFilter = Math.floor(duration) == value;
            break;
          case ">":
            matchesFilter = Math.floor(duration) > value;
            break;
          case "<":
            matchesFilter = Math.floor(duration) < value;
            break;
        }
      }
    } else {
      matchesFilter = false;
    }
  } else if ((countRegex = /^resolution([>=<])(\d*)p?$/.exec(filter)) != null) {
    const symbol = countRegex[1];
    const value = Number.parseInt(countRegex[2]);

    const type = getSourceType(source.url);
    if (type == ST.video) {
      if (source.resolution == null) {
        matchesFilter = false;
      } else {
        switch (symbol) {
          case "=":
            matchesFilter = source.resolution == value;
            break;
          case ">":
            matchesFilter = source.resolution > value;
            break;
          case "<":
            matchesFilter = source.resolution < value;
            break;
        }
      }
    } else {
      matchesFilter = false;
    }
  } else if (
    ((filter.startsWith('"') || filter.startsWith('-"')) &&
      filter.endsWith('"')) ||
    ((filter.startsWith("'") || filter.startsWith("-'")) &&
      filter.endsWith("'"))
  ) {
    if (filter.startsWith("-")) {
      filter = filter.substring(2, filter.length - 1);
      const regex = new RegExp(filter.replace(/\\/g, "\\\\"), "i");
      matchesFilter = !regex.test(source.url);
    } else {
      filter = filter.substring(1, filter.length - 1);
      const regex = new RegExp(filter.replace(/\\/g, "\\\\"), "i");
      matchesFilter = regex.test(source.url);
    }
  } else {
    // This is a search filter
    filter = filter.replace(/\\/g, "\\\\");
    if (filter.startsWith("-")) {
      filter = filter.substring(1, filter.length);
      const regex = new RegExp(filter, "i");
      matchesFilter = !regex.test(source.url);
    } else {
      const regex = new RegExp(filter, "i");
      matchesFilter = regex.test(source.url);
    }
  }
  return matchesFilter;
}

export function getEffects(scene: Scene) {
  const effects = [
    Object.values(TF).indexOf(scene.timingFunction),
    scene.timingConstant,
    scene.timingMin,
    scene.timingMax,
    scene.timingSinRate,
    scene.timingBPMMulti,
    scene.backForth ? 1 : 0,
    Object.values(TF).indexOf(scene.backForthTF),
    scene.backForthConstant,
    scene.backForthMin,
    scene.backForthMax,
    scene.backForthSinRate,
    scene.backForthBPMMulti,
    Object.values(IT).indexOf(scene.imageType),
    Object.values(BT).indexOf(scene.backgroundType),
    scene.backgroundColor,
    scene.backgroundColorSet.join("|"),
    scene.backgroundBlur,
    // timing
    Object.values(IF).indexOf(scene.imageTypeFilter),
    scene.fullSource ? 1 : 0,
    Object.values(OT).indexOf(scene.imageOrientation),
    Object.values(GO).indexOf(scene.gifOption),
    scene.gifTimingConstant,
    scene.gifTimingMin,
    scene.gifTimingMax,
    Object.values(OT).indexOf(scene.videoOrientation),
    Object.values(VO).indexOf(scene.videoOption),
    scene.videoTimingConstant,
    scene.videoTimingMin,
    scene.videoTimingMax,
    scene.videoSpeed,
    scene.videoRandomSpeed ? 1 : 0,
    scene.videoSpeedMin,
    scene.videoSpeedMax,
    scene.randomVideoStart ? 1 : 0,
    scene.continueVideo ? 1 : 0,
    scene.playVideoClips ? 1 : 0,
    scene.skipVideoStart,
    scene.skipVideoEnd,
    scene.videoVolume,
    Object.values(WF).indexOf(scene.weightFunction),
    Object.values(SOF).indexOf(scene.sourceOrderFunction),
    scene.forceAllSource ? 1 : 0,
    Object.values(OF).indexOf(scene.orderFunction),
    scene.forceAll ? 1 : 0,
    // zoom move
    scene.zoom ? 1 : 0,
    scene.zoomRandom ? 1 : 0,
    scene.zoomStart,
    scene.zoomStartMin,
    scene.zoomStartMax,
    scene.zoomEnd,
    scene.zoomEndMin,
    scene.zoomEndMax,
    Object.values(HTF).indexOf(scene.horizTransType),
    scene.horizTransLevel,
    scene.horizTransLevelMin,
    scene.horizTransLevelMax,
    scene.horizTransRandom ? 1 : 0,
    Object.values(VTF).indexOf(scene.vertTransType),
    scene.vertTransLevel,
    scene.vertTransLevelMin,
    scene.vertTransLevelMax,
    scene.vertTransRandom ? 1 : 0,
    Object.values(TF).indexOf(scene.transTF),
    scene.transDuration,
    scene.transDurationMin,
    scene.transDurationMax,
    scene.transSinRate,
    scene.transBPMMulti,
    Object.values(EA).indexOf(scene.transEase),
    scene.transExp,
    scene.transAmp,
    scene.transPer,
    scene.transOv,
    // crossfade
    scene.crossFade ? 1 : 0,
    scene.crossFadeAudio ? 1 : 0,
    Object.values(TF).indexOf(scene.fadeTF),
    scene.fadeDuration,
    scene.fadeDurationMin,
    scene.fadeDurationMax,
    scene.fadeSinRate,
    scene.fadeBPMMulti,
    Object.values(EA).indexOf(scene.fadeEase),
    scene.fadeExp,
    scene.fadeAmp,
    scene.fadePer,
    scene.fadeOv,
    // slide
    scene.slide ? 1 : 0,
    Object.values(TF).indexOf(scene.slideTF),
    Object.values(STF).indexOf(scene.slideType),
    scene.slideDistance,
    scene.slideDuration,
    scene.slideDurationMin,
    scene.slideDurationMax,
    scene.slideSinRate,
    scene.slideBPMMulti,
    Object.values(EA).indexOf(scene.slideEase),
    scene.slideExp,
    scene.slideAmp,
    scene.slidePer,
    scene.slideOv,
    // strobe
    scene.strobe ? 1 : 0,
    scene.strobePulse ? 1 : 0,
    Object.values(SL).indexOf(scene.strobeLayer),
    scene.strobeOpacity,
    Object.values(TF).indexOf(scene.strobeTF),
    scene.strobeTime,
    scene.strobeTimeMin,
    scene.strobeTimeMax,
    scene.strobeSinRate,
    scene.strobeBPMMulti,
    Object.values(TF).indexOf(scene.strobeDelayTF),
    scene.strobeDelay,
    scene.strobeDelayMin,
    scene.strobeDelayMax,
    scene.strobeDelaySinRate,
    scene.strobeDelayBPMMulti,
    Object.values(SC).indexOf(scene.strobeColorType),
    scene.strobeColor,
    scene.strobeColorSet.join("|"),
    Object.values(EA).indexOf(scene.strobeEase),
    scene.strobeExp,
    scene.strobeAmp,
    scene.strobePer,
    scene.strobeOv,
    // fade in/out
    scene.fadeInOut ? 1 : 0,
    scene.fadeIOPulse ? 1 : 0,
    Object.values(TF).indexOf(scene.fadeIOTF),
    scene.fadeIODuration,
    scene.fadeIODurationMin,
    scene.fadeIODurationMax,
    scene.fadeIOSinRate,
    scene.fadeIOBPMMulti,
    Object.values(TF).indexOf(scene.fadeIODelayTF),
    scene.fadeIODelay,
    scene.fadeIODelayMin,
    scene.fadeIODelayMax,
    scene.fadeIODelaySinRate,
    scene.fadeIODelayBPMMulti,
    Object.values(EA).indexOf(scene.fadeIOStartEase),
    scene.fadeIOStartExp,
    scene.fadeIOStartAmp,
    scene.fadeIOStartPer,
    scene.fadeIOStartOv,
    Object.values(EA).indexOf(scene.fadeIOEndEase),
    scene.fadeIOEndExp,
    scene.fadeIOEndAmp,
    scene.fadeIOEndPer,
    scene.fadeIOEndOv,
    // panning
    scene.panning ? 1 : 0,
    Object.values(TF).indexOf(scene.panTF),
    scene.panDuration,
    scene.panDurationMin,
    scene.panDurationMax,
    scene.panSinRate,
    scene.panBPMMulti,
    Object.values(HTF).indexOf(scene.panHorizTransType),
    scene.panHorizTransImg ? 1 : 0,
    scene.panHorizTransLevel,
    scene.panHorizTransLevelMax,
    scene.panHorizTransLevelMin,
    scene.panHorizTransRandom ? 1 : 0,
    Object.values(VTF).indexOf(scene.panVertTransType),
    scene.panVertTransImg ? 1 : 0,
    scene.panVertTransLevel,
    scene.panVertTransLevelMax,
    scene.panVertTransLevelMin,
    scene.panVertTransRandom ? 1 : 0,
    Object.values(EA).indexOf(scene.panStartEase),
    scene.panStartExp,
    scene.panStartAmp,
    scene.panStartPer,
    scene.panStartOv,
    Object.values(EA).indexOf(scene.panEndEase),
    scene.panEndExp,
    scene.panEndAmp,
    scene.panEndPer,
    scene.panEndOv,
    // Add future items here
  ];

  return Buffer.from(effects.join(",")).toString("base64").slice(0, -1);
}

export function applyEffects(scene: Scene, base64String: string) {
  base64String += "=";
  const effectsString = atob(base64String);
  const effects = effectsString.split(",");

  let index = 0;
  scene.timingFunction = Object.values(TF)[Number.parseInt(effects[index++])];
  scene.timingConstant = Number.parseInt(effects[index++]);
  scene.timingMin = Number.parseInt(effects[index++]);
  scene.timingMax = Number.parseInt(effects[index++]);
  scene.timingSinRate = Number.parseInt(effects[index++]);
  scene.timingBPMMulti = Number.parseInt(effects[index++]);
  scene.backForth = Number.parseInt(effects[index++]) == 1;
  scene.backForthTF = Object.values(TF)[Number.parseInt(effects[index++])];
  scene.backForthConstant = Number.parseInt(effects[index++]);
  scene.backForthMin = Number.parseInt(effects[index++]);
  scene.backForthMax = Number.parseInt(effects[index++]);
  scene.backForthSinRate = Number.parseInt(effects[index++]);
  scene.backForthBPMMulti = Number.parseInt(effects[index++]);
  scene.imageType = Object.values(IT)[Number.parseInt(effects[index++])];
  scene.backgroundType = Object.values(BT)[Number.parseInt(effects[index++])];
  scene.backgroundColor = effects[index++];
  scene.backgroundColorSet = effects[index++].split("|");
  scene.backgroundBlur = Number.parseInt(effects[index++]);

  scene.imageTypeFilter = Object.values(IF)[Number.parseInt(effects[index++])];
  scene.fullSource = Number.parseInt(effects[index++]) == 1;
  scene.imageOrientation = Object.values(OT)[Number.parseInt(effects[index++])];
  scene.gifOption = Object.values(GO)[Number.parseInt(effects[index++])];
  scene.gifTimingConstant = Number.parseInt(effects[index++]);
  scene.gifTimingMin = Number.parseInt(effects[index++]);
  scene.gifTimingMax = Number.parseInt(effects[index++]);
  scene.videoOrientation = Object.values(OT)[Number.parseInt(effects[index++])];
  scene.videoOption = Object.values(VO)[Number.parseInt(effects[index++])];
  scene.videoTimingConstant = Number.parseInt(effects[index++]);
  scene.videoTimingMin = Number.parseInt(effects[index++]);
  scene.videoTimingMax = Number.parseInt(effects[index++]);
  scene.videoSpeed = Number.parseInt(effects[index++]);
  scene.videoRandomSpeed = Number.parseInt(effects[index++]) == 1;
  scene.videoSpeedMin = Number.parseInt(effects[index++]);
  scene.videoSpeedMax = Number.parseInt(effects[index++]);
  scene.randomVideoStart = Number.parseInt(effects[index++]) == 1;
  scene.continueVideo = Number.parseInt(effects[index++]) == 1;
  scene.playVideoClips = Number.parseInt(effects[index++]) == 1;
  scene.skipVideoStart = Number.parseInt(effects[index++]);
  scene.skipVideoEnd = Number.parseInt(effects[index++]);
  scene.videoVolume = Number.parseInt(effects[index++]);
  scene.weightFunction = Object.values(WF)[Number.parseInt(effects[index++])];
  scene.sourceOrderFunction =
    Object.values(SOF)[Number.parseInt(effects[index++])];
  scene.forceAllSource = Number.parseInt(effects[index++]) == 1;
  scene.orderFunction = Object.values(OF)[Number.parseInt(effects[index++])];
  scene.forceAll = Number.parseInt(effects[index++]) == 1;

  scene.zoom = Number.parseInt(effects[index++]) == 1;
  scene.zoomRandom = Number.parseInt(effects[index++]) == 1;
  scene.zoomStart = Number.parseFloat(effects[index++]);
  scene.zoomStartMin = Number.parseFloat(effects[index++]);
  scene.zoomStartMax = Number.parseFloat(effects[index++]);
  scene.zoomEnd = Number.parseFloat(effects[index++]);
  scene.zoomEndMin = Number.parseFloat(effects[index++]);
  scene.zoomEndMax = Number.parseFloat(effects[index++]);
  scene.horizTransType = Object.values(HTF)[Number.parseInt(effects[index++])];
  scene.horizTransLevel = Number.parseInt(effects[index++]);
  scene.horizTransLevelMin = Number.parseInt(effects[index++]);
  scene.horizTransLevelMax = Number.parseInt(effects[index++]);
  scene.horizTransRandom = Number.parseInt(effects[index++]) == 1;
  scene.vertTransType = Object.values(VTF)[Number.parseInt(effects[index++])];
  scene.vertTransLevel = Number.parseInt(effects[index++]);
  scene.vertTransLevelMin = Number.parseInt(effects[index++]);
  scene.vertTransLevelMax = Number.parseInt(effects[index++]);
  scene.vertTransRandom = Number.parseInt(effects[index++]) == 1;
  scene.transTF = Object.values(TF)[Number.parseInt(effects[index++])];
  scene.transDuration = Number.parseInt(effects[index++]);
  scene.transDurationMin = Number.parseInt(effects[index++]);
  scene.transDurationMax = Number.parseInt(effects[index++]);
  scene.transSinRate = Number.parseInt(effects[index++]);
  scene.transBPMMulti = Number.parseInt(effects[index++]);
  scene.transEase = Object.values(EA)[Number.parseInt(effects[index++])];
  scene.transExp = Number.parseInt(effects[index++]);
  scene.transAmp = Number.parseInt(effects[index++]);
  scene.transPer = Number.parseInt(effects[index++]);
  scene.transOv = Number.parseInt(effects[index++]);

  scene.crossFade = Number.parseInt(effects[index++]) == 1;
  scene.crossFadeAudio = Number.parseInt(effects[index++]) == 1;
  scene.fadeTF = Object.values(TF)[Number.parseInt(effects[index++])];
  scene.fadeDuration = Number.parseInt(effects[index++]);
  scene.fadeDurationMin = Number.parseInt(effects[index++]);
  scene.fadeDurationMax = Number.parseInt(effects[index++]);
  scene.fadeSinRate = Number.parseInt(effects[index++]);
  scene.fadeBPMMulti = Number.parseInt(effects[index++]);
  scene.fadeEase = Object.values(EA)[Number.parseInt(effects[index++])];
  scene.fadeExp = Number.parseInt(effects[index++]);
  scene.fadeAmp = Number.parseInt(effects[index++]);
  scene.fadePer = Number.parseInt(effects[index++]);
  scene.fadeOv = Number.parseInt(effects[index++]);

  scene.slide = Number.parseInt(effects[index++]) == 1;
  scene.slideTF = Object.values(TF)[Number.parseInt(effects[index++])];
  scene.slideType = Object.values(STF)[Number.parseInt(effects[index++])];
  scene.slideDistance = Number.parseInt(effects[index++]);
  scene.slideDuration = Number.parseInt(effects[index++]);
  scene.slideDurationMin = Number.parseInt(effects[index++]);
  scene.slideDurationMax = Number.parseInt(effects[index++]);
  scene.slideSinRate = Number.parseInt(effects[index++]);
  scene.slideBPMMulti = Number.parseInt(effects[index++]);
  scene.slideEase = Object.values(EA)[Number.parseInt(effects[index++])];
  scene.slideExp = Number.parseInt(effects[index++]);
  scene.slideAmp = Number.parseInt(effects[index++]);
  scene.slidePer = Number.parseInt(effects[index++]);
  scene.slideOv = Number.parseInt(effects[index++]);

  scene.strobe = Number.parseInt(effects[index++]) == 1;
  scene.strobePulse = Number.parseInt(effects[index++]) == 1;
  scene.strobeLayer = Object.values(SL)[Number.parseInt(effects[index++])];
  scene.strobeOpacity = Number.parseFloat(effects[index++]);
  scene.strobeTF = Object.values(TF)[Number.parseInt(effects[index++])];
  scene.strobeTime = Number.parseInt(effects[index++]);
  scene.strobeTimeMin = Number.parseInt(effects[index++]);
  scene.strobeTimeMax = Number.parseInt(effects[index++]);
  scene.strobeSinRate = Number.parseInt(effects[index++]);
  scene.strobeBPMMulti = Number.parseInt(effects[index++]);
  scene.strobeDelayTF = Object.values(TF)[Number.parseInt(effects[index++])];
  scene.strobeDelay = Number.parseInt(effects[index++]);
  scene.strobeDelayMin = Number.parseInt(effects[index++]);
  scene.strobeDelayMax = Number.parseInt(effects[index++]);
  scene.strobeDelaySinRate = Number.parseInt(effects[index++]);
  scene.strobeDelayBPMMulti = Number.parseInt(effects[index++]);
  scene.strobeColorType = Object.values(SC)[Number.parseInt(effects[index++])];
  scene.strobeColor = effects[index++];
  scene.strobeColorSet = effects[index++].split("|");
  scene.strobeEase = Object.values(EA)[Number.parseInt(effects[index++])];
  scene.strobeExp = Number.parseInt(effects[index++]);
  scene.strobeAmp = Number.parseInt(effects[index++]);
  scene.strobePer = Number.parseInt(effects[index++]);
  scene.strobeOv = Number.parseInt(effects[index++]);

  scene.fadeInOut = Number.parseInt(effects[index++]) == 1;
  scene.fadeIOPulse = Number.parseInt(effects[index++]) == 1;
  scene.fadeIOTF = Object.values(TF)[Number.parseInt(effects[index++])];
  scene.fadeIODuration = Number.parseInt(effects[index++]);
  scene.fadeIODurationMin = Number.parseInt(effects[index++]);
  scene.fadeIODurationMax = Number.parseInt(effects[index++]);
  scene.fadeIOSinRate = Number.parseInt(effects[index++]);
  scene.fadeIOBPMMulti = Number.parseInt(effects[index++]);
  scene.fadeIODelayTF = Object.values(TF)[Number.parseInt(effects[index++])];
  scene.fadeIODelay = Number.parseInt(effects[index++]);
  scene.fadeIODelayMin = Number.parseInt(effects[index++]);
  scene.fadeIODelayMax = Number.parseInt(effects[index++]);
  scene.fadeIODelaySinRate = Number.parseInt(effects[index++]);
  scene.fadeIODelayBPMMulti = Number.parseInt(effects[index++]);
  scene.fadeIOStartEase = Object.values(EA)[Number.parseInt(effects[index++])];
  scene.fadeIOStartExp = Number.parseInt(effects[index++]);
  scene.fadeIOStartAmp = Number.parseInt(effects[index++]);
  scene.fadeIOStartPer = Number.parseInt(effects[index++]);
  scene.fadeIOStartOv = Number.parseInt(effects[index++]);
  scene.fadeIOEndEase = Object.values(EA)[Number.parseInt(effects[index++])];
  scene.fadeIOEndExp = Number.parseInt(effects[index++]);
  scene.fadeIOEndAmp = Number.parseInt(effects[index++]);
  scene.fadeIOEndPer = Number.parseInt(effects[index++]);
  scene.fadeIOEndOv = Number.parseInt(effects[index++]);

  scene.panning = Number.parseInt(effects[index++]) == 1;
  scene.panTF = Object.values(TF)[Number.parseInt(effects[index++])];
  scene.panDuration = Number.parseInt(effects[index++]);
  scene.panDurationMin = Number.parseInt(effects[index++]);
  scene.panDurationMax = Number.parseInt(effects[index++]);
  scene.panSinRate = Number.parseInt(effects[index++]);
  scene.panBPMMulti = Number.parseInt(effects[index++]);
  scene.panHorizTransType =
    Object.values(HTF)[Number.parseInt(effects[index++])];
  scene.panHorizTransImg = Number.parseInt(effects[index++]) == 1;
  scene.panHorizTransLevel = Number.parseInt(effects[index++]);
  scene.panHorizTransLevelMax = Number.parseInt(effects[index++]);
  scene.panHorizTransLevelMin = Number.parseInt(effects[index++]);
  scene.panHorizTransRandom = Number.parseInt(effects[index++]) == 1;
  scene.panVertTransType =
    Object.values(VTF)[Number.parseInt(effects[index++])];
  scene.panVertTransImg = Number.parseInt(effects[index++]) == 1;
  scene.panVertTransLevel = Number.parseInt(effects[index++]);
  scene.panVertTransLevelMax = Number.parseInt(effects[index++]);
  scene.panVertTransLevelMin = Number.parseInt(effects[index++]);
  scene.panVertTransRandom = Number.parseInt(effects[index++]) == 1;
  scene.panStartEase = Object.values(EA)[Number.parseInt(effects[index++])];
  scene.panStartExp = Number.parseInt(effects[index++]);
  scene.panStartAmp = Number.parseInt(effects[index++]);
  scene.panStartPer = Number.parseInt(effects[index++]);
  scene.panStartOv = Number.parseInt(effects[index++]);
  scene.panEndEase = Object.values(EA)[Number.parseInt(effects[index++])];
  scene.panEndExp = Number.parseInt(effects[index++]);
  scene.panEndAmp = Number.parseInt(effects[index++]);
  scene.panEndPer = Number.parseInt(effects[index++]);
  scene.panEndOv = Number.parseInt(effects[index++]);

  // Add future items here

  return scene;
}

export function assertDefined<T>(
  value: T | null | undefined,
  message: string,
): asserts value is T {
  if (value == null) {
    throw new Error(message);
  }
}

let captionProgramDefaults = {
  program: new Array<Function>(),
  programCounter: 0,
  timestamps: new Array<number>(),
  timestampFn: new Map<number, Array<Function>>(),
  timestampCounter: 0,
  audios: new Array<{
    alias: string;
    file: string;
    playing: boolean;
    volume: number;
  }>(),
  phrases: new Map<number, Array<string>>(),

  blinkDuration: [200, 500],
  blinkWaveRate: 100,
  blinkBPMMulti: 1,
  blinkTF: TF.constant,

  blinkDelay: [80, 200],
  blinkDelayWaveRate: 100,
  blinkDelayBPMMulti: 1,
  blinkDelayTF: TF.constant,

  blinkGroupDelay: [1200, 2000],
  blinkGroupDelayWaveRate: 100,
  blinkGroupDelayBPMMulti: 1,
  blinkGroupDelayTF: TF.constant,

  captionDuration: [2000, 4000],
  captionWaveRate: 100,
  captionBPMMulti: 1,
  captionTF: TF.constant,

  captionDelay: [1200, 2000],
  captionDelayWaveRate: 100,
  captionDelayBPMMulti: 1,
  captionDelayTF: TF.constant,

  countDuration: [600, 1000],
  countWaveRate: 100,
  countBPMMulti: 1,
  countTF: TF.constant,

  countDelay: [400, 1000],
  countDelayWaveRate: 100,
  countDelayBPMMulti: 1,
  countDelayTF: TF.constant,

  showCountProgress: false,
  countProgressOffset: false,
  countColorMatch: false,
  countProgressScale: 500,

  countGroupDelay: [1200, 2000],
  countGroupDelayWaveRate: 100,
  countGroupDelayBPMMulti: 1,
  countGroupDelayTF: TF.constant,

  blinkY: 0,
  captionY: 0,
  bigCaptionY: 0,
  countY: 0,

  blinkX: 0,
  captionX: 0,
  bigCaptionX: 0,
  countX: 0,

  blinkOpacity: 100,
  captionOpacity: 100,
  countOpacity: 100,
};
export default captionProgramDefaults;
