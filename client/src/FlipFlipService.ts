import {
  SystemConstants,
  InstagramItems,
  TwitterFollowers,
  AppStorage,
  initialAppStorage,
  Config as ConfigStorage,
  LibrarySource as LibrarySourceStorage,
  WebSocketMessage,
  IPC,
  ScraperHelpers,
  ScrapeResult
} from 'flipflip-common'
import { initialSystemConstants } from './store/constants/SystemConstants'
import Config from './store/app/data/Config'
import { toConfigStorage } from './store/app/convert'
import { RootState } from './store/store'

export class FlipFlipService {
  public static devServerURL?: string
  private static instance: FlipFlipService
  private readonly ws: WebSocket

  public readonly api: FlipFlipAPI
  public readonly events: FlipFlipEvents
  public readonly worker: FlipFlipWorker
  public readonly clipboard: ClipboardService

  private constructor() {
    const origin =
      FlipFlipService.devServerURL ??
      window.location.origin.replace('http', 'ws')
    this.ws = new WebSocket(`${origin}/flipflip`)
    this.api = new FlipFlipAPI(this.ws)
    this.events = new FlipFlipEvents(this.ws)
    this.worker = new FlipFlipWorker(this.ws)
    this.clipboard = new ClipboardService()
  }

  public static getInstance(): FlipFlipService {
    if (!FlipFlipService.instance) {
      FlipFlipService.instance = new FlipFlipService()
    }

    return FlipFlipService.instance
  }
}

class FlipFlipAPI {
  private readonly ws: WebSocket
  private nextMessageID: number

  constructor(ws: WebSocket) {
    this.ws = ws
    this.nextMessageID = 1
  }

  public async getWindowId(): Promise<number | undefined> {
    return await this.invoke(IPC.getWindowId).then((args: any[] | undefined) =>
      args != null ? (args[0] as number) : -1
    )
  }

  public async getAppStorageInitialState(): Promise<AppStorage> {
    return await this.invoke(IPC.appStorageInitialState).then(
      (args: any[] | undefined) =>
        args != null ? (args[0] as AppStorage) : initialAppStorage
    )
  }

  public saveAppStorage(state: any): Promise<boolean> {
    return this.invoke(IPC.appStorageSave, state).then(
      (args: any[] | undefined) => {
        return args != null && args.length > 0 && args[0] === true
      }
    )
  }

  public async backupAppStorage(): Promise<void> {
    await this.invoke(IPC.appStorageBackup)
  }

  public async openJsonFile(): Promise<string | undefined> {
    return await this.invoke(IPC.openJsonFile).then(
      (args: any[] | undefined) =>
        args != null ? (args[0] as string) : undefined
    )
  }

  public async openSubtitleFile(): Promise<string | undefined> {
    return await this.invoke(IPC.openSubtitleFile).then(
      (args: any[] | undefined) =>
        args != null ? (args[0] as string) : undefined
    )
  }

  public async openTextFile(): Promise<string | undefined> {
    return await this.invoke(IPC.openTextFile).then(
      (args: any[] | undefined) =>
        args != null ? (args[0] as string) : undefined
    )
  }

  public async openDirectory(): Promise<string | undefined> {
    return await this.invoke(IPC.openDirectory).then(
      (args: any[] | undefined) =>
        args != null ? (args[0] as string) : undefined
    )
  }

  public async openDirectories(): Promise<string[] | undefined> {
    return await this.invoke(IPC.openDirectories).then(
      (args: any[] | undefined) =>
        args != null ? (args[0] as string[]) : undefined
    )
  }

  public async openVideos(): Promise<string[] | undefined> {
    return await this.invoke(IPC.openVideos).then((args: any[] | undefined) =>
      args != null ? (args[0] as string[]) : undefined
    )
  }

  public async readTextFile(path: string): Promise<string> {
    return await this.invoke(IPC.readTextFile, path).then(
      (args: any[] | undefined) =>
        args != null && args.length > 0 ? (args[0] as string) : ''
    )
  }

