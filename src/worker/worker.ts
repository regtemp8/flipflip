import {
  filterPathsToJustPlayable,
  getFileName,
  getSourceType,
  isVideo,
  loadBDSMlr,
  loadDanbooru,
  loadDeviantArt,
  loadE621,
  loadEHentai,
  loadGelbooru1,
  loadGelbooru2,
  loadHydrus,
  loadImageFap,
  loadImgur,
  loadInstagram,
  loadLuscious,
  loadPiwigo,
  loadReddit,
  loadRedGifs,
  loadRemoteImageURLList,
  loadSexCom,
  loadTumblr,
  loadTwitter,
  processAllURLs,
  reset,
  isImageOrVideo,
  isImage,
  isVideoPlaylist,
  isAudio,
  getFileGroup
} from '../renderer/components/player/Scrapers'

const events = new Map<string, Function>([
  ['processAllURLs', processAllURLs],
  ['reset', reset],
  ['loadRemoteImageURLList', loadRemoteImageURLList],
  ['loadTumblr', loadTumblr],
  ['loadReddit', loadReddit],
  ['loadRedGifs', loadRedGifs],
  ['loadImageFap', loadImageFap],
  ['loadSexCom', loadSexCom],
  ['loadImgur', loadImgur],
  ['loadTwitter', loadTwitter],
  ['loadDeviantArt', loadDeviantArt],
  ['loadInstagram', loadInstagram],
  ['loadE621', loadE621],
  ['loadDanbooru', loadDanbooru],
  ['loadGelbooru1', loadGelbooru1],
  ['loadGelbooru2', loadGelbooru2],
  ['loadEHentai', loadEHentai],
  ['loadLuscious', loadLuscious],
  ['loadBDSMlr', loadBDSMlr],
  ['loadPiwigo', loadPiwigo],
  ['loadHydrus', loadHydrus],
  ['filterPathsToJustPlayable', filterPathsToJustPlayable],
  ['isImageOrVideo', isImageOrVideo],
  ['isImage', isImage],
  ['isVideo', isVideo],
  ['isVideoPlaylist', isVideoPlaylist],
  ['isAudio', isAudio],
  ['getFileName', getFileName],
  ['getSourceType', getSourceType],
  ['getFileGroup', getFileGroup]
])

function isAddResolve (event: string) {
  const list = [
    'loadRemoteImageURLList',
    'loadTumblr',
    'loadReddit',
    'loadRedGifs',
    'loadImageFap',
    'loadSexCom',
    'loadImgur',
    'loadTwitter',
    'loadDeviantArt',
    'loadInstagram',
    'loadE621',
    'loadDanbooru',
    'loadGelbooru1',
    'loadGelbooru2',
    'loadEHentai',
    'loadLuscious',
    'loadBDSMlr',
    'loadPiwigo',
    'loadHydrus'
  ]

  return list.includes(event)
}

window.flipflip.worker.onMessage(
  (event: string, args: any[], webContentsId: number) => {
    console.log('MESSAGE: ' + event)
    if (!event) return
    const fn: Function = events.get(event)
    if (!fn) return
    const addResolve = isAddResolve(event)
    if (addResolve) {
      args.push((message: any) => {
        window.flipflip.worker.postMessage(webContentsId, message)
      })
    }
    if (args) {
      fn(...args)
    } else {
      fn()
    }
  }
)
