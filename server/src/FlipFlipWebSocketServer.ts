import ws from 'ws'
import { LC, WebSocketMessage } from 'flipflip-common'
import AppStorage from './data/AppStorage'
import webSocketMessage from './websocket/WebSocketMessageService'
import { IncomingMessage } from 'http'
import internal from 'stream'
import login from './LoginCode'

class FlipFlipWebSocketServer {
  private static instance: FlipFlipWebSocketServer

  private wsServer: ws.Server
  private writePermissions: boolean[]

  private constructor() {
    this.writePermissions = [true]
  }

  public static getInstance(): FlipFlipWebSocketServer {
    if (FlipFlipWebSocketServer.instance == null) {
      FlipFlipWebSocketServer.instance = new FlipFlipWebSocketServer()
    }

    return FlipFlipWebSocketServer.instance
  }

  public init(options: ws.ServerOptions): void {
    this.wsServer = new ws.Server(options)
    this.wsServer.on(
      'connection',
      (socket: ws.WebSocket, req: IncomingMessage) => {
        if (req.url === '/flipflip') {
          this.appConnection(socket, req)
        } else if (req.url === '/login') {
          this.loginConnection(socket, req)
        }
      }
    )
  }

  private appConnection(socket: ws.WebSocket, req: IncomingMessage) {
    const host = req.headers.host
    const canWrite = this.writePermissions.shift() ?? false
    if (canWrite) {
      socket.storage = new AppStorage(1)
    }
    socket.on('close', () => {
      if (socket.storage != null) {
        this.writePermissions.push(true)
      }
    })
    socket.on('message', (message: ws.RawData) => {
      let buffer: Buffer
      if (message instanceof Buffer) {
        buffer = message
      } else if (message instanceof ArrayBuffer) {
        buffer = Buffer.from(message)
      } else {
        buffer = Buffer.concat(message)
      }

      const text = buffer.toString('utf-8')
      const websocketMessage = JSON.parse(text) as WebSocketMessage
      webSocketMessage().handle(websocketMessage, socket, host)
    })
  }

  private loginConnection(socket: ws.WebSocket, req: IncomingMessage) {
    const host = req.headers.host
    socket.on('message', (message: ws.RawData) => {
      let buffer: Buffer
      if (message instanceof Buffer) {
        buffer = message
      } else if (message instanceof ArrayBuffer) {
        buffer = Buffer.from(message)
      } else {
        buffer = Buffer.concat(message)
      }

      const text = buffer.toString('utf-8')
      const { operation, messageID } = JSON.parse(text) as WebSocketMessage
      if (operation === LC.code) {
        login().add(socket, host, messageID)
      }
    })
  }

  public handleUpgrade(
    request: IncomingMessage,
    socket: internal.Duplex,
    head: Buffer
  ): void {
    this.wsServer.handleUpgrade(request, socket, head, (ws) => {
      this.wsServer.emit('connection', ws, request)
    })
  }
}

export default function webSocketServer() {
  return FlipFlipWebSocketServer.getInstance()
}