  public async readBinaryFile(path: string): Promise<ArrayBuffer> {
    return await this.invoke(IPC.readBinaryFile, path).then(
      (args: any[] | undefined) =>
        args != null && args.length > 0 ? Buffer.from(args[0]) : Buffer.from([])
    )
  }

  public showItemInFolder(source: string): void {
    this.send(IPC.showItemInFolder, source)
  }

  public async loadThumb(cachePath: string): Promise<string | undefined> {
    return await this.invoke(IPC.loadThumb, cachePath).then(
      (args: any[] | undefined) =>
        args != null ? (args[0] as string) : undefined
    )
  }

  public async loadAudioSources(
    shiftKey: boolean
  ): Promise<string[] | undefined> {
    return await this.invoke(IPC.loadAudioSources, shiftKey)
  }

  public async loadScriptSources(
    shiftKey: boolean
  ): Promise<string[] | undefined> {
    return await this.invoke(IPC.loadScriptSources, shiftKey)
  }

  public async loadVideoSources(): Promise<string[]> {
    return await this.invoke(IPC.loadVideoSources).then(
      (args: any[] | undefined) => (args != null ? (args[0] as string[]) : [])
    )
  }

  public async saveTextFile(
    defaultPath: string,
    text: string
  ): Promise<string | undefined> {
    return await this.invoke(IPC.saveTextFile, defaultPath, text).then(
      (args: any[] | undefined) =>
        args != null ? (args[0] as string) : undefined
    )
  }

  public saveJsonFile(defaultPath: string, text: string): void {
    this.send(IPC.saveJsonFile, defaultPath, text)
  }

  public setProgressBar(progress: number): void {
    //this.send(IPC.setProgressBar, progress);
  }

  public async getBackups(): Promise<Array<{ url: string; size: number }>> {
    return await this.invoke(IPC.getBackups).then((args: any[] | undefined) =>
      args != null ? (args[0] as Array<{ url: string; size: number }>) : []
    )
  }

  public async cachePath(
    baseDir: string,
    source?: string,
    typeDir?: string
  ): Promise<string | undefined> {
    return await this.invoke(IPC.cachePath, baseDir, source, typeDir).then(
      (args: any[] | undefined) =>
        args != null ? (args[0] as string) : undefined
    )
  }

  public async pathExists(path: string): Promise<boolean> {
    return await this.invoke(IPC.pathExists, path).then(
      (args: any[] | undefined) => (args != null ? (args[0] as boolean) : false)
    )
  }

  public async deletePath(path: string): Promise<string> {
    return await this.invoke(IPC.deletePath, path).then(
      (args: any[] | undefined) => (args != null ? (args[0] as string) : '')
    )
  }

  public async mkdir(path: string): Promise<void> {
    await this.invoke(IPC.mkdir, path)
  }

  public async writeFile(path: string, data: string): Promise<void> {
    await this.invoke(IPC.writeFile, path, data)
  }

  public async getDirectories(path: string): Promise<string[]> {
    return await this.invoke(IPC.getDirectories, path).then(
      (args: any[] | undefined) => (args != null ? (args[0] as string[]) : [])
    )
  }

  public async unlink(path: string): Promise<void> {
    await this.invoke(IPC.unlink, path)
  }

  public async readdir(path: string): Promise<string[]> {
    return await this.invoke(IPC.readdir, path).then(
      (args: any[] | undefined) => (args != null ? (args[0] as string[]) : [])
    )
  }

  public async move(fromPath: string, toPath: string): Promise<void> {
    await this.invoke(IPC.move, fromPath, toPath)
  }

  public async outputFile(
    path: string,
    data: string | ArrayBuffer
  ): Promise<void> {
    await this.invoke(IPC.outputFile, path, data)
  }

  public async igLogin(username: string, password: string): Promise<number> {
    return await this.invoke(IPC.igLogin, username, password).then(
      (args: any[] | undefined) => (args != null ? (args[0] as number) : 0)
    )
  }

  public async igTwoFactorLogin(
    twoFactorIdentifier: any,
    username: string,
    verificationCode: string
  ): Promise<void> {
    await this.invoke(
      IPC.igTwoFactorLogin,
      twoFactorIdentifier,
      username,
      verificationCode
    )
  }

