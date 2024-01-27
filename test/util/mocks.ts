import * as fs from "fs";
import { initialAppStorage } from "../../src/storage/AppStorage";
import { initialSystemConstants } from "../../src/store/constants/SystemConstants";
import Config from "../../src/store/app/data/Config";

jest.mock("electron", () => {
  const originalModule = jest.requireActual("electron");
  return {
    __esModule: true,
    ...originalModule,
    ipcRenderer: {
      on: (event: string, action: Function) => {}
    },
    remote: {
      app: {
        getPath: (name: string) =>
          name === "appData" ? "/flipflip/data" : undefined,
        getAppPath: () => "/flipflip/app",
      },
      Menu: {
        setApplicationMenu: (menu: any) => {},
        buildFromTemplate: (template: any) => template
      },
      getCurrentWindow: () => ({
        setAlwaysOnTop: (alwaysOnTop: boolean) => {},
        setMenuBarVisibility: (showMenu: boolean) => {},
        setFullScreen: (fullScreen: boolean) => {}
      })
    },
  };
});

jest.mock("fs", () => {
  const originalModule = jest.requireActual("fs");
  return {
    __esModule: true,
    ...originalModule,
    readdirSync: (path: fs.PathLike): string[] => [],
  };
});

jest.mock("react-dom", () => ({
  // @ts-ignore
  ...jest.requireActual("react-dom"),
  createPortal: (node) => node,
}));

jest.mock('codemirror/lib/codemirror.css', () => ({}))
jest.mock('codemirror/theme/material.css', () => ({}))

window.URL.createObjectURL = jest.fn();
window.URL.revokeObjectURL = jest.fn();
window.Worker = jest.fn();

window.__VERSION__ = '1.0.0';
window.soundManager = {
  setup: jest.fn()
}

