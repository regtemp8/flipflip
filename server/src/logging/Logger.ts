import logger from './winston'

export default class Logger {
  private readonly className: string

  constructor(className: string) {
    this.className = className
  }

  public info(message: string, meta?: object) {
    logger.info(message, { ...meta, className: this.className })
  }

  public warn(message: string, meta?: object) {
    logger.warn(message, { ...meta, className: this.className })
  }

  public error(message: string, meta?: object) {
    logger.error(message, { ...meta, className: this.className })
  }

  public static create(className: string) {
    return new Logger(className)
  }

  public static close() {
    return new Promise<void>((resolve) => {
      for (const transport of logger.transports) {
        if (typeof transport.close === 'function') {
          transport.close()
        }
      }

      // wait for file to close
      setTimeout(() => {
        resolve()
      }, 200)
    })
  }
}
