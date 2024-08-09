import {
  type IpcRendererEvent,
  contextBridge,
  ipcRenderer,
  webFrame
} from 'electron'
import { type InstagramItems } from './InstagramClient'
import { type TwitterItems, type TwitterFollowers } from './TwitterClient'
import { IPC } from '../renderer/data/const'
import type Config from '../storage/Config'
import type SystemConstants from '../store/constants/SystemConstants'

const removeEventListeners = (channel: string) =>
  ipcRenderer.removeAllListeners(channel)

contextBridge.exposeInMainWorld('flipflip', {
  api: {
    newWindow: () => {
      ipcRenderer.send(IPC.newWindow)
    },
    getWindowId: async () => await ipcRenderer.invoke(IPC.getWindowId),
    getAppStorageInitialState: async () =>
      await ipcRenderer.invoke(IPC.appStorageInitialState),
    saveAppStorage: (state: any) => {
      ipcRenderer.send(IPC.appStorageSave, state)
    },
    backupAppStorage: async () =>
      await ipcRenderer.invoke(IPC.appStorageBackup),
    reportError: (title: string, body: string) => {
      ipcRenderer.send(IPC.errorReport, title, body)
    },
    reloadWindow: () => {
      ipcRenderer.send(IPC.reloadWindow)
    },
    openJsonFile: async () => await ipcRenderer.invoke(IPC.openJsonFile),
    openSubtitleFile: async () =>
      await ipcRenderer.invoke(IPC.openSubtitleFile),
    openTextFile: async () => await ipcRenderer.invoke(IPC.openTextFile),
    openDirectory: async () => await ipcRenderer.invoke(IPC.openDirectory),
    openDirectories: async () => await ipcRenderer.invoke(IPC.openDirectories),
    openVideos: async () => await ipcRenderer.invoke(IPC.openVideos),
    openExternal: (link: string) => {
      ipcRenderer.send(IPC.openExternal, link)
    },
    openPath: (link: string) => {
      ipcRenderer.send(IPC.openPath, link)
    },
    readTextFile: async (path: string) =>
      await ipcRenderer.invoke(IPC.readTextFile, path),
    readBinaryFile: async (path: string) =>
      await ipcRenderer.invoke(IPC.readBinaryFile, path),
    showCurrentWindow: () => {
      ipcRenderer.send(IPC.showCurrentWindow)
    },
    showItemInFolder: (source: string) => {
      ipcRenderer.send(IPC.showItemInFolder, source)
    },
    loadThumb: async (cachePath: string) =>
      await ipcRenderer.invoke(IPC.loadThumb, cachePath),
    loadAudioSources: async (shiftKey: boolean) =>
      await ipcRenderer.invoke(IPC.loadAudioSources, shiftKey),
    loadScriptSources: async (shiftKey: boolean) =>
      await ipcRenderer.invoke(IPC.loadScriptSources, shiftKey),
    loadVideoSources: async () =>
      await ipcRenderer.invoke(IPC.loadVideoSources),
    buildMenu: () => {
      ipcRenderer.send(IPC.buildMenu)
    },
    gridToggleFullScreen: async () =>
      await ipcRenderer.invoke(IPC.gridToggleFullScreen),
    gridSetAlwaysOnTop: (alwaysOnTop: boolean) => {
      ipcRenderer.send(IPC.gridSetAlwaysOnTop, alwaysOnTop)
    },
    gridSetMenuBarVisibility: (showMenu: boolean) => {
      ipcRenderer.send(IPC.gridSetMenuBarVisibility, showMenu)
    },
    gridSetFullScreen: (fullScreen: boolean) => {
      ipcRenderer.send(IPC.gridSetFullScreen, fullScreen)
    },
    playerBack: async () => await ipcRenderer.invoke(IPC.playerBack),
    playerToggleFullScreen: async (
      isPlaying: boolean,
      canDelete: boolean,
      canChangeSource: boolean
    ) =>
      await ipcRenderer.invoke(
        IPC.playerToggleFullScreen,
        isPlaying,
        canDelete,
        canChangeSource
      ),
    playerSetAlwaysOnTop: (
      alwaysOnTop: boolean,
      isPlaying: boolean,
      canDelete: boolean,
      canChangeSource: boolean
    ) => {
      ipcRenderer.send(
        IPC.playerSetAlwaysOnTop,
        alwaysOnTop,
        isPlaying,
        canDelete,
        canChangeSource
      )
    },
    playerSetMenuBarVisibility: (
      showMenu: boolean,
      isPlaying: boolean,
      canDelete: boolean,
      canChangeSource: boolean
    ) => {
      ipcRenderer.send(
        IPC.playerSetMenuBarVisibility,
        showMenu,
        isPlaying,
        canDelete,
        canChangeSource
      )
    },
    playerSetFullScreen: (
      fullScreen: boolean,
      isPlaying: boolean,
      canDelete: boolean,
      canChangeSource: boolean
    ) => {
      ipcRenderer.send(
        IPC.playerSetFullScreen,
        fullScreen,
        isPlaying,
        canDelete,
        canChangeSource
      )
    },
    playerBuildMenu: (
      isPlaying: boolean,
      canDelete: boolean,
      canChangeSource: boolean
    ) => {
      ipcRenderer.send(
        IPC.playerBuildMenu,
        isPlaying,
        canDelete,
        canChangeSource
      )
    },
    saveTextFile: async (defaultPath: string, text: string) =>
      await ipcRenderer.invoke(IPC.saveTextFile, defaultPath, text),
    saveJsonFile: (defaultPath: string, text: string) => {
      ipcRenderer.send(IPC.saveJsonFile, defaultPath, text)
    },
    setProgressBar: (progress: number) => {
      ipcRenderer.send(IPC.setProgressBar, progress)
    },
    getMemoryReport: () => {
      const resourceUsage = webFrame.getResourceUsage()
      ipcRenderer.invoke(IPC.getMemoryReport, resourceUsage)
    },
    preventDisplaySleep: async () =>
      await ipcRenderer.invoke(IPC.preventDisplaySleep),
    stopPreventDisplaySleep: (id: number) => {
      ipcRenderer.send(IPC.stopPreventDisplaySleep, id)
    },
    clearCaches: () => {
      webFrame.clearCache()
      ipcRenderer.send(IPC.clearCaches)
    },
    getBackups: async () => await ipcRenderer.invoke(IPC.getBackups),
    cachePath: async (baseDir: string, source?: string, typeDir?: string) =>
      await ipcRenderer.invoke(IPC.cachePath, baseDir, source, typeDir),
    copyTextToClipboard: (text: string) => {
      ipcRenderer.send(IPC.copyTextToClipboard, text)
    },
    copyImageToClipboard: (imagePath: string) => {
      ipcRenderer.send(IPC.copyImageToClipboard, imagePath)
    },
    tryCopyBufferToClipboard: (arrayBuffer: ArrayBuffer, imagePath: string) => {
      ipcRenderer.send(IPC.tryCopyBufferToClipboard, arrayBuffer, imagePath)
    },
    pathExists: async (path: string) =>
      await ipcRenderer.invoke(IPC.pathExists, path),
    deletePath: async (path: string) =>
      await ipcRenderer.invoke(IPC.deletePath, path),
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
    ) => {
      ipcRenderer.send(
        IPC.showContextMenu,
        literalSource,
        sourceURL,
        post,
        isFile,
        path,
        url,
        type,
        cachingEnabled,
        cachingDirectory,
        canGotoTagSource,
        recentPictureGrid,
        downloadScene
      )
    },
    mkdir: async (path: string) => await ipcRenderer.invoke(IPC.mkdir, path),
    writeFile: async (path: string, data: string) =>
      await ipcRenderer.invoke(IPC.writeFile, path, data),
    hasFiles: async (path: string) =>
      await ipcRenderer.invoke(IPC.hasFiles, path),
    getDirectories: async (path: string) =>
      await ipcRenderer.invoke(IPC.getDirectories, path),
    unlink: async (path: string) => await ipcRenderer.invoke(IPC.unlink, path),
    readdir: async (path: string) =>
      await ipcRenderer.invoke(IPC.readdir, path),
    move: async (fromPath: string, toPath: string) =>
      await ipcRenderer.invoke(IPC.move, fromPath, toPath),
    outputFile: async (path: string, data: string | ArrayBuffer) =>
      await ipcRenderer.invoke(IPC.outputFile, path, data),
    igLogin: async (username: string, password: string) =>
      await ipcRenderer.invoke(IPC.igLogin, username, password),
    igTwoFactorLogin: async (
      twoFactorIdentifier: any,
      username: string,
      verificationCode: string
    ) =>
      await ipcRenderer.invoke(
        IPC.igTwoFactorLogin,
        twoFactorIdentifier,
        username,
        verificationCode
      ),
    igSendSecurityCode: async (code: string | number) =>
      await ipcRenderer.invoke(IPC.igSendSecurityCode, code),
    igChallenge: async () => await ipcRenderer.invoke(IPC.igChallenge),
    igSerializeCookieJar: async () =>
      await ipcRenderer.invoke(IPC.igSerializeCookieJar),
    igSavedItems: async () => await ipcRenderer.invoke(IPC.igSavedItems),
    igUserFeedItems: async (username: string) =>
      await ipcRenderer.invoke(IPC.igUserFeedItems, username),
    igGetMore: async (
      session: string,
      id: number | undefined,
      feedSession: string
    ) => await ipcRenderer.invoke(IPC.igGetMore, session, id, feedSession),
    igFollowingFeed: async (userId: number) =>
      await ipcRenderer.invoke(IPC.igFollowingFeed, userId),
    igGetMoreFollowingFeed: async (
      session: string,
      userId: number,
      feedSession: string
    ) =>
      await ipcRenderer.invoke(
        IPC.igGetMoreFollowingFeed,
        session,
        userId,
        feedSession
      ),
    imgurAlbumImages: async (album: string) =>
      await ipcRenderer.invoke(IPC.imgurAlbumImages, album),
    twitterLoadImages: async (
      consumerKey: string,
      consumerSecret: string,
      accessTokenKey: string,
      accessTokenSecret: string,
      screenName: string,
      excludeReplies: boolean,
      includeRetweets: boolean,
      maxId: number
    ) =>
      await ipcRenderer.invoke(
        IPC.twitterLoadImages,
        consumerKey,
        consumerSecret,
        accessTokenKey,
        accessTokenSecret,
        screenName,
        excludeReplies,
        includeRetweets,
        maxId
      ),
    twitterFriendsList: async (
      consumerKey: string,
      consumerSecret: string,
      accessTokenKey: string,
      accessTokenSecret: string,
      cursor: number | undefined
    ) =>
      await ipcRenderer.invoke(
        IPC.twitterFriendsList,
        consumerKey,
        consumerSecret,
        accessTokenKey,
        accessTokenSecret,
        cursor
      ),
    redditGetSubreddit: async (
      redditUserAgent: string,
      redditClientID: string,
      redditRefreshToken: string,
      redditFunc: string,
      url: string,
      after: any,
      redditTime: string | undefined
    ) =>
      await ipcRenderer.invoke(
        IPC.redditGetSubreddit,
        redditUserAgent,
        redditClientID,
        redditRefreshToken,
        redditFunc,
        url,
        after,
        redditTime
      ),
    redditGetSavedContent: async (
      redditUserAgent: string,
      redditClientID: string,
      redditRefreshToken: string,
      url: string,
      after: any
    ) =>
      await ipcRenderer.invoke(
        IPC.redditGetSavedContent,
        redditUserAgent,
        redditClientID,
        redditRefreshToken,
        url,
        after
      ),
    redditGetUser: async (
      redditUserAgent: string,
      redditClientID: string,
      redditRefreshToken: string,
      url: string,
      after: any
    ) =>
      await ipcRenderer.invoke(
        IPC.redditGetUser,
        redditUserAgent,
        redditClientID,
        redditRefreshToken,
        url,
        after
      ),
    redditGetSubscriptions: async (
      redditUserAgent: string,
      redditClientID: string,
      redditRefreshToken: string,
      after: any
    ) =>
      await ipcRenderer.invoke(
        IPC.redditGetSubscriptions,
        redditUserAgent,
        redditClientID,
        redditRefreshToken,
        after
      ),
    tumblrBlogPosts: async (
      consumerKey: string,
      consumerSecret: string,
      token: string,
      tokenSecret: string,
      blogID: string,
      offset: number
    ) =>
      await ipcRenderer.invoke(
        IPC.tumblrBlogPosts,
        consumerKey,
        consumerSecret,
        token,
        tokenSecret,
        blogID,
        offset
      ),
    tumblrTotalBlogs: async (
      consumerKey: string,
      consumerSecret: string,
      token: string,
      tokenSecret: string
    ) =>
      await ipcRenderer.invoke(
        IPC.tumblrTotalBlogs,
        consumerKey,
        consumerSecret,
        token,
        tokenSecret
      ),
    tumblrBlogs: async (
      consumerKey: string,
      consumerSecret: string,
      token: string,
      tokenSecret: string,
      offset: number
    ) =>
      await ipcRenderer.invoke(
        IPC.tumblrBlogs,
        consumerKey,
        consumerSecret,
        token,
        tokenSecret,
        offset
      ),
    getFolderSize: async (folder: string) =>
      await ipcRenderer.invoke(IPC.getFolderSize, folder),
    getSystemFonts: async () => await ipcRenderer.invoke(IPC.getSystemFonts),
    parseMusicMetadataFile: async (url: string, cachePath: string) =>
      await ipcRenderer.invoke(IPC.parseMusicMetadataFile, url, cachePath),
    parseMusicMetadataBpm: async (url: string) =>
      await ipcRenderer.invoke(IPC.parseMusicMetadataBpm, url),
    parseMusicMetadataBuffer: async (
      arrayBuffer: ArrayBuffer,
      cachePath: string
    ) =>
      await ipcRenderer.invoke(
        IPC.parseMusicMetadataBuffer,
        arrayBuffer,
        cachePath
      ),
    rimrafSync: async (path: string) =>
      await ipcRenderer.invoke(IPC.rimrafSync, path),
    cleanBackups: async (config: Config) =>
      await ipcRenderer.invoke(IPC.cleanBackups, config),
    tumblrOAuth: async (
      requestTokenUrl: string,
      accessTokenUrl: string,
      tumblrKey: string,
      tumblrSecret: string,
      authorizeUrl: string
    ) =>
      await ipcRenderer.invoke(
        IPC.tumblrOAuth,
        requestTokenUrl,
        accessTokenUrl,
        tumblrKey,
        tumblrSecret,
        authorizeUrl
      ),
    twitterOAuth: async (
      requestTokenUrl: string,
      accessTokenUrl: string,
      consumerKey: string,
      consumerSecret: string,
      authorizeUrl: string
    ) =>
      await ipcRenderer.invoke(
        IPC.twitterOAuth,
        requestTokenUrl,
        accessTokenUrl,
        consumerKey,
        consumerSecret,
        authorizeUrl
      ),
    redditOAuth: async (
      deviceID: string,
      userAgent: string,
      clientID: string
    ) =>
      await ipcRenderer.invoke(IPC.redditOAuth, deviceID, userAgent, clientID),
    getFileUrl: async (source: string) =>
      await ipcRenderer.invoke(IPC.getFileUrl, source),
    recursiveReaddir: async (
      url: string,
      blacklist: string[],
      sourceBlacklist: string[],
      filter: string,
      local: boolean
    ) =>
      await ipcRenderer.invoke(
        IPC.recursiveReaddir,
        url,
        blacklist,
        sourceBlacklist,
        filter,
        local
      ),
    getContext: async () => await ipcRenderer.invoke(IPC.getContext),
    loadInWorker: (event: string, args?: any[]) => {
      ipcRenderer.send(IPC.loadInWorker, event, args)
    }
  },
  events: {
    onStartScene: (handler: (sceneName: string) => void) =>
      ipcRenderer.on(
        IPC.startScene,
        (ev: IpcRendererEvent, sceneName: string) => {
          handler(sceneName)
        }
      ),
    removeStartScene: () => removeEventListeners(IPC.startScene),
    onGridNavigateBack: (handler: () => void) =>
      ipcRenderer.on(IPC.gridNavigateBack, (ev: IpcRendererEvent) => {
        handler()
      }),
    removeGridNavigateBack: () => removeEventListeners(IPC.gridNavigateBack),
    onGridToggleFullscreen: (handler: () => void) =>
      ipcRenderer.on(IPC.gridToggleFullscreen, (ev: IpcRendererEvent) => {
        handler()
      }),
    removeGridToggleFullscreen: () =>
      removeEventListeners(IPC.gridToggleFullscreen),
    onGridToggleAlwaysOnTop: (handler: () => void) =>
      ipcRenderer.on(IPC.gridToggleAlwaysOnTop, (ev: IpcRendererEvent) => {
        handler()
      }),
    removeGridToggleAlwaysOnTop: () =>
      removeEventListeners(IPC.gridToggleAlwaysOnTop),
    onGridToggleMenuBarDisplay: (handler: () => void) =>
      ipcRenderer.on(IPC.gridToggleMenuBarDisplay, (ev: IpcRendererEvent) => {
        handler()
      }),
    removeGridToggleMenuBarDisplay: () =>
      removeEventListeners(IPC.gridToggleMenuBarDisplay),
    onPlayerPlayPause: (handler: () => void) =>
      ipcRenderer.on(IPC.playerPlayPause, (ev: IpcRendererEvent) => {
        handler()
      }),
    removePlayerPlayPause: () => removeEventListeners(IPC.playerPlayPause),
    onPlayerHistoryBack: (handler: () => void) =>
      ipcRenderer.on(IPC.playerHistoryBack, (ev: IpcRendererEvent) => {
        handler()
      }),
    removePlayerHistoryBack: () => removeEventListeners(IPC.playerHistoryBack),
    onPlayerHistoryForward: (handler: () => void) =>
      ipcRenderer.on(IPC.playerHistoryForward, (ev: IpcRendererEvent) => {
        handler()
      }),
    removePlayerHistoryForward: () =>
      removeEventListeners(IPC.playerHistoryForward),
    onPlayerNavigateBack: (handler: () => void) =>
      ipcRenderer.on(IPC.playerNavigateBack, (ev: IpcRendererEvent) => {
        handler()
      }),
    removePlayerNavigateBack: () =>
      removeEventListeners(IPC.playerNavigateBack),
    onPlayerToggleFullscreen: (handler: () => void) =>
      ipcRenderer.on(IPC.playerToggleFullscreen, (ev: IpcRendererEvent) => {
        handler()
      }),
    removePlayerToggleFullscreen: () =>
      removeEventListeners(IPC.playerToggleFullscreen),
    onPlayerToggleAlwaysOnTop: (handler: () => void) =>
      ipcRenderer.on(IPC.playerToggleAlwaysOnTop, (ev: IpcRendererEvent) => {
        handler()
      }),
    removePlayerToggleAlwaysOnTop: () =>
      removeEventListeners(IPC.playerToggleAlwaysOnTop),
    onPlayerToggleMenuBarDisplay: (handler: () => void) =>
      ipcRenderer.on(IPC.playerToggleMenuBarDisplay, (ev: IpcRendererEvent) => {
        handler()
      }),
    removePlayerToggleMenuBarDisplay: () =>
      removeEventListeners(IPC.playerToggleMenuBarDisplay),
    onPlayerDelete: (handler: (path: string) => Promise<void>) =>
      ipcRenderer.on(IPC.playerDelete, (ev: IpcRendererEvent, path: string) => {
        handler(path)
      }),
    removePlayerDelete: () => removeEventListeners(IPC.playerDelete),
    onPlayerPrevSource: (handler: () => void) =>
      ipcRenderer.on(IPC.playerPrevSource, (ev: IpcRendererEvent) => {
        handler()
      }),
    removePlayerPrevSource: () => removeEventListeners(IPC.playerPrevSource),
    onPlayerNextSource: (handler: () => void) =>
      ipcRenderer.on(IPC.playerNextSource, (ev: IpcRendererEvent) => {
        handler()
      }),
    removePlayerNextSource: () => removeEventListeners(IPC.playerNextSource),
    onBlackListFile: (handler: (literalSource: string, file: string) => void) =>
      ipcRenderer.on(
        IPC.blackListFile,
        (ev: IpcRendererEvent, literalSource: string, file: string) => {
          handler(literalSource, file)
        }
      ),
    removeBlackListFile: () => removeEventListeners(IPC.blackListFile),
    onGotoTagSource: (handler: (sourceURL: string) => void) =>
      ipcRenderer.on(
        IPC.gotoTagSource,
        (ev: IpcRendererEvent, sourceURL: string) => {
          handler(sourceURL)
        }
      ),
    removeGotoTagSource: () => removeEventListeners(IPC.gotoTagSource),
    onGotoClipSource: (handler: (sourceURL: string) => void) =>
      ipcRenderer.on(
        IPC.gotoClipSource,
        (ev: IpcRendererEvent, sourceURL: string) => {
          handler(sourceURL)
        }
      ),
    removeGotoClipSource: () => removeEventListeners(IPC.gotoClipSource),
    onRecentPictureGrid: (handler: () => void) =>
      ipcRenderer.on(IPC.recentPictureGrid, (ev: IpcRendererEvent) => {
        handler()
      }),
    removeRecentPictureGrid: () => removeEventListeners(IPC.recentPictureGrid),
    onWorkerResponse: (uuid: string, handler: (message: any) => void) => {
      const listener = (ev: IpcRendererEvent, message: any) => {
        if(message.data?.helpers?.uuid === uuid) {
          ipcRenderer.removeListener(IPC.workerResponse, listener)
        }
        handler(message)
      }

      ipcRenderer.on(IPC.workerResponse, listener)
    },
  },
  worker: {
    onMessage: (
      handler: (event: string, args: any[], webContentsId: number) => void
    ) =>
      ipcRenderer.on(
        IPC.workerReceiveMessage,
        (
          ev: IpcRendererEvent,
          event: string,
          args: any[],
          webContentsId: number
        ) => {
          handler(event, args, webContentsId)
        }
      ),
    removeMessage: () => removeEventListeners(IPC.workerReceiveMessage),
    postMessage: (webContentsId: number, data: any) => {
      ipcRenderer.send(IPC.workerSendMessage, webContentsId, data)
    }
  }
})

