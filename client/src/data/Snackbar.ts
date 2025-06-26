import { Message } from 'flipflip-common'
import { enqueueSnackbar } from 'notistack'

export const MAX_SNACKS = 3
export const AUTO_HIDE_DURATION = 4500

class SnackbarService {
  private static instance: SnackbarService

  private readonly queue: Message[]
  private readonly timeout: number
  private processing: boolean

  private constructor() {
    this.queue = []
    this.timeout = AUTO_HIDE_DURATION / MAX_SNACKS
    this.processing = false
  }

  public static getInstance(): SnackbarService {
    if (SnackbarService.instance == null) {
      SnackbarService.instance = new SnackbarService()
    }

    return SnackbarService.instance
  }

  public showMessages(messages: Message[]) {
    this.queue.push(...messages)
    if (!this.processing) {
      this.processing = true
      this.processMessages()
    }
  }

  public showMessage(message: Message) {
    this.queue.push(message)
    if (!this.processing) {
      this.processing = true
      this.processMessages()
    }
  }

  private processMessages() {
    const message = this.queue.pop()
    if (message != null) {
      if (message.error) {
        enqueueSnackbar(message.error, { variant: 'error' })
      } else if (message.warning) {
        enqueueSnackbar(message.warning, { variant: 'warning' })
      } else if (message.success) {
        enqueueSnackbar(message.success, { variant: 'success' })
      } else if (message.info) {
        enqueueSnackbar(message.info, { variant: 'info' })
      }

      setTimeout(() => this.processMessages(), this.timeout)
    } else {
      this.processing = false
    }
  }
}

export default function snackbar() {
  return SnackbarService.getInstance()
}
