import { IF, ST } from './const';

export function copy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const gridIDPrefix = '999';
export function convertGridIDToSceneID(gridID: number): number {
  return Number(gridIDPrefix + gridID);
}

export function isSceneIDAGridID(sceneID: number): boolean {
  return isSceneIDTextAGridID(sceneID.toString());
}

function isSceneIDTextAGridID(sceneIDText: string): boolean {
  return sceneIDText.startsWith(gridIDPrefix);
}

export function convertSceneIDToGridID(sceneID: number): number | undefined {
  const sceneIDText = sceneID.toString();
  return isSceneIDTextADisplayID(sceneIDText)
    ? Number(sceneIDText.substring(gridIDPrefix.length))
    : undefined;
}

const displayIDPrefix = '8888';
export function convertDisplayIDToSceneID(displayID: number): number {
  return Number(displayIDPrefix + displayID);
}

export function isSceneIDADisplayID(sceneID: number): boolean {
  return isSceneIDTextADisplayID(sceneID.toString());
}

function isSceneIDTextADisplayID(sceneIDText: string): boolean {
  return sceneIDText.startsWith(displayIDPrefix);
}

export function convertSceneIDToDisplayID(sceneID: number): number | undefined {
  const sceneIDText = sceneID.toString();
  return isSceneIDTextADisplayID(sceneIDText)
    ? Number(sceneIDText.substring(displayIDPrefix.length))
    : undefined;
}

const playlistIDPrefix = '77777';
export function convertPlaylistIDToSceneID(displayID: number): number {
  return Number(playlistIDPrefix + displayID);
}

export function isSceneIDAPlaylistID(sceneID: number): boolean {
  return isSceneIDTextAPlaylistID(sceneID.toString());
}

function isSceneIDTextAPlaylistID(sceneIDText: string): boolean {
  return sceneIDText.startsWith(playlistIDPrefix);
}

export function convertSceneIDToPlaylistID(
  sceneID: number
): number | undefined {
  const sceneIDText = sceneID.toString();
  return isSceneIDTextADisplayID(sceneIDText)
    ? Number(sceneIDText.substring(playlistIDPrefix.length))
    : undefined;
}

export function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
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

export function urlToPath(url: string, isWin32: boolean): string {
  const path = new URL(url).pathname;
  if (isWin32) {
    return decodeURIComponent(path.substring(1, path.length));
  } else {
    return decodeURIComponent(path);
  }
}

export function isText(path: string, strict: boolean): boolean {
  if (path == null) return false;
  const p = path.toLowerCase();
  const acceptableExtensions = ['.txt'];
  const filter =
    strict === true
      ? (ext: string) => p.endsWith(ext)
      : (ext: string) => p.includes(ext);

  return acceptableExtensions.find(filter) != null;
}

export function isAudio(path: string, strict: boolean): boolean {
  if (path == null) return false;
  const p = path.toLowerCase();
  const filter =
    strict === true
      ? (ext: string) => p.endsWith(ext)
      : (ext: string) => p.includes(ext);

  return ['.mp3', '.m4a', '.wav', '.ogg'].find(filter) != null;
}

export function isImage(path: string, strict: boolean): boolean {
  if (path == null) return false;
  const p = path.toLowerCase();
  const filter =
    strict === true
      ? (ext: string) => p.endsWith(ext)
      : (ext: string) => p.includes(ext);

  const acceptableExtensions = [
    '.gif',
    '.png',
    '.jpeg',
    '.jpg',
    '.webp',
    '.avif',
    '.tiff',
    '.svg',
  ];

  return acceptableExtensions.find(filter) != null;
}

export function isVideo(path: string, strict: boolean): boolean {
  if (path == null) return false;
  const p = path.toLowerCase();
  const filter =
    strict === true
      ? (ext: string) => p.endsWith(ext)
      : (ext: string) => p.includes(ext);

  const acceptableExtensions = [
    '.mp4',
    '.mkv',
    '.webm',
    '.ogv',
    '.mov',
    '.m4v',
  ];

  return acceptableExtensions.find(filter) != null;
}

export function isVideoPlaylist(path: string, strict: boolean): boolean {
  if (path == null) return false;
  const p = path.toLowerCase();
  const filter =
    strict === true
      ? (ext: string) => p.endsWith(ext)
      : (ext: string) => p.includes(ext);

  return ['.asx', '.m3u8', '.pls', '.xspf'].find(filter) != null;
}