  public async igSendSecurityCode(code: string | number): Promise<void> {
    await this.invoke(IPC.igSendSecurityCode, code)
  }

  public async igChallenge(): Promise<void> {
    await this.invoke(IPC.igChallenge)
  }

  public async igSerializeCookieJar(): Promise<string> {
    return await this.invoke(IPC.igSerializeCookieJar).then(
      (args: any[] | undefined) => (args != null ? (args[0] as string) : '')
    )
  }

  public async igFollowingFeed(
    userId: number
  ): Promise<InstagramItems<Record<string, unknown>>> {
    return await this.invoke(IPC.igFollowingFeed, userId).then(
      (args: any[] | undefined) =>
        args != null
          ? (args[0] as InstagramItems<Record<string, unknown>>)
          : { items: [], feed: 'following' }
    )
  }

  public async igGetMoreFollowingFeed(
    session: string,
    userId: number,
    feedSession: string
  ): Promise<InstagramItems<Record<string, unknown>> | undefined> {
    return await this.invoke(
      IPC.igGetMoreFollowingFeed,
      session,
      userId,
      feedSession
    ).then((args: any[] | undefined) =>
      args != null
        ? (args[0] as InstagramItems<Record<string, unknown>>)
        : undefined
    )
  }

  public async twitterFriendsList(
    consumerKey: string,
    consumerSecret: string,
    accessTokenKey: string,
    accessTokenSecret: string,
    cursor: number | undefined
  ): Promise<TwitterFollowers> {
    return await this.invoke(
      IPC.twitterFriendsList,
      consumerKey,
      consumerSecret,
      accessTokenKey,
      accessTokenSecret,
      cursor
    ).then((args: any[] | undefined) =>
      args != null
        ? (args[0] as TwitterFollowers)
        : { following: [], cursor: 0 }
    )
  }

  public async redditGetSubscriptions(
    redditUserAgent: string,
    redditClientID: string,
    redditRefreshToken: string,
    after: any
  ): Promise<any> {
    return await this.invoke(
      IPC.redditGetSubscriptions,
      redditUserAgent,
      redditClientID,
      redditRefreshToken,
      after
    )
  }

  public async tumblrTotalBlogs(
    consumerKey: string,
    consumerSecret: string,
    token: string,
    tokenSecret: string
  ): Promise<any> {
    return await this.invoke(
      IPC.tumblrTotalBlogs,
      consumerKey,
      consumerSecret,
      token,
      tokenSecret
    )
  }

  public async tumblrBlogs(
    consumerKey: string,
    consumerSecret: string,
    token: string,
    tokenSecret: string,
    offset: number
  ): Promise<any[]> {
    return await this.invoke(
      IPC.tumblrBlogs,
      consumerKey,
      consumerSecret,
      token,
      tokenSecret,
      offset
    ).then((args: any[] | undefined) => args ?? [])
  }

  public async getFolderSize(folder: string): Promise<number> {
    return await this.invoke(IPC.getFolderSize, folder).then(
      (args: any[] | undefined) => (args != null ? (args[0] as number) : 0)
    )
  }

  public async getSystemFonts(): Promise<string[]> {
    return await this.invoke(IPC.getSystemFonts).then(
      (args: any[] | undefined) => (args != null ? (args[0] as string[]) : [])
    )
  }

  public async parseMusicMetadataFile(
    url: string,
    cachePath: string
  ): Promise<any> {
    return await this.invoke(IPC.parseMusicMetadataFile, url, cachePath).then(
      (args: any[] | undefined) => (args != null ? args[0] : {})
    )
  }

  public async parseMusicMetadataBpm(url: string): Promise<number | undefined> {
    return await this.invoke(IPC.parseMusicMetadataBpm, url).then(
      (args: any[] | undefined) =>
        args != null ? (args[0] as number) : undefined
    )
  }

