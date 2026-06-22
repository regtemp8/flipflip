import fs from "node:fs";
import path from "node:path";
import {pathToFileURL} from "node:url";
import wretch from "wretch";
import recursiveReaddir from "recursive-readdir";
import { DOMParser } from "@xmldom/xmldom";
import Config from "../../common/Config";
import LibrarySource from "../../common/LibrarySource";
import { IF, ST } from "../../common/const";
import {
  filterPathsToJustPlayable,
  loadBDSMlr,
  loadDanbooru,
  loadDeviantArt,
  loadE621,
  loadEHentai,
  loadGelbooru1,
  loadGelbooru2,
  loadHydrus,
  loadImageFap,
  loadImgur,
  loadLuscious,
  loadPiwigo,
  loadRedGifs,
  loadRemoteImageURLList,
  loadSexCom,
  loadTumblr,
} from "./Scrapers";
import {
  urlToPath,
  getFileName,
  getSourceType,
  isVideo,
} from "../../common/utils";

const loadNimja = (
  pm: Function,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number },
  cachePath: string,
) => {
  let sources = [source.url];
  helpers.next = null;
  pm({
    data: sources,
    allPosts: new Map<string, string>(),
    weight: weight,
    helpers: helpers,
    source: source,
    timeout: 0,
  });
};

const loadLocalDirectory = (
  pm: Function,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number },
  cachePath: string,
) => {
  const blacklist = ["*.css", "*.html", "avatar.png", "*.txt"];
  const url = cachePath ? cachePath : source.url;

  recursiveReaddir(url, blacklist, (err: any, rawFiles: Array<string>) => {
    if (err) {
      pm({
        error: err.message,
        helpers: helpers,
        source: source,
        timeout: 0,
      });
    } else {
      const collator = new Intl.Collator(undefined, {
        numeric: true,
        sensitivity: "base",
      });
      let sources = filterPathsToJustPlayable(filter, rawFiles, true)
        .map((p) => pathToFileURL(p).toString())
        .sort(collator.compare);

      if (source.blacklist && source.blacklist.length > 0) {
        sources = sources.filter(
          (url: string) =>
            !source.blacklist.includes(url) &&
            !source.blacklist.includes(urlToPath(url, process.platform)),
        );
      }

      // If this is a local source (not a cacheDir call)
      if (helpers.next == -1) {
        helpers.count = filterPathsToJustPlayable(
          IF.any,
          rawFiles,
          true,
        ).length;
        helpers.next = null;
      }

      pm({
        data: sources,
        allPosts: new Map<string, string>(),
        weight: weight,
        helpers: helpers,
        source: source,
        timeout: 0,
      });
    }
  });
};

const loadVideo = (
  pm: Function,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number },
  cachePath: string,
) => {
  const url = cachePath ? cachePath : source.url;
  const missingVideo = () => {
    pm({
      error: "Could not find " + source.url,
      data: [],
      allURLs: new Map<string, string[]>(),
      allPosts: new Map<string, string>(),
      weight: weight,
      helpers: helpers,
      source: source,
      timeout: 0,
    });
  };
  const ifExists = (url: string) => {
    if (!url.startsWith("http")) {
      url = pathToFileURL(url).toString();
    }
    helpers.count = 1;

    let paths;
    if (source.clips && source.clips.length > 0) {
      const clipPaths = new Array<string>();
      for (let clip of source.clips) {
        if (!source.disabledClips || !source.disabledClips.includes(clip.id)) {
          let clipPath =
            url +
            ":::" +
            clip.id +
            ":" +
            (clip?.volume ?? "-") +
            ":::" +
            clip.start +
            ":" +
            clip.end;
          if (source.subtitleFile != null && source.subtitleFile.length > 0) {
            clipPath = clipPath + "|||" + source.subtitleFile;
          }
          clipPaths.push(clipPath);
        }
      }
      paths = clipPaths;
    } else {
      if (source.subtitleFile != null && source.subtitleFile.length > 0) {
        url = url + "|||" + source.subtitleFile;
      }
      paths = [url];
    }

    if (source.blacklist && source.blacklist.length > 0) {
      paths = paths.filter((url: string) => !source.blacklist.includes(url));
    }
    helpers.next = null;

    pm({
      data: paths,
      allPosts: new Map<string, string>(),
      weight: weight,
      helpers: helpers,
      source: source,
      timeout: 0,
    });
  };

  if (!isVideo(url, false)) {
    missingVideo();
  }
  if (url.startsWith("http")) {
    wretch(url)
      .get()
      .notFound((e) => {
        missingVideo();
      })
      .res((r) => {
        ifExists(url);
      });
  } else {
    const exists = fs.existsSync(url);
    if (exists) {
      ifExists(url);
    } else {
      missingVideo();
    }
  }
};

