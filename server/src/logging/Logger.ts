import logger from './winston'

export default class Logger {
  private readonly className: string

  constructor(className: string) {
    this.className = className
  }

  public info(message: string, meta?: any) {
    logger.info(message, { ...meta, className: this.className })
  }

  public warn(message: string, meta?: any) {
    logger.warn(message, { ...meta, className: this.className })
  }

  public error(message: string, meta?: any) {
    logger.error(message, { ...meta, className: this.className })
  }

  public static create(className: string) {
    return new Logger(className)
  }
}