  public async parseMusicMetadataBuffer(
    arrayBuffer: ArrayBuffer,
    cachePath: string
  ): Promise<any> {
    const buffer = Buffer.from(arrayBuffer)
    return await this.invoke(
      IPC.parseMusicMetadataBuffer,
      buffer.toJSON(),
      cachePath
    ).then((args: any[] | undefined) => (args != null ? args[0] : {}))
  }

  public async rimrafSync(path: string): Promise<void> {
    await this.invoke(IPC.rimrafSync, path)
  }

  public async cleanBackups(config: ConfigStorage): Promise<void> {
    await this.invoke(IPC.cleanBackups, config)
  }

  public async tumblrOAuth(
    requestTokenUrl: string,
    accessTokenUrl: string,
    tumblrKey: string,
    tumblrSecret: string,
    authorizeUrl: string
  ): Promise<any> {
    return await this.invoke(
      IPC.tumblrOAuth,
      requestTokenUrl,
      accessTokenUrl,
      tumblrKey,
      tumblrSecret,
      authorizeUrl
    )
  }

  public async twitterOAuth(
    requestTokenUrl: string,
    accessTokenUrl: string,
    consumerKey: string,
    consumerSecret: string,
    authorizeUrl: string
  ): Promise<any> {
    return await this.invoke(
      IPC.twitterOAuth,
      requestTokenUrl,
      accessTokenUrl,
      consumerKey,
      consumerSecret,
      authorizeUrl
    )
  }

  public async redditOAuth(
    deviceID: string,
    userAgent: string,
    clientID: string
  ): Promise<any> {
    return await this.invoke(IPC.redditOAuth, deviceID, userAgent, clientID)
  }

  public async getFileUrl(source: string): Promise<string> {
    return await this.invoke(IPC.getFileUrl, source).then(
      (args: any[] | undefined) => (args != null ? (args[0] as string) : '')
    )
  }

  public async getContext(): Promise<SystemConstants> {
    return await this.invoke(IPC.getContext).then((args: any[] | undefined) =>
      args != null ? (args[0] as SystemConstants) : initialSystemConstants
    )
  }

  public async proxyNimjaURL(url: string): Promise<string> {
    return await this.invoke(IPC.proxyNimjaURL, url).then(
      (args: any[] | undefined) => (args != null ? (args[0] as string) : '')
    )
  }

  public scrapeFiles(
    allURLs: Record<string, string[]>,
    allPosts: Record<string, string>,
    config: Config,
    source: LibrarySourceStorage,
    filter: string,
    weight: string,
    helpers: ScraperHelpers,
    state: RootState
  ): Promise<ScrapeResult | undefined> {
    return this.invoke(
      IPC.scrapeFiles,
      allURLs,
      allPosts,
      toConfigStorage(config, state),
      source,
      filter,
      weight,
      helpers
    ).then((args: any[] | undefined) =>
      args != null ? (args[0] as ScrapeResult) : undefined
    )
  }

  private send(operation: string, ...args: any[]): void {
    this.sendMessage(this.createMessage(operation, args))
  }

  private invoke(
    operation: string,
    ...args: any[]
  ): Promise<any[] | undefined> {
    return new Promise((resolve, reject) => {
      const request = this.createMessage(operation, args)

      // TODO add timeout and call reject
      const controller = new AbortController()
      this.ws.addEventListener(
        'message',
        (ev: MessageEvent<any>) => {
          const response = JSON.parse(ev.data) as WebSocketMessage
          if (response.correlationID === request.messageID) {
            resolve(response.args)
            controller.abort()
          }
        },
        { signal: controller.signal }
      )

      this.sendMessage(request)
    })
  }

  private createMessage(operation: string, args: any[]): WebSocketMessage {
    const messageID = this.nextMessageID++
    return { messageID, operation, args }
  }

  private sendMessage(message: WebSocketMessage) {
    this.getConnection().then(() => this.ws.send(JSON.stringify(message)))
  }

  private getConnection(): Promise<void> {
    return this.ws.readyState === this.ws.OPEN
      ? Promise.resolve()
      : new Promise((resolve) => {
          const controller = new AbortController()
          this.ws.addEventListener(
            'open',
            () => {
              controller.abort()
              resolve(undefined)
            },
            { signal: controller.signal }
          )
        })
  }
}

