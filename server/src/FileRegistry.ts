import { randomUUID } from 'crypto'
import { urlToPath } from 'flipflip-common'
import { isWin32 } from './utils'

class FileRegistry {
  private static instance: FileRegistry

  private readonly registry: Map<string, string>

  private constructor() {
    this.registry = new Map<string, string>()
  }

  public static getInstance(): FileRegistry {
    if (FileRegistry.instance == null) {
      FileRegistry.instance = new FileRegistry()
    }

    return FileRegistry.instance
  }

  public get(uuid: string): string | undefined {
    return this.registry.get(uuid)
  }

  public set(url: string): string {
    const extension = url.substring(url.lastIndexOf('.'))
    const alias = randomUUID() + extension
    const path = urlToPath(url, isWin32)
    this.registry.set(alias, path)
    return alias
  }
}

export default function fileRegistry() {
  return FileRegistry.getInstance()
}
