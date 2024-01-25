import ImgurClient from 'imgur'

// eslint-disable-next-line import/no-unresolved
import { type ImageData } from 'imgur/lib/common/types'

export default class Imgur {
  async onRequestAlbumImages(albumName: string): Promise<string[]> {
    const response = await new ImgurClient({}).getAlbum(albumName)
    return response.data.images.map((i: ImageData) => i.link)
  }
}