declare global {
  interface Window {
    flipflip: {
      api: {
        newWindow: () => void
        getWindowId: () => Promise<number>
        getAppStorageInitialState: () => Promise<any>
        saveAppStorage: (state: any) => void
        backupAppStorage: () => Promise<undefined>
        reportError: (title: string, body: string) => void
        reloadWindow: () => void
        openJsonFile: () => Promise<string | undefined>
        openSubtitleFile: () => Promise<string | undefined>
        openTextFile: () => Promise<string | undefined>
        openDirectory: () => Promise<string | undefined>
        openDirectories: () => Promise<string[] | undefined>
        openVideos: () => Promise<string[] | undefined>
        openExternal: (link: string) => void
        openPath: (link: string) => void
        readTextFile: (path: string) => Promise<string>
        readBinaryFile: (path: string) => Promise<ArrayBuffer>
        showCurrentWindow: () => void
        showItemInFolder: (source: string) => void
        loadThumb: (cachePath: string) => Promise<string | undefined>
        loadAudioSources: (shiftKey: boolean) => Promise<string[] | undefined>
        loadScriptSources: (shiftKey: boolean) => Promise<string[] | undefined>
        loadVideoSources: () => Promise<string[]>
        buildMenu: () => void
        gridToggleFullScreen: () => Promise<boolean>
        gridSetAlwaysOnTop: (alwaysOnTop: boolean) => void
        gridSetMenuBarVisibility: (showMenu: boolean) => void
        gridSetFullScreen: (fullScreen: boolean) => void
        playerBack: () => void
        playerToggleFullScreen: (
          isPlaying: boolean,
          canDelete: boolean,
          canChangeSource: boolean
        ) => Promise<boolean>
        playerSetAlwaysOnTop: (
          alwaysOnTop: boolean,
          isPlaying: boolean,
          canDelete: boolean,
          canChangeSource: boolean
        ) => void
        playerSetMenuBarVisibility: (
          showMenu: boolean,
          isPlaying: boolean,
          canDelete: boolean,
          canChangeSource: boolean
        ) => void
        playerSetFullScreen: (
          fullScreen: boolean,
          isPlaying: boolean,
          canDelete: boolean,
          canChangeSource: boolean
        ) => void
        playerBuildMenu: (
          isPlaying: boolean,
          canDelete: boolean,
          canChangeSource: boolean
        ) => void
        saveTextFile: (
          defaultPath: string,
          text: string
        ) => Promise<string | undefined>
        saveJsonFile: (defaultPath: string, text: string) => void
        setProgressBar: (progress: number) => void
        getMemoryReport: () => Promise<string>
        preventDisplaySleep: () => Promise<number>
        stopPreventDisplaySleep: (id: number) => void
        clearCaches: () => void
        getBackups: () => Promise<Array<{ url: string, size: number }>>
        cachePath: (
          baseDir: string,
          source?: string,
          typeDir?: string
        ) => Promise<string | undefined>
        copyTextToClipboard: (text: string) => void
        copyImageToClipboard: (imagePath: string) => void
        tryCopyBufferToClipboard: (
          arrayBuffer: ArrayBuffer,
          imagePath: string
        ) => void
        pathExists: (path: string) => Promise<boolean>
        deletePath: (path: string) => Promise<NodeJS.ErrnoException>
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
        ) => void
        mkdir: (path: string) => Promise<undefined>
        writeFile: (path: string, data: string) => Promise<undefined>
        hasFiles: (path: string) => Promise<boolean>
        getDirectories: (path: string) => Promise<string[]>
        unlink: (path: string) => Promise<undefined>
        readdir: (path: string) => Promise<string[]>
        move: (fromPath: string, toPath: string) => Promise<undefined>
        outputFile: (
          path: string,
          data: string | ArrayBuffer
        ) => Promise<undefined>
        igLogin: (username: string, password: string) => Promise<number>
        igTwoFactorLogin: (
          twoFactorIdentifier: any,
          username: string,
          verificationCode: string
        ) => Promise<undefined>
        igSendSecurityCode: (code: string | number) => Promise<undefined>
        igChallenge: () => Promise<undefined>
        igSerializeCookieJar: () => Promise<string>
        igSavedItems: () => Promise<InstagramItems>
        igUserFeedItems: (username: string) => Promise<InstagramItems>
        igGetMore: (
          session: string,
          id: number | undefined,
          feedSession: string
        ) => Promise<InstagramItems | undefined>
        igFollowingFeed: (userId: number) => Promise<InstagramItems>
        igGetMoreFollowingFeed(
          session: string,
          userId: number,
          feedSession: string
        ): Promise<InstagramItems | undefined>
        imgurAlbumImages(album: string): Promise<string[]>
        twitterLoadImages(
          consumerKey: string,
          consumerSecret: string,
          accessTokenKey: string,
          accessTokenSecret: string,
          screenName: string,
          excludeReplies: boolean,
          includeRetweets: boolean,
          maxId: number
        ): Promise<TwitterItems>
        twitterFriendsList(
          consumerKey: string,
          consumerSecret: string,
          accessTokenKey: string,
          accessTokenSecret: string,
          cursor: number | undefined
        ): Promise<TwitterFollowers>
        redditGetSubreddit(
          redditUserAgent: string,
          redditClientID: string,
          redditRefreshToken: string,
          redditFunc: string,
          url: string,
          after: any,
          redditTime: string | undefined
        ): Promise<any>
        redditGetSavedContent(
          redditUserAgent: string,
          redditClientID: string,
          redditRefreshToken: string,
          url: string,
          after: any
        ): Promise<any>
        redditGetUser(
          redditUserAgent: string,
          redditClientID: string,
          redditRefreshToken: string,
          url: string,
          after: any
        ): Promise<any>
        redditGetSubscriptions(
          redditUserAgent: string,
          redditClientID: string,
          redditRefreshToken: string,
          after: any
        ): Promise<any>
        tumblrBlogPosts(
          consumerKey: string,
          consumerSecret: string,
          token: string,
          tokenSecret: string,
          blogID: string,
          offset: number
        ): Promise<any[]>
        tumblrTotalBlogs(
          consumerKey: string,
          consumerSecret: string,
          token: string,
          tokenSecret: string
        ): Promise<any>
        tumblrBlogs(
          consumerKey: string,
          consumerSecret: string,
          token: string,
          tokenSecret: string,
          offset: number
        ): Promise<any[]>
        getFolderSize(folder: string): Promise<number>
        getSystemFonts(): Promise<string[]>
        parseMusicMetadataFile(url: string, cachePath: string): Promise<any>
        parseMusicMetadataBpm(url: string): Promise<number | undefined>
        parseMusicMetadataBuffer(
          arrayBuffer: ArrayBuffer,
          cachePath: string
        ): Promise<any>
        rimrafSync(path: string): Promise<undefined>
        cleanBackups(config: Config): Promise<undefined>
        tumblrOAuth(
          requestTokenUrl: string,
          accessTokenUrl: string,
          tumblrKey: string,
          tumblrSecret: string,
          authorizeUrl: string
        ): Promise<any>
        twitterOAuth(
          requestTokenUrl: string,
          accessTokenUrl: string,
          consumerKey: string,
          consumerSecret: string,
          authorizeUrl: string
        ): Promise<any>
        redditOAuth(
          deviceID: string,
          userAgent: string,
          clientID: string
        ): Promise<any>
        getFileUrl(source: string): Promise<string>
        recursiveReaddir(
          url: string,
          blacklist: string[],
          sourceBlacklist: string[],
          filter: string,
          local: boolean
        ): Promise<any>
        getContext(): Promise<SystemConstants>
        loadInWorker(event: string, args?: any[]): void
      }
      events: {
        onStartScene: (handler: (sceneName: string) => void) => void
        removeStartScene: () => void
        onGridNavigateBack: (handler: () => void) => void
        removeGridNavigateBack: () => void
        onGridToggleFullscreen: (handler: () => void) => void
        removeGridToggleFullscreen: () => void
        onGridToggleAlwaysOnTop: (handler: () => void) => void
        removeGridToggleAlwaysOnTop: () => void
        onGridToggleMenuBarDisplay: (handler: () => void) => void
        removeGridToggleMenuBarDisplay: () => void
        onPlayerPlayPause: (handler: () => void) => void
        removePlayerPlayPause: () => void
        onPlayerHistoryBack: (handler: () => void) => void
        removePlayerHistoryBack: () => void
        onPlayerHistoryForward: (handler: () => void) => void
        removePlayerHistoryForward: () => void
        onPlayerNavigateBack: (handler: () => void) => void
        removePlayerNavigateBack: () => void
        onPlayerToggleFullscreen: (handler: () => void) => void
        removePlayerToggleFullscreen: () => void
        onPlayerToggleAlwaysOnTop: (handler: () => void) => void
        removePlayerToggleAlwaysOnTop: () => void
        onPlayerToggleMenuBarDisplay: (handler: () => void) => void
        removePlayerToggleMenuBarDisplay: () => void
        onPlayerDelete: (handler: (path: string) => Promise<void>) => void
        removePlayerDelete: () => void
        onPlayerPrevSource: (handler: () => void) => void
        removePlayerPrevSource: () => void
        onPlayerNextSource: (handler: () => void) => void
        removePlayerNextSource: () => void
        onBlackListFile: (
          handler: (literalSource: string, file: string) => void
        ) => void
        removeBlackListFile: () => void
        onGotoTagSource: (handler: (sourceURL: string) => void) => void
        removeGotoTagSource: () => void
        onGotoClipSource: (handler: (sourceURL: string) => void) => void
        onRecentPictureGrid: (handler: () => void) => void
        removeGotoClipSource: () => void
        removeRecentPictureGrid: () => void
        onWorkerResponse: (uuid: string, handler: (message: any) => void) => void
      }
      worker: {
        onMessage: (
          handler: (event: string, args: any[], webContentsId: number) => void
        ) => void
        removeMessage: () => void
        postMessage: (webContentsId: number, data: any) => void
      }
    }
  }
}

// to export Window interface
export {}