export const isImageOrVideo = (path: string, strict: boolean): boolean => {
  return isImage(path, strict) || isVideo(path, strict);
};

export function filterPathsToJustPlayable(
  imageTypeFilter: string,
  paths: string[],
  strict: boolean
): string[] {
  switch (imageTypeFilter) {
    default:
    case IF.any:
      return paths.filter((p) => isImageOrVideo(p, strict));
    case IF.stills:
    case IF.images:
      return paths.filter((p) => isImage(p, strict));
    case IF.animated:
      return paths.filter(
        (p) => p.toLowerCase().endsWith('.gif') || isVideo(p, strict)
      );
    case IF.videos:
      return paths.filter((p) => isVideo(p, strict));
  }
}

export function removeDuplicatesBy<T>(
  keyFn: (item: T) => string,
  array: T[]
): T[] {
  const mySet = new Set();
  return array.filter((x: T) => {
    const key = keyFn(x);
    const isNew = !mySet.has(key);
    if (isNew) mySet.add(key);
    return isNew;
  });
}

export function getSourceType(url: string): string {
  if (isAudio(url, false)) {
    return ST.audio
  } else if (isVideo(url, false)) {
    return ST.video
  } else if (isVideoPlaylist(url, true)) {
    return ST.playlist
  } else if (/^https?:\/\/([^.]*|(66\.media))\.tumblr\.com/.exec(url) != null) {
    return ST.tumblr
  } else if (/^https?:\/\/(www\.)?reddit\.com\//.exec(url) != null) {
    return ST.reddit
  } else if (/^https?:\/\/(www\.)?redgifs\.com\//.exec(url) != null) {
    return ST.redgifs
  } else if (/^https?:\/\/(www\.)?imagefap\.com\//.exec(url) != null) {
    return ST.imagefap
  } else if (/^https?:\/\/(www\.)?imgur\.com\//.exec(url) != null) {
    return ST.imgur
  } else if (/^https?:\/\/(www\.)?(cdn\.)?sex\.com\//.exec(url) != null) {
    return ST.sexcom
  } else if (/^https?:\/\/(www\.)?twitter\.com\//.exec(url) != null) {
    return ST.twitter
  } else if (/^https?:\/\/(www\.)?deviantart\.com\//.exec(url) != null) {
    return ST.deviantart
  } else if (/^https?:\/\/(www\.)?instagram\.com\//.exec(url) != null) {
    return ST.instagram
  } else if (
    /^https?:\/\/(www\.)?(lolibooru\.moe|hypnohub\.net|danbooru\.donmai\.us)\//.exec(
      url
    ) != null
  ) {
    return ST.danbooru
  } else if (
    /^https?:\/\/(www\.)?(gelbooru\.com|furry\.booru\.org|rule34\.xxx|realbooru\.com|safebooru\.org)\//.exec(
      url
    ) != null
  ) {
    return ST.gelbooru2
  } else if (/^https?:\/\/(www\.)?(e621\.net)\//.exec(url) != null) {
    return ST.e621
  } else if (
    /^https?:\/\/(www\.|members\.)?luscious\.net\//.exec(url) != null
  ) {
    return ST.luscious
  } else if (
    /^https?:\/\/(www\.)?(.*\.booru\.org|idol\.sankakucomplex\.com)\//.exec(
      url
    ) != null
  ) {
    return ST.gelbooru1
  } else if (/^https?:\/\/(www\.)?e-hentai\.org\/g\//.exec(url) != null) {
    return ST.ehentai
  } else if (/^https?:\/\/[^.]*\.bdsmlr\.com/.exec(url) != null) {
    return ST.bdsmlr
  } else if (
    /^https?:\/\/[\w\\.]+:\d+\/get_files\/search_files/.exec(url) != null
  ) {
    return ST.hydrus
  } else if (/^https?:\/\/[^.]*\.[a-z0-9.:]+\/ws.php/.exec(url) != null) {
    return ST.piwigo
  } else if (/^https?:\/\/hypno\.nimja\.com\/visual\/\d+/.exec(url) != null) {
    return ST.nimja
  } else if (/(^https?:\/\/)|(\.txt$)/.exec(url) != null) {
    // Arbitrary URL, assume image list
    return ST.list
  } else {
    // Directory
    return ST.local
  }
}
