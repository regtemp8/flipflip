import ImgurClient from 'imgur'

// eslint-disable-next-line import/no-unresolved
import { type ImageData } from 'imgur/lib/common/types'

export class Imgur {
  private static instance: Imgur

  private client: ImgurClient

  private constructor() {
    this.client = new ImgurClient({})
  }

  async getAlbumImages(albumName: string): Promise<string[]> {
    const response = await this.client.getAlbum(albumName)
    return response.data.images.map((i: ImageData) => i.link)
  }

  public static getInstance(): Imgur {
    if (!Imgur.instance) {
      Imgur.instance = new Imgur()
    }

    return Imgur.instance
  }
}

export default function imgur() {
  return Imgur.getInstance()
}
