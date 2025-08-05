declare global {
  declare namespace NodeJS {
    export interface Process {
      pkg?: any
    }
  }
}

export {}