class FlipFlipEvents {
  private readonly ws: WebSocket

  constructor(ws: WebSocket) {
    this.ws = ws
  }

  private addListener(
    operation: string,
    handler: (...args: any[]) => void,
    controller: AbortController
  ): void {
    this.ws.addEventListener(
      'message',
      (ev: MessageEvent<any>) => {
        const message = ev.data as WebSocketMessage
        if (message.operation === operation) {
          handler(message.args)
        }
      },
      { signal: controller.signal }
    )
  }

  public onStartScene(
    handler: (sceneName: string) => void,
    controller: AbortController
  ): void {
    this.addListener(IPC.startScene, (args) => handler(args[0]), controller)
  }

  public onGridNavigateBack(
    handler: () => void,
    controller: AbortController
  ): void {
    this.addListener(IPC.gridNavigateBack, (args) => handler(), controller)
  }

  public onPlayerPlayPause(
    handler: () => void,
    controller: AbortController
  ): void {
    this.addListener(IPC.playerPlayPause, (args) => handler(), controller)
  }

  public onPlayerHistoryBack(
    handler: () => void,
    controller: AbortController
  ): void {
    this.addListener(IPC.playerHistoryBack, (args) => handler(), controller)
  }

  public onPlayerHistoryForward(
    handler: () => void,
    controller: AbortController
  ): void {
    this.addListener(IPC.playerHistoryForward, (args) => handler(), controller)
  }

  public onPlayerNavigateBack(
    handler: () => void,
    controller: AbortController
  ): void {
    this.addListener(IPC.playerNavigateBack, (args) => handler(), controller)
  }

  public onPlayerDelete(
    handler: (path: string) => Promise<void>,
    controller: AbortController
  ): void {
    this.addListener(IPC.playerDelete, (args) => handler(args[0]), controller)
  }

  public onPlayerPrevSource(
    handler: () => void,
    controller: AbortController
  ): void {
    this.addListener(IPC.playerPrevSource, (args) => handler(), controller)
  }

  public onPlayerNextSource(
    handler: () => void,
    controller: AbortController
  ): void {
    this.addListener(IPC.playerNextSource, (args) => handler(), controller)
  }

  public onBlackListFile(
    handler: (literalSource: string, file: string) => void,
    controller: AbortController
  ): void {
    this.addListener(
      IPC.blackListFile,
      (args) => handler(args[0], args[1]),
      controller
    )
  }

  public onGotoTagSource(
    handler: (sourceURL: string) => void,
    controller: AbortController
  ): void {
    this.addListener(IPC.gotoTagSource, (args) => handler(args[0]), controller)
  }

  public onGotoClipSource(
    handler: (sourceURL: string) => void,
    controller: AbortController
  ): void {
    this.addListener(IPC.gotoClipSource, (args) => handler(args[0]), controller)
  }

  public onRecentPictureGrid(
    handler: () => void,
    controller: AbortController
  ): void {
    this.addListener(IPC.recentPictureGrid, (args) => handler(), controller)
  }

  public onWorkerResponse(uuid: string, handler: (message: any) => void): void {
    const controller = new AbortController()
    const listener = (args: any[]) => {
      const message = args[0]
      if (message.data?.helpers?.uuid === uuid) {
        handler(message)
        controller.abort()
      }
    }

    return this.addListener(IPC.workerResponse, listener, controller)
  }
}

class FlipFlipWorker {
  private readonly ws: WebSocket

  constructor(ws: WebSocket) {
    this.ws = ws
  }
}

class ClipboardService {
  public copyTextToClipboard(text: string): void {
    window.navigator.clipboard.writeText(text)
  }

  public copyImageToClipboard(imagePath: string): void {
    fetch(imagePath)
      .then((response) => response.blob())
      .then((blob) => {
        const item: Record<string, Blob> = {}
        item[blob.type] = blob
        window.navigator.clipboard.write([new ClipboardItem(item)])
      })
  }
}

export default function flipflip() {
  return FlipFlipService.getInstance()
}
