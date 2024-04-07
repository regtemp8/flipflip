import { WebSocket } from 'ws'
import security from './SecurityService'
import windowManager from './WindowManager'
import { LC, WebSocketMessage } from 'flipflip-common'

interface LoginAttempt {
  socket: WebSocket
  host: string
  messageID: number
}

class LoginCode {
  private static instance: LoginCode
  private attempts: LoginAttempt[]

  private constructor() {
    this.attempts = []
  }

  public static getInstance(): LoginCode {
    if (LoginCode.instance == null) {
      LoginCode.instance = new LoginCode()
    }

    return LoginCode.instance
  }

  public add(socket: WebSocket, host: string, messageID: number) {
    const length = this.attempts.length
    const isEmpty = length === 0
    socket.on('close', () => this.socketClose(length))
    this.attempts.push({ socket, host, messageID })
    if (isEmpty) {
      this.sendCode()
    }
  }

  public done(verified: boolean) {
    const { socket, host } = this.attempts.shift()
    const isEmpty = this.attempts.length === 0
    const url = `https://${host}`
    const promise = verified
      ? security().generateMagicLink(url)
      : security().magicLink(url, '-')

    promise.then((link) => {
      const message: WebSocketMessage = {
        operation: LC.redirect,
        args: [link]
      }

      socket.removeAllListeners('close')
      socket.send(JSON.stringify(message))
      if (!isEmpty) {
        setTimeout(() => this.sendCode(), 1000)
      }
    })
  }

  private sendCode() {
    const { socket, messageID } = this.attempts[0]
    const code = security().generateCode()
    const message: WebSocketMessage = {
      correlationID: messageID,
      operation: LC.code,
      args: [code]
    }
    socket.send(JSON.stringify(message))
    windowManager().showLoginCodeDialog()
  }

  private socketClose(index: number) {
    this.attempts.splice(index, 1)
    if (index === 0) {
      security().deactivateCode()
      windowManager().closeLoginCodeDialog()
    }
    if (this.attempts.length > 0) {
      setTimeout(() => this.sendCode(), 1000)
    }
  }
}

export default function login() {
  return LoginCode.getInstance()
}
