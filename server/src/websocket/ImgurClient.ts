import ImgurClient from 'imgur'

export default class Imgur {
  async onRequestAlbumImages(albumName: string): Promise<string[]> {
    const response = await new ImgurClient({}).getAlbum(albumName)
    return response.data.images.map((i: any) => i.link)
  }
}
