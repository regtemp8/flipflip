import { IF, ST } from './const';

export function copy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
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

export function getSourceType(url: string): string {
  if (isAudio(url, false)) {
    return ST.audio;
  } else if (isVideo(url, false)) {
    return ST.video;
  } else if (isVideoPlaylist(url, true)) {
    return ST.playlist;
  } else if (/^https?:\/\/([^.]*|(66\.media))\.tumblr\.com/.exec(url) != null) {
    return ST.tumblr;
  } else if (/^https?:\/\/(www\.)?reddit\.com\//.exec(url) != null) {
    return ST.reddit;
  } else if (/^https?:\/\/(www\.)?redgifs\.com\//.exec(url) != null) {
    return ST.redgifs;
  } else if (/^https?:\/\/(www\.)?imagefap\.com\//.exec(url) != null) {
    return ST.imagefap;
  } else if (/^https?:\/\/(www\.)?imgur\.com\//.exec(url) != null) {
    return ST.imgur;
  } else if (/^https?:\/\/(www\.)?(cdn\.)?sex\.com\//.exec(url) != null) {
    return ST.sexcom;
  } else if (/^https?:\/\/(www\.)?twitter\.com\//.exec(url) != null) {
    return ST.twitter;
  } else if (/^https?:\/\/(www\.)?deviantart\.com\//.exec(url) != null) {
    return ST.deviantart;
  } else if (/^https?:\/\/(www\.)?instagram\.com\//.exec(url) != null) {
    return ST.instagram;
  } else if (
    /^https?:\/\/(www\.)?(lolibooru\.moe|hypnohub\.net|danbooru\.donmai\.us)\//.exec(
      url
    ) != null
  ) {
    return ST.danbooru;
  } else if (
    /^https?:\/\/(www\.)?(gelbooru\.com|furry\.booru\.org|rule34\.xxx|realbooru\.com|safebooru\.org)\//.exec(
      url
    ) != null
  ) {
    return ST.gelbooru2;
  } else if (/^https?:\/\/(www\.)?(e621\.net)\//.exec(url) != null) {
    return ST.e621;
  } else if (
    /^https?:\/\/(www\.|members\.)?luscious\.net\//.exec(url) != null
  ) {
    return ST.luscious;
  } else if (
    /^https?:\/\/(www\.)?(.*\.booru\.org|idol\.sankakucomplex\.com)\//.exec(
      url
    ) != null
  ) {
    return ST.gelbooru1;
  } else if (/^https?:\/\/(www\.)?e-hentai\.org\/g\//.exec(url) != null) {
    return ST.ehentai;
  } else if (/^https?:\/\/[^.]*\.bdsmlr\.com/.exec(url) != null) {
    return ST.bdsmlr;
  } else if (
    /^https?:\/\/[\w\\.]+:\d+\/get_files\/search_files/.exec(url) != null
  ) {
    return ST.hydrus;
  } else if (/^https?:\/\/[^.]*\.[a-z0-9.:]+\/ws.php/.exec(url) != null) {
    return ST.piwigo;
  } else if (/^https?:\/\/hypno\.nimja\.com\/visual\/\d+/.exec(url) != null) {
    return ST.nimja;
  } else if (/(^https?:\/\/)|(\.txt$)/.exec(url) != null) {
    // Arbitrary URL, assume image list
    return ST.list;
  } else {
    // Directory
    return ST.local;
  }
}

