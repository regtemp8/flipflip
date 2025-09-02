declare global {
  declare namespace NodeJS {
    export interface Process {
      pkg?: unknown
    }
  }
}

export {}