window.flipflip = {
  api: {
    newWindow: () => {},
    getWindowId: () => Promise.resolve(1),
    getAppStorageInitialState: () => Promise.resolve(initialAppStorage),
    saveAppStorage: (state: any) => {},
    backupAppStorage: () => Promise.resolve(),
    reportError: (title: string, body: string) => {},
    reloadWindow: () => {},
    openJsonFile: () => Promise.resolve(''),
    openSubtitleFile: () => Promise.resolve(''),
    openTextFile: () => Promise.resolve(''),
    openDirectory: () => Promise.resolve(''),
    openDirectories: () => Promise.resolve(''),
    openVideos: () => Promise.resolve(''),
    openExternal: (link: string) => {},
    openPath: (link: string) => {},
    readTextFile: (path: string) => Promise.resolve(''),
    readBinaryFile: (path: string) => Promise.resolve(new ArrayBuffer(0)),
    showCurrentWindow: () => {},
    showItemInFolder: (source: string) => {},
    loadThumb: (cachePath: string) => Promise.resolve(''),
    loadAudioSources: (shiftKey: boolean) => Promise.resolve(['']),
    loadScriptSources: (shiftKey: boolean) => Promise.resolve(['']),
    loadVideoSources: () => Promise.resolve(['']),
    buildMenu: () => {},
    gridToggleFullScreen: () => Promise.resolve(false),
    gridSetAlwaysOnTop: (alwaysOnTop: boolean) => {},
    gridSetMenuBarVisibility: (showMenu: boolean) => {},
    gridSetFullScreen: (fullScreen: boolean) => {},
    playerBack: () => {},
    playerToggleFullScreen: (
      isPlaying: boolean,
      canDelete: boolean,
      canChangeSource: boolean
    ) => Promise.resolve(false),
    playerSetAlwaysOnTop: (
      alwaysOnTop: boolean,
      isPlaying: boolean,
      canDelete: boolean,
      canChangeSource: boolean
    ) => {},
    playerSetMenuBarVisibility: (
      showMenu: boolean,
      isPlaying: boolean,
      canDelete: boolean,
      canChangeSource: boolean
    ) => {},
    playerSetFullScreen: (
      fullScreen: boolean,
      isPlaying: boolean,
      canDelete: boolean,
      canChangeSource: boolean
    ) => {},
    playerBuildMenu: (
      isPlaying: boolean,
      canDelete: boolean,
      canChangeSource: boolean
    ) => {},
    saveTextFile: (
      defaultPath: string,
      text: string
    ) => Promise.resolve(''),
    saveJsonFile: (defaultPath: string, text: string) => {},
    setProgressBar: (progress: number) => {},
    getMemoryReport: () => Promise.resolve(''),
    preventDisplaySleep: () => Promise.resolve(0),
    stopPreventDisplaySleep: (id: number) => {},
    clearCaches: () => {},
    getBackups: () => Promise.resolve([{ url: '', size: 0 }]),
    cachePath: (
      baseDir: string,
      source?: string,
      typeDir?: string
    ) => Promise.resolve(''),
    copyTextToClipboard: (text: string) => {},
    copyImageToClipboard: (imagePath: string) => {},
    tryCopyBufferToClipboard: (
      arrayBuffer: ArrayBuffer,
      imagePath: string
    ) => {},
    pathExists: (path: string) => Promise.resolve(false),
    deletePath: (path: string) => Promise.resolve(),
    showContextMenu: (
      literalSource: string,
      sourceURL: string,
      post: string,
      isFile: boolean,
      path: string,
      url: string,
      type: string,
      cachingEnabled: boolean,
      cachingDirectory: string,
      canGotoTagSource: boolean,
      recentPictureGrid: boolean,
      downloadScene: boolean
    ) => {},
    mkdir: (path: string) => Promise.resolve(),
    writeFile: (path: string, data: string) => Promise.resolve(),
    hasFiles: (path: string) => Promise.resolve(false),
    getDirectories: (path: string) => Promise.resolve([]),
    unlink: (path: string) => Promise.resolve(),
    readdir: (path: string) => Promise.resolve([]),
    move: (fromPath: string, toPath: string) => Promise.resolve(),
    outputFile: (
      path: string,
      data: string | ArrayBuffer
    ) => Promise.resolve(),
    igLogin: (username: string, password: string) => Promise.resolve(0),
    igTwoFactorLogin: (
      twoFactorIdentifier: any,
      username: string,
      verificationCode: string
    ) => Promise.resolve(),
    igSendSecurityCode: (code: string | number) => Promise.resolve(),
    igChallenge: () => Promise.resolve(),
    igSerializeCookieJar: () => Promise.resolve(''),
    igSavedItems: () => Promise.resolve({items: [], feed: 'saved'}),
    igUserFeedItems: (username: string) => Promise.resolve({items: [], feed: 'user'}),
    igGetMore: (
      session: string,
      id: number | undefined,
      feedSession: string
    ) => Promise.resolve(),
    igFollowingFeed: (userId: number) => Promise.resolve({items: [], feed: 'following'}),
    igGetMoreFollowingFeed: (
      session: string,
      userId: number,
      feedSession: string
    ) => Promise.resolve(),
    imgurAlbumImages: (album: string) => Promise.resolve([]),
    twitterLoadImages: (
      consumerKey: string,
      consumerSecret: string,
      accessTokenKey: string,
      accessTokenSecret: string,
      screenName: string,
      excludeReplies: boolean,
      includeRetweets: boolean,
      maxId: number
    ) => Promise.resolve({images: [], lastID: 0}),
    twitterFriendsList: (
      consumerKey: string,
      consumerSecret: string,
      accessTokenKey: string,
      accessTokenSecret: string,
      cursor: number | undefined
    ) => Promise.resolve({following: [], cursor: 0}),
    redditGetSubreddit: (
      redditUserAgent: string,
      redditClientID: string,
      redditRefreshToken: string,
      redditFunc: string,
      url: string,
      after: any,
      redditTime: string | undefined
    ) => Promise.resolve(''),
    redditGetSavedContent: (
      redditUserAgent: string,
      redditClientID: string,
      redditRefreshToken: string,
      url: string,
      after: any
    ) => Promise.resolve(''),
    redditGetUser: (
      redditUserAgent: string,
      redditClientID: string,
      redditRefreshToken: string,
      url: string,
      after: any
    ) => Promise.resolve(''),
    redditGetSubscriptions: (
      redditUserAgent: string,
      redditClientID: string,
      redditRefreshToken: string,
      after: any
    ) => Promise.resolve(''),
    tumblrBlogPosts: (
      consumerKey: string,
      consumerSecret: string,
      token: string,
      tokenSecret: string,
      blogID: string,
      offset: number
    ) => Promise.resolve(['']),
    tumblrTotalBlogs: (
      consumerKey: string,
      consumerSecret: string,
      token: string,
      tokenSecret: string
    ) => Promise.resolve(''),
    tumblrBlogs: (
      consumerKey: string,
      consumerSecret: string,
      token: string,
      tokenSecret: string,
      offset: number
    ) => Promise.resolve(['']),
    getFolderSize: (folder: string) => Promise.resolve(0),
    getSystemFonts: () => Promise.resolve([]),
    parseMusicMetadataFile: (url: string, cachePath: string) => Promise.resolve(''),
    parseMusicMetadataBpm: (url: string) => Promise.resolve(0),
    parseMusicMetadataBuffer: (
      arrayBuffer: ArrayBuffer,
      cachePath: string
    ) => Promise.resolve(0),
    rimrafSync: (path: string) => Promise.resolve(),
    cleanBackups: (config: Config) => Promise.resolve(0),
    tumblrOAuth: (
      requestTokenUrl: string,
      accessTokenUrl: string,
      tumblrKey: string,
      tumblrSecret: string,
      authorizeUrl: string
    ) => Promise.resolve(0),
    twitterOAuth: (
      requestTokenUrl: string,
      accessTokenUrl: string,
      consumerKey: string,
      consumerSecret: string,
      authorizeUrl: string
    ) => Promise.resolve(0),
    redditOAuth: (
      deviceID: string,
      userAgent: string,
      clientID: string
    ) => Promise.resolve(0),
    getFileUrl: (source: string) => Promise.resolve(''),
    recursiveReaddir: (
      url: string,
      blacklist: string[],
      sourceBlacklist: string[],
      filter: string,
      local: boolean
    ) => Promise.resolve(0),
    getContext: () => Promise.resolve(initialSystemConstants),
    loadInWorker: (event: string, args?: any[]) => {}
  },
  events: {
    onStartScene: (handler: (sceneName: string) => void) => {},
    removeStartScene: () => {},
    onGridNavigateBack: (handler: () => void) => {},
    removeGridNavigateBack: () => {},
    onGridToggleFullscreen: (handler: () => void) => {},
    removeGridToggleFullscreen: () => {},
    onGridToggleAlwaysOnTop: (handler: () => void) => {},
    removeGridToggleAlwaysOnTop: () => {},
    onGridToggleMenuBarDisplay: (handler: () => void) => {},
    removeGridToggleMenuBarDisplay: () => {},
    onPlayerPlayPause: (handler: () => void) => {},
    removePlayerPlayPause: () => {},
    onPlayerHistoryBack: (handler: () => void) => {},
    removePlayerHistoryBack: () => {},
    onPlayerHistoryForward: (handler: () => void) => {},
    removePlayerHistoryForward: () => {},
    onPlayerNavigateBack: (handler: () => void) => {},
    removePlayerNavigateBack: () => {},
    onPlayerToggleFullscreen: (handler: () => void) => {},
    removePlayerToggleFullscreen: () => {},
    onPlayerToggleAlwaysOnTop: (handler: () => void) => {},
    removePlayerToggleAlwaysOnTop: () => {},
    onPlayerToggleMenuBarDisplay: (handler: () => void) => {},
    removePlayerToggleMenuBarDisplay: () => {},
    onPlayerDelete: (handler: (path: string) => Promise<void>) => {},
    removePlayerDelete: () => {},
    onPlayerPrevSource: (handler: () => void) => {},
    removePlayerPrevSource: () => {},
    onPlayerNextSource: (handler: () => void) => {},
    removePlayerNextSource: () => {},
    onBlackListFile: (
      handler: (literalSource: string, file: string) => void
    ) => {},
    removeBlackListFile: () => {},
    onGotoTagSource: (handler: (sourceURL: string) => void) => {},
    removeGotoTagSource: () => {},
    onGotoClipSource: (handler: (sourceURL: string) => void) => {},
    onRecentPictureGrid: (handler: () => void) => {},
    removeGotoClipSource: () => {},
    removeRecentPictureGrid: () => {},
    onWorkerResponse: (handler: (message: any) => void) => {},
    removeWorkerResponse: () => {}
  },
  worker: {
    onMessage: (
      handler: (event: string, args: any[], webContentsId: number) => void
    ) => {},
    removeMessage: () => {},
    postMessage: (webContentsId: number, data: any) => {}
  }
}