export function getFileGroup(url: string, pathSep: string) {
  switch (getSourceType(url)) {
    case ST.tumblr:
      return url.replace(/https?:\/\//, '').replace(/\.tumblr\.com\/?/, '');
    case ST.reddit:
      if (url.endsWith('/')) {
        url = url.slice(0, url.lastIndexOf('/'));
      }
      if (url.endsWith('/saved')) {
        url = url.replace('/saved', '');
      }

      return url.substring(url.lastIndexOf('/') + 1);
    case ST.redgifs:
      if (url.includes('/browse?')) {
        const redgifRegex =
          /^https?:\/\/(?:www\.)?redgifs\.com\/browse\?.*tags=([^&]*)/.exec(
            url
          );
        return redgifRegex?.length ? redgifRegex[1] : 'all';
      } else if (url.includes('/users/')) {
        url = url.replace(/^https?:\/\/(www\.)?redgifs\.com\/users\//, '');
        if (url.includes('/')) {
          url = url.substring(0, url.indexOf('/'));
        }

        return url;
      }
      return undefined;
    case ST.imagefap:
      return url
        .replace(/https?:\/\/www.imagefap.com\//, '')
        .replace(/pictures\//, '')
        .replace(/gallery\//, '')
        .replace(/organizer\//, '')
        .replace(/video\.php\?vid=/, '')
        .split('/')[0];
    case ST.sexcom:
      url = url
        .replace(/https?:\/\/www.sex.com\//, '')
        .replace(/user\//, '')
        .split('?')[0];

      if (url.endsWith('/')) {
        url = url.substring(0, url.length - 1);
      }

      return url;
    case ST.imgur:
      return url.replace(/https?:\/\/imgur.com\//, '').replace(/a\//, '');
    case ST.twitter:
      url = url.replace(/https?:\/\/twitter.com\//, '');
      if (url.includes('?')) {
        url = url.substring(0, url.indexOf('?'));
      }
      if (url.endsWith('/')) {
        url = url.substring(0, url.length - 1);
      }
      return url;
    case ST.deviantart:
      url = url.replace(/https?:\/\/www.deviantart.com\//, '');
      if (url.includes('/')) {
        url = url.substring(0, url.indexOf('/'));
      }
      return url;
    case ST.instagram:
      url = url.replace(/https?:\/\/www.instagram.com\//, '');
      if (url.includes('/')) {
        url = url.substring(0, url.indexOf('/'));
      }
      return url;
    case ST.e621: {
      const hostRegexE621 = /^https?:\/\/(?:www\.)?([^.]*)\./g;
      const hostRegexResult = hostRegexE621.exec(url);
      const hostE621 = hostRegexResult != null ? hostRegexResult[1] : '';
      const tryGetTag = (url: string): string => {
        const tagRegex = /[?&]tags=(.*)&?/g;
        const tags = tagRegex.exec(url);
        const tag = tags != null ? tags[1] : '';
        return tag.endsWith('+') ? tag.substring(0, tag.length - 1) : tag;
      };

      const E621ID = url.includes('/pools/')
        ? 'pool' + url.substring(url.lastIndexOf('/'))
        : tryGetTag(url);

      return hostE621 + '/' + decodeURIComponent(E621ID);
    }
    case ST.luscious:
      url = url.replace(
        /^https?:\/\/(www\.|members\.)?luscious\.net\/(albums|users)\//,
        ''
      );
      if (url.includes('/')) {
        url = url.substring(0, url.indexOf('/'));
      }
      return url;
    case ST.danbooru:
    case ST.gelbooru1:
    case ST.gelbooru2: {
      const createFileGroup = (host: string, id: string) => {
        return host + '/' + decodeURIComponent(id);
      };
      const hostRegex = /^https?:\/\/(?:www\.)?([^.]*)\./g;
      const hostRegexResult = hostRegex.exec(url);
      const host = hostRegexResult != null ? hostRegexResult[1] : '';
      if (url.includes('/pools/')) {
        const danbooruID = 'pools/' + url.substring(url.lastIndexOf('/'));
        return createFileGroup(host, danbooruID);
      } else if (url.includes('/favorite_groups/')) {
        const danbooruID =
          'favorite_groups/' + url.substring(url.lastIndexOf('/'));
        return createFileGroup(host, danbooruID);
      } else {
        const tagRegex = /[?&]tags=(.*)&?/g;
        const tags = tagRegex.exec(url);
        const tagsValue = tags != null ? tags[1] : '';
        const tagsValueHasPlus = tagsValue.endsWith('+');

        const titleRegex = /[?&]title=(.*)&?/g;
        const title = titleRegex.exec(url);
        const titleValue = title != null ? title[1] : undefined;
        if (titleValue != null) {
          const separator: string = tagsValueHasPlus === true ? '' : '+';
          const danbooruID = [tagsValue, titleValue].join(separator);
          return createFileGroup(host, danbooruID);
        } else {
          const danbooruID = tagsValueHasPlus
            ? tagsValue.substring(0, tagsValue.length - 1)
            : tagsValue;
          return createFileGroup(host, danbooruID);
        }
      }
    }
    case ST.ehentai: {
      const galleryRegex = /^https?:\/\/(?:www\.)?e-hentai\.org\/g\/([^/]*)/g;
      const gallery = galleryRegex.exec(url);
      return gallery != null ? gallery[1] : undefined;
    }
    case ST.list: {
      const sep = /^https?:\/\//g.exec(url) != null ? '/' : pathSep;
      return url.substring(url.lastIndexOf(sep) + 1).replace('.txt', '');
    }
    case ST.local:
      if (url.endsWith(pathSep)) {
        url = url.substring(0, url.length - 1);
      }
      return url.substring(url.lastIndexOf(pathSep) + 1);
    case ST.video:
    case ST.playlist:
    case ST.nimja: {
      const sep = /^https?:\/\//g.exec(url) != null ? '/' : pathSep;
      const name = url.substring(0, url.lastIndexOf(sep));
      return name.substring(name.lastIndexOf(sep) + 1);
    }
    case ST.bdsmlr:
      return url
        .replace(/https?:\/\//, '')
        .replace(/\/rss/, '')
        .replace(/\.bdsmlr\.com\/?/, '');
    case ST.hydrus: {
      const tagsRegex = /tags=([^&]*)&?.*$/.exec(url);
      if (tagsRegex == null) return 'hydrus';
      const tags = tagsRegex[1];
      const tagsValue = !tags.startsWith('[') ? decodeURIComponent(tags) : tags;

      return tagsValue.substring(1, tags.length - 1).replace(/"/g, '');
    }
    case ST.piwigo: {
      const catRegex = /cat_id\[]=(\d*)/.exec(url);
      if (catRegex != null) return catRegex[1];

      const tagRegex = /tag_id\[]=(\d*)/.exec(url);
      if (tagRegex != null) return tagRegex[1];

      return 'piwigo';
    }
    default:
      return undefined;
  }
}

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

export function removeDuplicatesBy<T>(keyFn: (item: T) => string, array: T[]): T[] {
  const mySet = new Set();
  return array.filter((x: T) => {
    const key = keyFn(x);
    const isNew = !mySet.has(key);
    if (isNew) mySet.add(key);
    return isNew;
  });
}