const loadPlaylist = (
  pm: Function,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number },
  cachePath: string,
) => {
  const url = cachePath ? cachePath : source.url;
  const promise = url.startsWith("http")
    ? wretch(url).get().text()
    : fs.promises.readFile(url, "utf-8");
  promise
    .then((data) => {
      let urls = [];
      if (url.endsWith(".asx")) {
        const refs = new DOMParser()
          .parseFromString(data, "text/xml")
          .getElementsByTagName("Ref");
        for (let r = 0; r < refs.length; r++) {
          const l = refs[r];
          urls.push(l.getAttribute("href"));
        }
      } else if (url.endsWith(".m3u8")) {
        for (let l of data.split("\n")) {
          if (l.length > 0 && !l.startsWith("#")) {
            urls.push(l.trim());
          }
        }
      } else if (url.endsWith(".pls")) {
        for (let l of data.split("\n")) {
          if (l.startsWith("File")) {
            urls.push(l.split("=")[1].trim());
          }
        }
      } else if (url.endsWith(".xspf")) {
        const locations = new DOMParser()
          .parseFromString(data, "text/xml")
          .getElementsByTagName("location");
        for (let r = 0; r < locations.length; r++) {
          const l = locations[r];
          urls.push(l.textContent);
        }
      }

      if (urls.length > 0) {
        helpers.count = urls.length;
      }

      urls = filterPathsToJustPlayable(filter, urls, true);

      if (source.blacklist && source.blacklist.length > 0) {
        urls = urls.filter((url: string) => !source.blacklist.includes(url));
      }
      helpers.next = null;

      pm({
        data: urls,
        allPosts: new Map<string, string>(),
        weight: weight,
        helpers: helpers,
        source: source,
        timeout: 0,
      });
    })
    .catch((e) => {
      pm({
        error: e.message,
        helpers: helpers,
        source: source,
        timeout: 0,
      });
    });
};

export function loadSources(
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number },
  cacheDir: string,
  onLoaded: (object: any) => void,
) {
  const pm = (object: any) => {
    if (object?.source && object?.data && object?.weight && object?.helpers) {
      const source = object.source;
      if (source.blacklist && source.blacklist.length > 0) {
        object.data = object.data.filter(
          (url: string) => !source.blacklist.includes(url),
        );
      }
    }

    onLoaded(object);
  };

  // Determine what kind of source we have based on the URL
  const sourceType = getSourceType(source.url);
  if (sourceType == ST.local) {
    // Local files
    loadLocalDirectory(pm, config, source, filter, weight, helpers, null);
  } else if (sourceType == ST.list) {
    // Image List
    helpers.next = null;
    loadRemoteImageURLList(config, source, filter, weight, helpers, pm);
  } else if (sourceType == ST.video) {
    const cachePath = cacheDir + getFileName(source.url, path.sep);
    loadVideo(
      pm,
      config,
      source,
      filter,
      weight,
      helpers,
      config.caching.enabled && fs.existsSync(cachePath) ? cachePath : null,
    );
  } else if (sourceType == ST.playlist) {
    const cachePath = cacheDir + getFileName(source.url, path.sep);
    loadPlaylist(
      pm,
      config,
      source,
      filter,
      weight,
      helpers,
      config.caching.enabled && fs.existsSync(cachePath) ? cachePath : null,
    );
  } else if (sourceType == ST.nimja) {
    loadNimja(pm, config, source, filter, weight, helpers, null);
  } else {
    // Paging sources
    let workerFunction: any;
    if (sourceType == ST.tumblr) {
      workerFunction = loadTumblr;
    } else if (sourceType == ST.redgifs) {
      workerFunction = loadRedGifs;
    } else if (sourceType == ST.imagefap) {
      workerFunction = loadImageFap;
    } else if (sourceType == ST.sexcom) {
      workerFunction = loadSexCom;
    } else if (sourceType == ST.imgur) {
      workerFunction = loadImgur;
    } else if (sourceType == ST.deviantart) {
      workerFunction = loadDeviantArt;
    } else if (sourceType == ST.danbooru) {
      workerFunction = loadDanbooru;
    } else if (sourceType == ST.e621) {
      workerFunction = loadE621;
    } else if (sourceType == ST.luscious) {
      workerFunction = loadLuscious;
    } else if (sourceType == ST.gelbooru1) {
      workerFunction = loadGelbooru1;
    } else if (sourceType == ST.gelbooru2) {
      workerFunction = loadGelbooru2;
    } else if (sourceType == ST.ehentai) {
      workerFunction = loadEHentai;
    } else if (sourceType == ST.bdsmlr) {
      workerFunction = loadBDSMlr;
    } else if (sourceType == ST.hydrus) {
      workerFunction = loadHydrus;
    } else if (sourceType == ST.piwigo) {
      workerFunction = loadPiwigo;
    }
    if (helpers.next == -1) {
      helpers.next = 0;
      const cachePath = cacheDir;
      if (
        config.caching.enabled &&
        fs.existsSync(cachePath) &&
        fs.readdirSync(cachePath).length > 0
      ) {
        // If the cache directory exists, use it
        loadLocalDirectory(
          pm,
          config,
          source,
          filter,
          weight,
          helpers,
          cachePath,
        );
      } else {
        workerFunction(config, source, filter, weight, helpers, pm);
      }
    } else {
      workerFunction(config, source, filter, weight, helpers, pm);
    }
  }
}
