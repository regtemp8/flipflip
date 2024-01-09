import wretch from 'wretch'
import FormUrlAddon from 'wretch/addons/formUrl'
import AbortAddon from 'wretch/addons/abort'

import FlipFlipService from '../../FlipFlipService'
import {
  LibrarySource,
  filterPathsToJustPlayable,
  getFileGroup,
  isImage,
  isImageOrVideo,
  isVideo,
  IF,
  WF
} from 'flipflip-common'
import type Config from '../../store/app/data/Config'

const pm = (object: any, resolve?: Function) => {
  if (
    object?.source &&
    object?.data &&
    object?.allURLs &&
    object?.weight &&
    object?.helpers
  ) {
    const source = object.source
    if (source.blacklist && source.blacklist.length > 0) {
      object.data = object.data.filter(
        (url: string) => !source.blacklist.includes(url)
      )
    }
    object.allURLs = processAllURLs(
      object.data,
      object.allURLs,
      object.source,
      object.weight,
      object.helpers,
      object.pathSep
    )
  }
  if (resolve) {
    resolve({ data: object })
  } else {
    postMessage(object)
  }
}

export const processAllURLs = (
  data: string[],
  allURLs: Map<string, string[]>,
  source: LibrarySource,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string
): Map<string, string[]> => {
  const newAllURLs = new Map(allURLs)
  if (helpers.next != null && helpers.next <= 0) {
    if (weight === WF.sources) {
      newAllURLs.set(source.url, data)
    } else {
      for (const d of data) {
        newAllURLs.set(d, [source.url])
      }
    }
  } else {
    if (weight === WF.sources) {
      const sourceURLs = newAllURLs.get(source.url) ?? []
      newAllURLs.set(
        source.url,
        sourceURLs.concat(
          data.filter((u: string) => {
            const fileName = getFileName(u, pathSep)
            const found = sourceURLs
              .map((u: string) => getFileName(u, pathSep))
              .includes(fileName)
            return !found
          })
        )
      )
    } else {
      for (const d of data.filter((u: string) => {
        const fileName = getFileName(u, pathSep)
        const found = Array.from(newAllURLs.keys())
          .map((u: string) => getFileName(u, pathSep))
          .includes(fileName)
        return !found
      })) {
        newAllURLs.set(d, [source.url])
      }
    }
  }
  return newAllURLs
}

let redditAlerted = false
let tumblrAlerted = false
let tumblr429Alerted = false
let twitterAlerted = false
let instagramAlerted = false
let hydrusAlerted = false
let piwigoAlerted = false

export const reset = () => {
  redditAlerted = false
  tumblrAlerted = false
  tumblr429Alerted = false
  twitterAlerted = false
  instagramAlerted = false
  hydrusAlerted = false
  piwigoAlerted = false
}

export const loadRemoteImageURLList = (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve?: Function
) => {
  const url = source.url
  wretch(url)
    .get()
    .text((data: string) => {
      const matches = data.match(/[^\r\n]+/g) as RegExpMatchArray
      const lines = matches.filter(
        (line) =>
          line.startsWith('http://') ||
          line.startsWith('https://') ||
          line.startsWith('file:///')
      )
      if (lines.length > 0) {
        let convertedSource = Array<string>()
        let convertedCount = 0
        for (const url of lines) {
          convertURL(url, pathSep)
            .then((urls: string[]) => {
              convertedSource = convertedSource.concat(urls)
              convertedCount++
              if (convertedCount === lines.length) {
                helpers.count = filterPathsToJustPlayable(
                  IF.any,
                  convertedSource,
                  true
                ).length
                pm(
                  {
                    data: filterPathsToJustPlayable(
                      filter,
                      convertedSource,
                      true
                    ),
                    allURLs,
                    allPosts,
                    weight,
                    helpers,
                    source,
                    timeout: 0,
                    pathSep
                  },
                  resolve
                )
              }
            })
            .catch((error: any) => {
              convertedCount++
              if (convertedCount === lines.length) {
                helpers.count = filterPathsToJustPlayable(
                  IF.any,
                  convertedSource,
                  true
                ).length
                pm(
                  {
                    error: error.message,
                    data: filterPathsToJustPlayable(
                      filter,
                      convertedSource,
                      true
                    ),
                    allURLs,
                    allPosts,
                    weight,
                    helpers,
                    source,
                    timeout: 0,
                    pathSep
                  },
                  resolve
                )
              }
            })
        }
      } else {
        pm(
          {
            warning: 'No lines in' + url + ' are links or files',
            helpers,
            source,
            timeout: 0,
            pathSep
          },
          resolve
        )
      }
    })
    .catch((e) => {
      pm(
        {
          error: e.message,
          helpers,
          source,
          timeout: 0,
          pathSep
        },
        resolve
      )
    })
}

export const loadTumblr = async (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve?: Function
) => {
  const flipflip = FlipFlipService.getInstance()
  const timeout = 3000
  const configured =
    config.remoteSettings.tumblrOAuthToken !== '' &&
    config.remoteSettings.tumblrOAuthTokenSecret !== ''
  if (configured) {
    const url = source.url
    // TumblrID takes the form of <blog_name>.tumblr.com
    let tumblrID = url.replace(/https?:\/\//, '')
    tumblrID = tumblrID.replace('/', '')
    if (tumblr429Alerted) {
      pm(
        {
          helpers,
          source,
          timeout,
          pathSep
        },
        resolve
      )
      return
    }

    try {
      const images = await flipflip.api.tumblrBlogPosts(
        config.remoteSettings.tumblrKey,
        config.remoteSettings.tumblrSecret,
        config.remoteSettings.tumblrOAuthToken,
        config.remoteSettings.tumblrOAuthTokenSecret,
        tumblrID,
        helpers.next * 20
      )

      // End loop if we're at end of posts
      if (!images) {
        helpers.next = null
        pm(
          {
            data: [],
            allURLs,
            allPosts,
            weight,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
        return
      }

      if (images.length > 0) {
        let convertedSource = Array<string>()
        let convertedCount = 0
        for (const url of images) {
          convertURL(url, pathSep)
            .then((urls: string[]) => {
              convertedSource = convertedSource.concat(urls)
              convertedCount++
              if (convertedCount === images.length) {
                helpers.next = helpers.next + 1
                helpers.count =
                  helpers.count +
                  filterPathsToJustPlayable(IF.any, convertedSource, false)
                    .length
                pm(
                  {
                    data: filterPathsToJustPlayable(
                      filter,
                      convertedSource,
                      false
                    ),
                    allURLs,
                    allPosts,
                    weight,
                    helpers,
                    source,
                    timeout,
                    pathSep
                  },
                  resolve
                )
              }
            })
            .catch((error: any) => {
              convertedCount++
              if (convertedCount === images.length) {
                helpers.next = helpers.next + 1
                helpers.count =
                  helpers.count +
                  filterPathsToJustPlayable(IF.any, convertedSource, false)
                    .length
                pm(
                  {
                    error: error.message,
                    data: filterPathsToJustPlayable(
                      filter,
                      convertedSource,
                      false
                    ),
                    allURLs,
                    allPosts,
                    weight,
                    helpers,
                    source,
                    timeout,
                    pathSep
                  },
                  resolve
                )
              }
            })
        }
      } else {
        helpers.next = null
        pm(
          {
            data: [],
            allURLs,
            allPosts,
            weight,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      }
    } catch (err: any) {
      let systemMessage
      if (
        err.message.includes('429 Limit Exceeded') &&
        !tumblr429Alerted &&
        helpers.next === 0
      ) {
        if (!config.remoteSettings.silenceTumblrAlert) {
          systemMessage =
            'Tumblr has temporarily throttled your FlipFlip due to high traffic. Try again in a few minutes or visit Settings to try a different Tumblr API key.'
        }
        tumblr429Alerted = true
      }
      pm(
        {
          error: err.message,
          systemMessage,
          helpers,
          source,
          timeout,
          pathSep
        },
        resolve
      )
    }
  } else {
    let systemMessage
    if (!tumblrAlerted) {
      systemMessage =
        "You haven't authorized FlipFlip to work with Tumblr yet.\nVisit Settings to authorize Tumblr."
      tumblrAlerted = true
    }
    pm(
      {
        systemMessage,
        helpers,
        source,
        timeout,
        pathSep
      },
      resolve
    )
  }
}

export const loadReddit = async (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve?: Function
) => {
  const flipflip = FlipFlipService.getInstance()
  const timeout = 3000
  const configured = config.remoteSettings.redditRefreshToken !== ''
  if (configured) {
    const url = source.url
    if (url.includes('/r/')) {
      const handleSubmissions = (submissionListing: any) => {
        if (submissionListing.length > 0) {
          let convertedListing = Array<string>()
          let convertedCount = 0
          for (const s of submissionListing) {
            convertURL(s.url, pathSep)
              .then((urls: string[]) => {
                convertedListing = convertedListing.concat(urls)
                convertedCount++
                for (const u of urls) {
                  allPosts.set(u, 'https://www.reddit.com' + s.permalink)
                }
                if (convertedCount === submissionListing.length) {
                  helpers.next =
                    submissionListing[submissionListing.length - 1].name
                  helpers.count =
                    helpers.count +
                    filterPathsToJustPlayable(IF.any, convertedListing, false)
                      .length
                  pm(
                    {
                      data: filterPathsToJustPlayable(
                        filter,
                        convertedListing,
                        false
                      ),
                      allURLs,
                      allPosts,
                      weight,
                      helpers,
                      source,
                      timeout,
                      pathSep
                    },
                    resolve
                  )
                }
              })
              .catch((error: any) => {
                convertedCount++
                if (convertedCount === submissionListing.length) {
                  helpers.next =
                    submissionListing[submissionListing.length - 1].name
                  helpers.count =
                    helpers.count +
                    filterPathsToJustPlayable(IF.any, convertedListing, false)
                      .length
                  pm(
                    {
                      error: error.message,
                      data: filterPathsToJustPlayable(
                        filter,
                        convertedListing,
                        false
                      ),
                      allURLs,
                      allPosts,
                      weight,
                      helpers,
                      source,
                      timeout,
                      pathSep
                    },
                    resolve
                  )
                }
              })
          }
        } else {
          helpers.next = null
          pm(
            {
              data: [],
              allURLs,
              allPosts,
              weight,
              helpers,
              source,
              timeout,
              pathSep
            },
            resolve
          )
        }
      }
      const errorSubmission = (error: any) => {
        pm(
          {
            error: error.message,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      }

      try {
        const submissionListing = await flipflip.api.redditGetSubreddit(
          config.remoteSettings.redditUserAgent,
          config.remoteSettings.redditClientID,
          config.remoteSettings.redditRefreshToken,
          source.redditFunc as string,
          getFileGroup(url, pathSep) as string,
          helpers.next,
          source.redditTime
        )

        handleSubmissions(submissionListing)
      } catch (error) {
        errorSubmission(error)
      }
    } else if (url.includes('/saved')) {
      try {
        const submissionListing = await flipflip.api.redditGetSavedContent(
          config.remoteSettings.redditUserAgent,
          config.remoteSettings.redditClientID,
          config.remoteSettings.redditRefreshToken,
          getFileGroup(url, pathSep) as string,
          helpers.next
        )

        if (submissionListing.length > 0) {
          let convertedListing = Array<string>()
          let convertedCount = 0
          for (const s of submissionListing) {
            convertURL(s.url, pathSep)
              .then((urls: string[]) => {
                convertedListing = convertedListing.concat(urls)
                convertedCount++
                for (const u of urls) {
                  allPosts.set(u, 'https://www.reddit.com' + s.permalink)
                }
                if (convertedCount === submissionListing.length) {
                  helpers.next =
                    submissionListing[submissionListing.length - 1].name
                  helpers.count =
                    helpers.count +
                    filterPathsToJustPlayable(IF.any, convertedListing, false)
                      .length
                  pm(
                    {
                      data: filterPathsToJustPlayable(
                        filter,
                        convertedListing,
                        false
                      ),
                      allURLs,
                      allPosts,
                      weight,
                      helpers,
                      source,
                      timeout,
                      pathSep
                    },
                    resolve
                  )
                }
              })
              .catch((error: any) => {
                convertedCount++
                if (convertedCount === submissionListing.length) {
                  helpers.next =
                    submissionListing[submissionListing.length - 1].name
                  helpers.count =
                    helpers.count +
                    filterPathsToJustPlayable(IF.any, convertedListing, false)
                      .length
                  pm(
                    {
                      error: error.message,
                      data: filterPathsToJustPlayable(
                        filter,
                        convertedListing,
                        false
                      ),
                      allURLs,
                      allPosts,
                      weight,
                      helpers,
                      source,
                      timeout,
                      pathSep
                    },
                    resolve
                  )
                }
              })
          }
        } else {
          helpers.next = null
          pm(
            {
              data: [],
              allURLs,
              allPosts,
              weight,
              helpers,
              source,
              timeout,
              pathSep
            },
            resolve
          )
        }
      } catch (err: any) {
        pm(
          {
            error: err.message,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      }
    } else if (url.includes('/user/') || url.includes('/u/')) {
      try {
        const submissionListing = await flipflip.api.redditGetUser(
          config.remoteSettings.redditUserAgent,
          config.remoteSettings.redditClientID,
          config.remoteSettings.redditRefreshToken,
          getFileGroup(url, pathSep) as string,
          helpers.next
        )

        if (submissionListing.length > 0) {
          let convertedListing = Array<string>()
          let convertedCount = 0
          for (const s of submissionListing) {
            convertURL(s.url, pathSep)
              .then((urls: string[]) => {
                convertedListing = convertedListing.concat(urls)
                convertedCount++
                for (const u of urls) {
                  allPosts.set(u, 'https://www.reddit.com' + s.permalink)
                }
                if (convertedCount === submissionListing.length) {
                  helpers.next =
                    submissionListing[submissionListing.length - 1].name
                  helpers.count =
                    helpers.count +
                    filterPathsToJustPlayable(IF.any, convertedListing, false)
                      .length
                  pm(
                    {
                      data: filterPathsToJustPlayable(
                        filter,
                        convertedListing,
                        false
                      ),
                      allURLs,
                      allPosts,
                      weight,
                      helpers,
                      source,
                      timeout,
                      pathSep
                    },
                    resolve
                  )
                }
              })
              .catch((error: any) => {
                convertedCount++
                if (convertedCount === submissionListing.length) {
                  helpers.next =
                    submissionListing[submissionListing.length - 1].name
                  helpers.count =
                    helpers.count +
                    filterPathsToJustPlayable(IF.any, convertedListing, false)
                      .length
                  pm(
                    {
                      error: error.message,
                      data: filterPathsToJustPlayable(
                        filter,
                        convertedListing,
                        false
                      ),
                      allURLs,
                      allPosts,
                      weight,
                      helpers,
                      source,
                      timeout,
                      pathSep
                    },
                    resolve
                  )
                }
              })
          }
        } else {
          helpers.next = null
          pm(
            {
              data: [],
              allURLs,
              allPosts,
              weight,
              helpers,
              source,
              timeout,
              pathSep
            },
            resolve
          )
        }
      } catch (err: any) {
        pm(
          {
            error: err.message,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      }
    }
  } else {
    let systemMessage
    if (!redditAlerted) {
      systemMessage =
        "You haven't authorized FlipFlip to work with Reddit yet.\nVisit Settings to authorize Reddit."
      redditAlerted = true
    }
    pm(
      {
        systemMessage,
        helpers,
        source,
        timeout,
        pathSep
      },
      resolve
    )
  }
}

export const loadRedGifs = (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve?: Function
) => {
  const timeout = 10000
  const url = source.url
  let apiURL = 'https://api.redgifs.com/v2/'
  const orderRegex =
    /^https?:\/\/(?:www\.)?redgifs\.com\/browse\?.*order=([^&]*)/.exec(url)
  let order = null
  if (orderRegex) {
    order = orderRegex[1]
  }
  const typeRegex =
    /^https?:\/\/(?:www\.)?redgifs\.com\/browse\?.*type=(\w)/.exec(url)
  let type = null
  if (typeRegex) {
    type = typeRegex[1]
  }
  const tagsRegex =
    /^https?:\/\/(?:www\.)?redgifs\.com\/browse\?.*tags=([^&]*)/.exec(url)
  let tags = null
  if (tagsRegex) {
    tags = tagsRegex[1]
  }
  const ratioRegex =
    /^https?:\/\/(?:www\.)?redgifs\.com\/browse\?.*ratio=(\w)/.exec(url)
  let ratio = null
  if (ratioRegex) {
    ratio = ratioRegex[1]
  }
  const verifiedRegex =
    /^https?:\/\/(?:www\.)?redgifs\.com\/browse\?.*verified=(\w)/.exec(url)
  let verified = null
  if (verifiedRegex) {
    verified = verifiedRegex[1]
  }
  const longRegex =
    /^https?:\/\/(?:www\.)?redgifs\.com\/browse\?.*long=(\w)/.exec(url)
  let long = null
  if (longRegex) {
    long = longRegex[1]
  }
  const soundRegex =
    /^https?:\/\/(?:www\.)?redgifs\.com\/browse\?.*sound=(\w)/.exec(url)
  let sound = null
  if (soundRegex) {
    sound = soundRegex[1]
  }

  if (url.includes('/users/')) {
    apiURL += 'users/' + getFileGroup(url, pathSep) + '/search?'
    if (!order) {
      order = 'recent'
    }
  } else if (url.includes('/browse?')) {
    apiURL += 'gifs/search?search_text=' + tags + '&count=80&'
    if (!order) {
      order = 'trending'
    }
  }
  const page = helpers.next + 1
  if (type) {
    apiURL += 'type=' + type + '&'
  }
  if (ratio) {
    apiURL += 'ratio=' + ratio + '&'
  }
  if (verified) {
    apiURL += 'verified=' + verified + '&'
  }
  if (long) {
    apiURL += 'long=' + long + '&'
  }
  if (sound) {
    apiURL += 'sound=' + sound + '&'
  }
  apiURL += 'order=' + order + '&page=' + page + ''

  wretch(apiURL)
    .addon(AbortAddon())
    .get()
    .setTimeout(15000)
    .onAbort((e) => {
      pm(
        {
          error: e.message,
          helpers,
          source,
          timeout,
          pathSep
        },
        resolve
      )
    })
    .json((json) => {
      const images = json.gifs
        .map((g: any) => {
          if (g.urls.hd) {
            return g.urls.hd
          } else if (g.urls.sd) {
            return g.urls.sd
          }
          return null
        })
        .filter((url: string) => !!url)
      helpers.next = json.page === json.pages ? null : helpers.next + 1
      helpers.count =
        helpers.count + filterPathsToJustPlayable(IF.any, images, false).length
      pm(
        {
          data: filterPathsToJustPlayable(filter, images, false),
          allURLs,
          allPosts,
          weight,
          helpers,
          source,
          timeout,
          pathSep
        },
        resolve
      )
    })
    .catch((err: any) => {
      pm(
        {
          error: err.message,
          helpers,
          source,
          timeout,
          pathSep
        },
        resolve
      )
    })
}

const loadImageFapGallery = (
  galleryURL: string,
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  timeout: number,
  pathSep: string,
  images: Array<string>,
  baseGalleryURL: string,
  onFinishedLoading: (helpers: {
    next: any
    count: number
    retries: number
    uuid: string
  }) => void,
  resolve?: Function
) => {
  wretch(galleryURL)
    .addon(AbortAddon())
    .get()
    .setTimeout(15000)
    .onAbort((e) =>
      pm(
        {
          error: e.message,
          helpers: helpers,
          source: source,
          timeout: timeout,
          pathSep
        },
        resolve
      )
    )
    .text((html) => {
      const galleryDoc = new DOMParser().parseFromString(html, 'text/html')
      const imageEl = galleryDoc.querySelector(
        '.expp-container > form > table > tbody > tr > td > table > tbody > tr > td > a'
      )

      if (imageEl) {
        const imageURL =
          'https://www.imagefap.com' + imageEl.getAttribute('href')
        wretch(imageURL)
          .get()
          .text((html) => {
            let captcha = undefined

            const ahrefs = new DOMParser()
              .parseFromString(html, 'text/html')
              .querySelectorAll(
                'a[href^="https://cdn.imagefap.com/images/full/"]'
              )

            if (ahrefs.length > 0) {
              for (let i = 0; i < ahrefs.length; i++) {
                images.push(ahrefs.item(i).getAttribute('href') as string)
              }
            } else {
              captcha = imageURL
            }

            if (captcha != null) {
              pm(
                {
                  captcha: captcha,
                  data: images,
                  allURLs: allURLs,
                  allPosts: allPosts,
                  weight: weight,
                  helpers: helpers,
                  source: source,
                  timeout: timeout,
                  pathSep
                },
                resolve
              )
            }
          })
      } else {
        let captcha = undefined
        if (html.includes('Enter the captcha')) {
          helpers.count = source.count
          captcha = galleryURL
          images = allURLs.get(source.url) ?? []
          pm(
            { warning: source.url + ' - blocked due to captcha', pathSep },
            resolve
          )
        } else {
          onFinishedLoading(helpers)
        }
        pm(
          {
            captcha,
            data: images,
            allURLs,
            allPosts,
            weight,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      }

      const nextGalleryLink = galleryDoc.querySelector(
        '#gallery > font > span > a:last-child'
      )
      if (nextGalleryLink && nextGalleryLink.innerHTML == ':: next ::') {
        let href = nextGalleryLink.getAttribute('href') as string
        if (href.startsWith('/')) {
          href = href.substring(1)
        }
        setTimeout(
          () =>
            loadImageFapGallery(
              baseGalleryURL + href,
              allURLs,
              allPosts,
              source,
              filter,
              weight,
              helpers,
              timeout,
              pathSep,
              images,
              baseGalleryURL,
              onFinishedLoading,
              resolve
            ),
          2000
        )
      } else {
        onFinishedLoading(helpers)
        pm(
          {
            data: filterPathsToJustPlayable(filter, images, false),
            allURLs: allURLs,
            allPosts: allPosts,
            weight: weight,
            helpers: helpers,
            source: source,
            timeout: timeout,
            pathSep
          },
          resolve
        )
      }
    })
}

export const loadImageFap = (
  allURLs: Map<string, Array<string>>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve?: Function
) => {
  const timeout = 8000
  const url = source.url
  if (url.includes('/gallery/') || url.includes('/pictures/')) {
    let images = Array<string>()
    const gid = getFileGroup(url, pathSep)
    const baseGalleryURL = 'https://www.imagefap.com/gallery/' + gid
    loadImageFapGallery(
      baseGalleryURL + '?gid=' + gid + '&view=0',
      allURLs,
      allPosts,
      source,
      filter,
      weight,
      helpers,
      timeout,
      pathSep,
      images,
      baseGalleryURL,
      (h) => (h.next = null),
      resolve
    )
  } else if (url.includes('/organizer/')) {
    if (helpers.next === 0) {
      helpers.next = [0, 0, 0]
    }
    wretch(url + '?page=' + helpers.next[0])
      .addon(AbortAddon())
      .get()
      .setTimeout(10000)
      .onAbort((e) => {
        pm(
          {
            error: e.message,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      })
      .text((html) => {
        const albumEls = new DOMParser()
          .parseFromString(html, 'text/html')
          .querySelectorAll('td.blk_galleries > font > a.blk_galleries')
        if (albumEls.length === 0) {
          let captcha
          if (html.includes('Enter the captcha')) {
            helpers.count = source.count
            captcha =
              'https://www.imagefap.com/gallery/' +
              getFileGroup(url, pathSep) +
              '?view=2'
            pm(
              {
                warning: source.url + ' - blocked due to captcha',
                pathSep
              },
              resolve
            )
          }
          helpers.next = null
          pm(
            {
              captcha: captcha,
              data: [],
              allURLs: allURLs,
              allPosts: allPosts,
              weight: weight,
              helpers,
              source,
              timeout,
              pathSep
            },
            resolve
          )
        } else if (albumEls.length > helpers.next[1]) {
          let albumEl = albumEls[helpers.next[1]]
          const albumHref = albumEl.getAttribute('href') as string
          let albumID = albumHref.substring(albumHref.lastIndexOf('/') + 1)

          let images = Array<string>()
          const baseGalleryURL = 'https://www.imagefap.com/gallery/' + albumID
          loadImageFapGallery(
            baseGalleryURL + '?gid=' + albumID + '&view=0',
            allURLs,
            allPosts,
            source,
            filter,
            weight,
            helpers,
            timeout,
            pathSep,
            images,
            baseGalleryURL,
            (h) => (h.next[1] += 1),
            resolve
          )
        } else {
          let images = Array<string>()
          let captcha
          if (html.includes('Enter the captcha')) {
            helpers.count = source.count
            captcha =
              'https://www.imagefap.com/gallery/' +
              getFileGroup(url, pathSep) +
              '?view=0'
            images = allURLs.get(url) ?? []
            pm(
              {
                warning: source.url + ' - blocked due to captcha',
                pathSep
              },
              resolve
            )
          } else {
            helpers.next[0] += 1
            helpers.next[1] = 0
          }
          pm(
            {
              captcha,
              data: images,
              allURLs,
              allPosts,
              weight,
              helpers,
              source,
              timeout,
              pathSep
            },
            resolve
          )
        }
      })
      .catch((e) => {
        pm(
          {
            error: e.message,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      })
  } else if (url.includes('/video.php?vid=')) {
    helpers.next = null
    pm(
      {
        data: [],
        allURLs: allURLs,
        allPosts: allPosts,
        weight: weight,
        helpers: helpers,
        source: source,
        timeout: timeout,
        pathSep
      },
      resolve
    )
    wretch(url)
      .addon(AbortAddon())
      .get()
      .setTimeout(10000)
      .onAbort((e) =>
        pm(
          {
            error: e.message,
            helpers: helpers,
            source: source,
            timeout: timeout,
            pathSep: pathSep
          },
          resolve
        )
      )
      .text((html) => {
        const foundVideoConfigURLs =
          /url: '(https:\/\/cdn-fck\.moviefap\.com\/moviefap\/.*)',/g.exec(html)
        if (foundVideoConfigURLs != null && foundVideoConfigURLs.length == 2) {
          const videoConfigURL = foundVideoConfigURLs[1] // get first group
          wretch(videoConfigURL)
            .addon(AbortAddon())
            .get()
            .setTimeout(10000)
            .onAbort((e) =>
              pm(
                {
                  error: e.message,
                  helpers: helpers,
                  source: source,
                  timeout: timeout,
                  pathSep: pathSep
                },
                resolve
              )
            )
            .text((xml) => {
              // Get highest resolution video link
              let res = 0
              let videoLink = ''

              const videoQualities = new DOMParser()
                .parseFromString(xml, 'application/xml')
                .querySelectorAll('flixV2 > quality > item')

              for (let i = 0; i < videoQualities.length; i++) {
                const quality = videoQualities.item(i)
                const newResText =
                  quality.querySelector('res')?.innerHTML.slice(0, -1) ?? '-1'
                const newRes = Number(newResText)
                const newVideoLink =
                  newRes > res
                    ? quality.querySelector('videoLink')?.textContent ?? ''
                    : ''

                if (newVideoLink !== '') {
                  res = newRes
                  videoLink = newVideoLink
                }
              }

              const data = videoLink
                ? filterPathsToJustPlayable(filter, [videoLink], false)
                : []
              if (data.length > 0) {
                helpers.count = helpers.count + data.length
              }

              helpers.next = null
              pm(
                {
                  data,
                  allURLs: allURLs,
                  allPosts: allPosts,
                  weight: weight,
                  helpers: helpers,
                  source: source,
                  timeout: timeout,
                  pathSep
                },
                resolve
              )
            })
        } else {
          helpers.next = null
          pm(
            {
              data: [],
              allURLs: allURLs,
              allPosts: allPosts,
              weight: weight,
              helpers: helpers,
              source: source,
              timeout: timeout,
              pathSep: pathSep
            },
            resolve
          )
        }
      })
  } else {
    helpers.next = null
    pm(
      {
        data: [],
        allURLs,
        allPosts,
        weight,
        helpers,
        source,
        timeout,
        pathSep
      },
      resolve
    )
  }
}

export const loadSexCom = (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve?: Function
) => {
  const timeout = 8000
  const url = source.url
  // This doesn't work anymore due to src url requiring referer
  helpers.next = null
  pm(
    {
      data: [],
      allURLs,
      allPosts,
      weight,
      helpers,
      source,
      timeout,
      pathSep
    },
    resolve
  )
  /* let requestURL;
  if (url.includes("/user/")) {
    requestURL = "https://www.sex.com/user/" + getFileGroup(url) + "?page=" + (helpers.next + 1);
  } else if (url.includes("/gifs/") || url.includes("/pics/") || url.includes("/videos/")) {
    requestURL = "https://www.sex.com/" + getFileGroup(url) + "?page=" + (helpers.next + 1);
  }
  wretch(requestURL)
    .get()
    .setTimeout(5000)
    .onAbort((e) => pm({
      error: e.message,
      helpers: helpers,
      source: source,
      timeout: timeout,
      pathSep: pathSep
    }, resolve))
    .notFound((e) => pm({
      error: e.message,
      helpers: helpers,
      source: source,
      timeout: timeout,
      pathSep: pathSep
    }, resolve))
    .text((html) => {
      let imageEls = new DOMParser().parseFromString(html, "text/html").querySelectorAll(".small_pin_box > .image_wrapper > img");
      if (imageEls.length > 0) {
        let videos = Array<string>();
        let images = Array<string>();
        for (let i = 0; i < imageEls.length; i++) {
          const image = imageEls.item(i);
          if (image.nextElementSibling || image.previousElementSibling) {
            videos.push(image.parentElement.getAttribute("href"));
          } else {
            images.push(image.getAttribute("data-src"));
          }
        }
        if (videos.length === 0) {
          helpers.next = helpers.next + 1;
          helpers.count = helpers.count + filterPathsToJustPlayable(IF.any, images, false).length;
          pm({
            data: filterPathsToJustPlayable(filter, images, false),
            allURLs: allURLs,
            allPosts: allPosts,
            weight: weight,
            helpers: helpers,
            source: source,
            timeout: timeout,
            pathSep: pathSep
          }, resolve);
        } else {
          const validImages = filterPathsToJustPlayable(filter, images, false);
          images = [];
          let count = 0;
          for (let videoURL of videos) {
            wretch("https://www.sex.com" + videoURL)
              .get()
              .setTimeout(5000)
              .onAbort((e) => pm({
                error: e.message,
                helpers: helpers,
                source: source,
                timeout: timeout,
                pathSep: pathSep
              }, resolve))
              .notFound((e) => pm({
                error: e.message,
                helpers: helpers,
                source: source,
                timeout: timeout,
                pathSep: pathSep
              }, resolve))
              .text((html) => {
                count += 1;

                let vidID = null;
                const vidIDRegex = /\/video\/stream\/(\d+)/g;
                let regexResult = vidIDRegex.exec(html);
                if (regexResult != null) {
                  vidID = regexResult[1];
                }

                let date = null;
                const dateRegex = /\d{4}\/\d{2}\/\d{2}/g;
                regexResult = dateRegex.exec(html);
                if (regexResult != null) {
                  date = regexResult[0];
                }

                if (vidID != null && date != null) {
                  images.push("https://videos1.sex.com/stream/" + date + "/" + vidID +".mp4");
                }
                if (count === videos.length) {
                  const validVideos = filterPathsToJustPlayable(IF.any, images, true);
                  const filePaths = validImages.concat(validVideos);
                  helpers.next = helpers.next + 1;
                  helpers.count = helpers.count + filePaths.length;
                  pm({
                    data: filePaths,
                    allURLs: allURLs,
                    allPosts: allPosts,
                    weight: weight,
                    helpers: helpers,
                    source: source,
                    timeout: timeout,
                    pathSep: pathSep
                  }, resolve);
                }
              });
          }
        }
      } else {
        helpers.next = null;
        pm({
          data: [],
          allURLs: allURLs,
          allPosts: allPosts,
          weight: weight,
          helpers: helpers,
          source: source,
          timeout: timeout,
          pathSep: pathSep
        }, resolve);
      }
    }); */
}

export const loadImgur = async (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve?: Function
) => {
  const flipflip = FlipFlipService.getInstance()
  const timeout = 3000
  const url = source.url
  try {
    const album = getFileGroup(url, pathSep) as string
    const images = await flipflip.api.imgurAlbumImages(album)
    helpers.next = null
    helpers.count =
      helpers.count + filterPathsToJustPlayable(IF.any, images, true).length
    pm(
      {
        data: filterPathsToJustPlayable(filter, images, true),
        allURLs,
        allPosts,
        weight,
        helpers,
        source,
        timeout,
        pathSep
      },
      resolve
    )
  } catch (err: any) {
    pm(
      {
        error: err.message,
        helpers,
        source,
        timeout,
        pathSep
      },
      resolve
    )
  }
}

export const loadTwitter = async (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve?: Function
) => {
  const flipflip = FlipFlipService.getInstance()
  const timeout = 3000
  const configured =
    config.remoteSettings.twitterAccessTokenKey !== '' &&
    config.remoteSettings.twitterAccessTokenSecret !== ''
  if (configured) {
    const includeRetweets = source.includeRetweets
    const includeReplies = source.includeReplies
    const url = source.url

    try {
      const items = await flipflip.api.twitterLoadImages(
        config.remoteSettings.twitterConsumerKey,
        config.remoteSettings.twitterConsumerSecret,
        config.remoteSettings.twitterAccessTokenKey,
        config.remoteSettings.twitterAccessTokenSecret,
        getFileGroup(url, pathSep) as string,
        !includeReplies,
        includeRetweets,
        helpers.next
      )

      if (items.images.length === 0) {
        helpers.next = null
        pm(
          {
            data: [],
            allURLs,
            allPosts,
            weight,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      } else {
        const playablePaths = filterPathsToJustPlayable(
          IF.any,
          items.images,
          true
        )
        helpers.next = items.lastID
        helpers.count = helpers.count + playablePaths.length
        pm(
          {
            data: playablePaths,
            allURLs,
            allPosts,
            weight,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      }
    } catch (error: any) {
      pm(
        {
          error: error.message,
          helpers,
          source,
          timeout,
          pathSep
        },
        resolve
      )
    }
  } else {
    let systemMessage
    if (!twitterAlerted) {
      systemMessage =
        "You haven't authorized FlipFlip to work with Twitter yet.\nVisit Settings to authorize Twitter."
      twitterAlerted = true
    }
    pm(
      {
        systemMessage,
        helpers,
        source,
        timeout,
        pathSep
      },
      resolve
    )
  }
}

export const loadDeviantArt = (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve?: Function
) => {
  const timeout = 3000
  const url = source.url
  wretch(
    'https://backend.deviantart.com/rss.xml?type=deviation&q=by%3A' +
      getFileGroup(url, pathSep) +
      '+sort%3Atime+meta%3Aall' +
      (helpers.next !== 0 ? '&offset=' + helpers.next : '')
  )
    .addon(AbortAddon())
    .get()
    .setTimeout(5000)
    .onAbort((e) => {
      pm(
        {
          error: e.message,
          helpers,
          source,
          timeout,
          pathSep
        },
        resolve
      )
    })
    .notFound((e) => {
      pm(
        {
          error: e.message,
          helpers,
          source,
          timeout,
          pathSep
        },
        resolve
      )
    })
    .text((text) => {
      const xml = new DOMParser().parseFromString(text, 'text/xml')
      let hasNextPage = false
      const pages = xml.getElementsByTagName('atom:link')
      for (let l = 0; l < pages.length; l++) {
        if (pages[l].getAttribute('rel') === 'next') hasNextPage = true
      }
      const images = Array<string>()
      const items = xml.getElementsByTagName('item')
      for (let i = 0; i < items.length; i++) {
        helpers.next += 1
        const contents = items[i].getElementsByTagName('media:content')
        for (let c = 0; c < contents.length; c++) {
          const content = contents[c]
          if (content.getAttribute('medium') === 'image') {
            images.push(content.getAttribute('url') as string)
          }
        }
      }
      if (!hasNextPage) {
        helpers.next = null
      }
      helpers.count =
        helpers.count + filterPathsToJustPlayable(IF.any, images, false).length
      pm(
        {
          data: filterPathsToJustPlayable(filter, images, false),
          allURLs,
          allPosts,
          weight,
          helpers,
          source,
          timeout,
          pathSep
        },
        resolve
      )
    })
}

let initInstagram = true
let session: any = null
export const loadInstagram = async (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve?: Function
) => {
  const flipflip = FlipFlipService.getInstance()
  const timeout = 3000
  const configured =
    config.remoteSettings.instagramUsername !== '' &&
    config.remoteSettings.instagramPassword !== ''
  if (configured) {
    const url = source.url
    const processItems = (
      items: any,
      helpers: { next: any; count: number; retries: number; uuid: string }
    ) => {
      const images = Array<string>()
      for (const item of items) {
        if (item.carousel_media) {
          for (const media of item.carousel_media) {
            images.push(media.image_versions2.candidates[0].url)
          }
        }
        if (item.video_versions) {
          images.push(item.video_versions[0].url)
        } else if (item.image_versions2) {
          images.push(item.image_versions2.candidates[0].url)
        }
      }
      // Strict filter won't work because instagram media needs the extra parameters on the end
      helpers.count =
        helpers.count + filterPathsToJustPlayable(IF.any, images, false).length
      pm(
        {
          data: filterPathsToJustPlayable(filter, images, false),
          allURLs,
          allPosts,
          weight,
          helpers,
          source,
          timeout,
          pathSep
        },
        resolve
      )
    }

    if (initInstagram) {
      initInstagram = false
      try {
        await flipflip.api.igLogin(
          config.remoteSettings.instagramUsername,
          config.remoteSettings.instagramPassword
        )
      } catch (e: any) {
        pm(
          {
            error: e.message,
            systemMessage:
              e +
              '\n\nVisit Settings to authorize Instagram and attempt to resolve this issue.',
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
        initInstagram = true
        return
      }

      try {
        session = await flipflip.api.igSerializeCookieJar()
      } catch (e: any) {
        pm(
          {
            error: e.message,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      }

      if (url.endsWith('/saved')) {
        try {
          const saved = await flipflip.api.igSavedItems()
          helpers.next = [null, saved.feed]
          processItems(saved.items, helpers)
        } catch (e: any) {
          pm(
            {
              error: e.message,
              helpers,
              source,
              timeout,
              pathSep
            },
            resolve
          )
        }
      } else {
        try {
          const username = getFileGroup(url, pathSep) as string
          const userFeed = await flipflip.api.igUserFeedItems(username)
          helpers.next = [userFeed.userId, userFeed.feed]
          processItems(userFeed.items, helpers)
        } catch (e: any) {
          pm(
            {
              error: e.message,
              helpers,
              source,
              timeout,
              pathSep
            },
            resolve
          )
        }
      }
    } else if (helpers.next === 0) {
      if (url.endsWith('/saved')) {
        try {
          const saved = await flipflip.api.igSavedItems()
          helpers.next = [null, saved.feed]
          processItems(saved.items, helpers)
        } catch (e: any) {
          pm(
            {
              error: e.message,
              helpers,
              source,
              timeout,
              pathSep
            },
            resolve
          )
        }
      } else {
        try {
          const username = getFileGroup(url, pathSep) as string
          const userFeed = await flipflip.api.igUserFeedItems(username)
          helpers.next = [userFeed.userId, userFeed.feed]
          processItems(userFeed.items, helpers)
        } catch (e: any) {
          pm(
            {
              error: e.message,
              helpers,
              source,
              timeout,
              pathSep
            },
            resolve
          )
        }
      }
    } else {
      try {
        const nextFeed = await flipflip.api.igGetMore(
          session,
          helpers.next[0],
          helpers.next[1]
        )
        if (nextFeed) {
          helpers.next = [nextFeed.userId, nextFeed.feed]
          processItems(nextFeed.items, helpers)
        } else {
          helpers.next = null
          pm(
            {
              data: [],
              allURLs,
              allPosts,
              weight,
              helpers,
              source,
              timeout,
              pathSep
            },
            resolve
          )
        }
      } catch (e: any) {
        pm(
          {
            error: e.message,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      }
    }
  } else {
    let systemMessage
    if (!instagramAlerted) {
      systemMessage =
        "You haven't authorized FlipFlip to work with Instagram yet.\nVisit Settings to authorize Instagram."
      instagramAlerted = true
    }
    pm(
      {
        systemMessage,
        helpers,
        source,
        timeout,
        pathSep
      },
      resolve
    )
  }
}

export const loadE621 = (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve?: Function
) => {
  const timeout = 8000
  const url = source.url
  const hostRegex = /^(https?:\/\/[^\/]*)\//g
  const thisHost = hostRegex.exec(url)![1]
  let suffix = ''
  if (url.includes('/pools/')) {
    suffix = '/pools.json?search[id]=' + url.substring(url.lastIndexOf('/') + 1)

    wretch(thisHost + suffix)
      .addon(AbortAddon())
      .get()
      .setTimeout(5000)
      .badRequest((e) => {
        pm(
          {
            error: e.message,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      })
      .notFound((e) => {
        pm(
          {
            error: e.message,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      })
      .timeout((e) => {
        pm(
          {
            error: e.message,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      })
      .internalError((e) => {
        pm(
          {
            error: e.message,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      })
      .onAbort((e) => {
        pm(
          {
            error: e.message,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      })
      .json((json: any) => {
        if (json.length === 0) {
          helpers.next = null
          pm(
            {
              data: [],
              allURLs,
              allPosts,
              weight,
              helpers,
              source,
              timeout,
              pathSep
            },
            resolve
          )
          return
        }

        const count = json[0].post_count
        const images = Array<string>()
        for (const postID of json[0].post_ids) {
          suffix = '/posts/' + postID + '.json'
          wretch(thisHost + suffix)
            .addon(AbortAddon())
            .get()
            .setTimeout(5000)
            .badRequest((e) => {
              pm(
                {
                  error: e.message,
                  helpers,
                  source,
                  timeout,
                  pathSep
                },
                resolve
              )
            })
            .notFound((e) => {
              pm(
                {
                  error: e.message,
                  helpers,
                  source,
                  timeout,
                  pathSep
                },
                resolve
              )
            })
            .timeout((e) => {
              pm(
                {
                  error: e.message,
                  helpers,
                  source,
                  timeout,
                  pathSep
                },
                resolve
              )
            })
            .internalError((e) => {
              pm(
                {
                  error: e.message,
                  helpers,
                  source,
                  timeout,
                  pathSep
                },
                resolve
              )
            })
            .onAbort((e) => {
              pm(
                {
                  error: e.message,
                  helpers,
                  source,
                  timeout,
                  pathSep
                },
                resolve
              )
            })
            .json((json: any) => {
              if (json.post?.file.url) {
                let fileURL = json.post.file.url
                if (!fileURL.startsWith('http')) {
                  fileURL = 'https://' + fileURL
                }
                images.push(fileURL)
              }

              if (images.length === count) {
                helpers.next = null
                helpers.count =
                  helpers.count +
                  filterPathsToJustPlayable(IF.any, images, true).length
                pm(
                  {
                    data: filterPathsToJustPlayable(filter, images, true),
                    allURLs,
                    allPosts,
                    weight,
                    helpers,
                    source,
                    timeout,
                    pathSep
                  },
                  resolve
                )
              }
            })
            .catch((e) => {
              pm(
                {
                  error: e.message,
                  helpers,
                  source,
                  timeout,
                  pathSep
                },
                resolve
              )
            })
        }
      })
      .catch((e) => {
        pm(
          {
            error: e.message,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      })
  } else {
    suffix = '/posts.json?limit=20&page=' + (helpers.next + 1)
    const tagRegex = /[?&]tags=(.*)&?/g
    let tags
    if ((tags = tagRegex.exec(url)) !== null) {
      suffix += '&tags=' + tags[1]
    }

    wretch(thisHost + suffix)
      .addon(AbortAddon())
      .get()
      .setTimeout(5000)
      .badRequest((e) => {
        pm(
          {
            error: e.message,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      })
      .notFound((e) => {
        pm(
          {
            error: e.message,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      })
      .timeout((e) => {
        pm(
          {
            error: e.message,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      })
      .internalError((e) => {
        pm(
          {
            error: e.message,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      })
      .onAbort((e) => {
        pm(
          {
            error: e.message,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      })
      .json((json: any) => {
        if (json.length === 0) {
          helpers.next = null
          pm(
            {
              data: [],
              allURLs,
              allPosts,
              weight,
              helpers,
              source,
              timeout,
              pathSep
            },
            resolve
          )
        }

        const list = json.posts
        const images = Array<string>()
        for (const p of list) {
          if (p.file.url) {
            let fileURL = p.file.url
            if (!fileURL.startsWith('http')) {
              fileURL = 'https://' + fileURL
            }
            images.push(fileURL)
          }
        }

        helpers.next = helpers.next + 1
        helpers.count =
          helpers.count + filterPathsToJustPlayable(IF.any, images, true).length
        pm(
          {
            data: filterPathsToJustPlayable(filter, images, true),
            allURLs,
            allPosts,
            weight,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      })
      .catch((e) => {
        pm(
          {
            error: e.message,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      })
  }
}

export const loadDanbooru = (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve?: Function
) => {
  const timeout = 8000
  const url = source.url
  const hostRegex = /^(https?:\/\/[^\/]*)\//g
  const thisHost = hostRegex.exec(url)![1]
  let suffix = ''
  if (url.includes('/pools/')) {
    suffix = '/pools/' + url.substring(url.lastIndexOf('/') + 1) + '.json'
  } else if (url.includes('favorite_groups')) {
    suffix =
      '/favorite_groups/' + url.substring(url.lastIndexOf('/') + 1) + '.json'
  } else {
    suffix = '/post/index.json?limit=20&page=' + (helpers.next + 1)
    const tagRegex = /[?&]tags=(.*)&?/g
    let tags
    if ((tags = tagRegex.exec(url)) !== null) {
      suffix += '&tags=' + tags[1]
    }
    const titleRegex = /[?&]title=(.*)&?/g
    let title
    if ((title = titleRegex.exec(url)) !== null) {
      if (tags == null) {
        suffix += '&tags='
      } else if (!suffix.endsWith('+')) {
        suffix += '+'
      }
      suffix += title[1]
    }
  }
  wretch(thisHost + suffix)
    .addon(AbortAddon())
    .get()
    .setTimeout(5000)
    .badRequest((e) => {
      pm(
        {
          error: e.message,
          helpers,
          source,
          timeout,
          pathSep
        },
        resolve
      )
    })
    .notFound((e) => {
      pm(
        {
          error: e.message,
          helpers,
          source,
          timeout,
          pathSep
        },
        resolve
      )
    })
    .timeout((e) => {
      pm(
        {
          error: e.message,
          helpers,
          source,
          timeout,
          pathSep
        },
        resolve
      )
    })
    .internalError((e) => {
      pm(
        {
          error: e.message,
          helpers,
          source,
          timeout,
          pathSep
        },
        resolve
      )
    })
    .onAbort((e) => {
      pm(
        {
          error: e.message,
          helpers,
          source,
          timeout,
          pathSep
        },
        resolve
      )
    })
    .json((json: any) => {
      if (json.length === 0) {
        helpers.next = null
        pm(
          {
            data: [],
            allURLs,
            allPosts,
            weight,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
        return
      }

      if (json.post_ids) {
        if (json.post_ids.length === 0) {
          helpers.next = null
          pm(
            {
              data: [],
              allURLs,
              allPosts,
              weight,
              helpers,
              source,
              timeout,
              pathSep
            },
            resolve
          )
          return
        }

        const images = Array<string>()
        const postIDs = json.post_ids
        const limit = 10
        let current = helpers.next
        const getPost = () => {
          wretch(thisHost + '/posts/' + postIDs[current++] + '.json')
            .addon(AbortAddon())
            .get()
            .setTimeout(5000)
            .badRequest((e) => {
              pm(
                {
                  error: e.message,
                  helpers,
                  source,
                  timeout,
                  pathSep
                },
                resolve
              )
            })
            .notFound((e) => {
              pm(
                {
                  error: e.message,
                  helpers,
                  source,
                  timeout,
                  pathSep
                },
                resolve
              )
            })
            .timeout((e) => {
              pm(
                {
                  error: e.message,
                  helpers,
                  source,
                  timeout,
                  pathSep
                },
                resolve
              )
            })
            .internalError((e) => {
              pm(
                {
                  error: e.message,
                  helpers,
                  source,
                  timeout,
                  pathSep
                },
                resolve
              )
            })
            .onAbort((e) => {
              pm(
                {
                  error: e.message,
                  helpers,
                  source,
                  timeout,
                  pathSep
                },
                resolve
              )
            })
            .json((json: any) => {
              images.push(json.file_url)
              if (images.length === limit || postIDs.length === current) {
                if (postIDs.length === current) {
                  helpers.next = null
                } else {
                  helpers.next = current
                }
                helpers.count =
                  helpers.count +
                  filterPathsToJustPlayable(IF.any, images, true).length
                pm(
                  {
                    data: filterPathsToJustPlayable(filter, images, true),
                    allURLs,
                    allPosts,
                    weight,
                    helpers,
                    source,
                    timeout,
                    pathSep
                  },
                  resolve
                )
              } else {
                setTimeout(getPost, 200)
              }
            })
            .catch((e) => {
              pm(
                {
                  error: e.message,
                  helpers,
                  source,
                  timeout,
                  pathSep
                },
                resolve
              )
            })
        }
        setTimeout(getPost, 200)
      } else {
        const images = Array<string>()
        for (const p of json) {
          if (p.file_url) {
            let fileURL = p.file_url
            if (!p.file_url.startsWith('http')) {
              fileURL = 'https://' + p.file_url
            }
            images.push(fileURL)
          }
        }

        helpers.next = helpers.next + 1
        helpers.count =
          helpers.count + filterPathsToJustPlayable(IF.any, images, true).length
        pm(
          {
            data: filterPathsToJustPlayable(filter, images, true),
            allURLs,
            allPosts,
            weight,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      }
    })
    .catch((e) => {
      pm(
        {
          error: e.message,
          helpers,
          source,
          timeout,
          pathSep
        },
        resolve
      )
    })
}

export const loadGelbooru1 = (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve?: Function
) => {
  const timeout = 8000
  const url = source.url
  const hostRegex = /^(https?:\/\/[^\/]*)\//g
  const thisHost = hostRegex.exec(url)![1]
  wretch(url + '&pid=' + helpers.next * 10)
    .addon(AbortAddon())
    .get()
    .setTimeout(5000)
    .onAbort((e) => {
      pm(
        {
          error: e.message,
          helpers,
          source,
          timeout,
          pathSep
        },
        resolve
      )
    })
    .notFound((e) => {
      pm(
        {
          error: e.message,
          helpers,
          source,
          timeout,
          pathSep
        },
        resolve
      )
    })
    .error(503, (e) => {
      pm(
        {
          error: e.message,
          helpers,
          source,
          timeout,
          pathSep
        },
        resolve
      )
    })
    .text((html) => {
      const imageEls = new DOMParser()
        .parseFromString(html, 'text/html')
        .querySelectorAll('span.thumb > a')
      if (imageEls.length > 0) {
        let imageCount = 0
        const images = Array<string>()

        const getImage = (index: number) => {
          let link = imageEls.item(index).getAttribute('href') as string
          if (!link.startsWith('http')) {
            link = thisHost + '/' + link
          }
          wretch(link)
            .addon(AbortAddon())
            .get()
            .setTimeout(5000)
            .onAbort((e) => {
              pm(
                {
                  error: e.message,
                  helpers,
                  source,
                  timeout,
                  pathSep
                },
                resolve
              )
            })
            .notFound((e) => {
              pm(
                {
                  error: e.message,
                  helpers,
                  source,
                  timeout,
                  pathSep
                },
                resolve
              )
            })
            .error(503, (e) => {
              pm(
                {
                  error: e.message,
                  helpers,
                  source,
                  timeout,
                  pathSep
                },
                resolve
              )
            })
            .text((html) => {
              imageCount++
              let contentURL = html.match(
                '<img[^>]*id="?image"?[^>]*src="([^"]*)"'
              )
              if (contentURL != null) {
                let url = contentURL[1]
                if (url.startsWith('//')) url = 'http:' + url
                images.push(url)
              }
              contentURL = html.match('<img[^>]*src="([^"]*)"[^>]*id="?image"?')
              if (contentURL != null) {
                let url = contentURL[1]
                if (url.startsWith('//')) url = 'http:' + url
                images.push(url)
              }
              contentURL = html.match('<video[^>]*src="([^"]*)"')
              if (contentURL != null) {
                let url = contentURL[1]
                if (url.startsWith('//')) url = 'http:' + url
                images.push(url)
              }
              if (imageCount === imageEls.length || imageCount === 10) {
                helpers.next = helpers.next + 1
                helpers.count =
                  helpers.count +
                  filterPathsToJustPlayable(IF.any, images, false).length
                pm(
                  {
                    data: filterPathsToJustPlayable(filter, images, false),
                    allURLs,
                    allPosts,
                    weight,
                    helpers,
                    source,
                    timeout,
                    pathSep
                  },
                  resolve
                )
              }
            })

          if (index < imageEls.length - 1 && index < 9) {
            setTimeout(() => getImage(index + 1), 1000)
          }
        }

        setTimeout(() => getImage(0), 1000)
      } else {
        helpers.next = null
        pm(
          {
            data: [],
            allURLs,
            allPosts,
            weight,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      }
    })
}

export const loadGelbooru2 = (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve?: Function
) => {
  const timeout = 8000
  const url = source.url
  const hostRegex = /^(https?:\/\/[^\/]*)\//g
  const thisHost = hostRegex.exec(url)![1]
  let suffix =
    '/index.php?page=dapi&s=post&q=index&limit=20&json=1&pid=' +
    (helpers.next + 1)
  const tagRegex = /[?&]tags=(.*)&?/g
  let tags
  if ((tags = tagRegex.exec(url)) !== null) {
    suffix += '&tags=' + tags[1]
  }
  wretch(thisHost + suffix)
    .addon(AbortAddon())
    .get()
    .setTimeout(5000)
    .badRequest((e) => {
      pm(
        {
          error: e.message,
          helpers,
          source,
          timeout,
          pathSep
        },
        resolve
      )
    })
    .notFound((e) => {
      pm(
        {
          error: e.message,
          helpers,
          source,
          timeout,
          pathSep
        },
        resolve
      )
    })
    .timeout((e) => {
      pm(
        {
          error: e.message,
          helpers,
          source,
          timeout,
          pathSep
        },
        resolve
      )
    })
    .internalError((e) => {
      pm(
        {
          error: e.message,
          helpers,
          source,
          timeout,
          pathSep
        },
        resolve
      )
    })
    .onAbort((e) => {
      pm(
        {
          error: e.message,
          helpers,
          source,
          timeout,
          pathSep
        },
        resolve
      )
    })
    .json((json: any) => {
      if (json.length === 0) {
        helpers.next = null
        pm(
          {
            data: [],
            allURLs,
            allPosts,
            weight,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      }

      const images = Array<string>()
      for (const p of json) {
        if (p.file_url) {
          images.push(p.file_url)
        } else if (p.image) {
          images.push(thisHost + '//images/' + p.directory + '/' + p.image)
        }
      }

      helpers.next = helpers.next + 1
      helpers.count =
        helpers.count + filterPathsToJustPlayable(IF.any, images, true).length
      pm(
        {
          data: filterPathsToJustPlayable(filter, images, true),
          allURLs,
          allPosts,
          weight,
          helpers,
          source,
          timeout,
          pathSep
        },
        resolve
      )
    })
    .catch((e) => {
      pm(
        {
          error: e.message,
          helpers,
          source,
          timeout,
          pathSep
        },
        resolve
      )
    })
}

export const loadEHentai = (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve?: Function
) => {
  const timeout = 8000
  const url = source.url
  wretch(url + '?p=' + (helpers.next + 1))
    .addon(AbortAddon())
    .get()
    .setTimeout(5000)
    .onAbort((e) => {
      pm(
        {
          error: e.message,
          helpers,
          source,
          timeout,
          pathSep
        },
        resolve
      )
    })
    .notFound((e) => {
      pm(
        {
          error: e.message,
          helpers,
          source,
          timeout,
          pathSep
        },
        resolve
      )
    })
    .text((html) => {
      const imageEls = new DOMParser()
        .parseFromString(html, 'text/html')
        .querySelectorAll('#gdt > .gdtm > div > a')
      if (imageEls.length > 0) {
        let imageCount = 0
        const images = Array<string>()
        for (let i = 0; i < imageEls.length; i++) {
          const image = imageEls.item(i)
          wretch(image.getAttribute('href') as string)
            .addon(AbortAddon())
            .get()
            .setTimeout(5000)
            .onAbort((e) => {
              pm(
                {
                  error: e.message,
                  helpers,
                  source,
                  timeout,
                  pathSep
                },
                resolve
              )
            })
            .notFound((e) => {
              pm(
                {
                  error: e.message,
                  helpers,
                  source,
                  timeout,
                  pathSep
                },
                resolve
              )
            })
            .text((html) => {
              imageCount++
              const contentURL = html.match('<img id="img" src="(.*?)"')
              if (contentURL != null) {
                images.push(contentURL[1])
              }
              if (imageCount === imageEls.length) {
                helpers.next = helpers.next + 1
                helpers.count =
                  helpers.count +
                  filterPathsToJustPlayable(IF.any, images, true).length
                pm(
                  {
                    data: filterPathsToJustPlayable(filter, images, true),
                    allURLs,
                    allPosts,
                    weight,
                    helpers,
                    source,
                    timeout,
                    pathSep
                  },
                  resolve
                )
              }
            })
        }
      } else {
        helpers.next = null
        pm(
          {
            data: [],
            allURLs,
            allPosts,
            weight,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      }
    })
}

export const loadLuscious = (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve?: Function
) => {
  const timeout = 5000
  const url = source.url
  if (url.includes('albums')) {
    const name = getFileGroup(url, pathSep) as string
    const id = name.substring(name.indexOf('_') + 1, name.length)
    wretch(
      'https://members.luscious.net/graphql/nobatch/?operationName=AlbumListOwnPictures'
    )
      .addon(AbortAddon())
      .json({
        operationName: 'AlbumListOwnPictures',
        query:
          'query AlbumListOwnPictures($input: PictureListInput!) {\n' +
          'picture {\n' +
          'list(input: $input) {\n' +
          'info {...FacetCollectionInfo}\n' +
          'items {...PictureStandardWithoutAlbum}\n' +
          '}\n' +
          '}\n' +
          '}\n' +
          'fragment FacetCollectionInfo on FacetCollectionInfo {\n' +
          'page\n' +
          'has_next_page\n' +
          'has_previous_page\n' +
          'total_items\n' +
          'total_pages\n' +
          'items_per_page\n' +
          '}\n' +
          'fragment PictureStandardWithoutAlbum on Picture {\n' +
          'url_to_original\n' +
          'url_to_video\n' +
          'url\n' +
          '}',
        variables: {
          input: {
            filters: [
              {
                name: 'album_id',
                value: id
              }
            ],
            display: 'position',
            page: helpers.next + 1
          }
        }
      })
      .post()
      .setTimeout(5000)
      .onAbort((e) => {
        pm(
          {
            error: e.message,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      })
      .notFound((e) => {
        pm(
          {
            error: e.message,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      })
      .json((json) => {
        const hasNextPage = json.data.picture.list.info.has_next_page
        const items = json.data.picture.list.items
        const totalItems = json.data.picture.list.info.total_items
        if (items.length > 0) {
          const images = []
          for (const item of items) {
            images.push(item.url_to_original)
          }
          helpers.next = hasNextPage ? helpers.next + 1 : null
          helpers.count = totalItems
          // If cdnio image server goes down, use this: filterPathsToJustPlayable(filter, images, true).map((s) => s.replace('cdnio.', 'w1680.')),
          pm(
            {
              data: filterPathsToJustPlayable(filter, images, true),
              allURLs,
              allPosts,
              weight,
              helpers,
              source,
              timeout,
              pathSep
            },
            resolve
          )
        } else {
          helpers.next = null
          pm(
            {
              data: [],
              allURLs,
              allPosts,
              weight,
              helpers,
              source,
              timeout,
              pathSep
            },
            resolve
          )
        }
      })
      .catch((e) => {
        pm(
          {
            error: e.message,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      })
  } else {
    const id = getFileGroup(url, pathSep)
    if (helpers.next === 0) {
      helpers.next = [0, 0, 0]
    }
    wretch(
      'https://members.luscious.net/graphql/nobatch/?operationName=AlbumList'
    )
      .addon(AbortAddon())
      .json({
        operationName: 'AlbumList',
        query:
          'query AlbumList($input: AlbumListInput!) {\n' +
          'album {\n' +
          'list(input: $input) {\n' +
          'info {...FacetCollectionInfo}\n' +
          'items {...AlbumMinimal}\n' +
          '}\n' +
          '}\n' +
          '}\n' +
          'fragment FacetCollectionInfo on FacetCollectionInfo {\n' +
          'page\n' +
          'has_next_page\n' +
          'has_previous_page\n' +
          'total_items\n' +
          'total_pages\n' +
          'url_complete\n' +
          '}\n' +
          'fragment AlbumMinimal on Album {\n' +
          'id\n' +
          '}',
        variables: {
          input: {
            display: 'date_newest',
            filters: [
              {
                name: 'created_by_id',
                value: id
              }
            ],
            page: helpers.next[0] + 1
          }
        }
      })
      .post()
      .setTimeout(5000)
      .onAbort((e) => {
        pm(
          {
            error: e.message,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      })
      .notFound((e) => {
        pm(
          {
            error: e.message,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      })
      .json((json) => {
        const userHasNextPage = json.data.album.list.info.has_next_page
        const albums = json.data.album.list.items
        if (albums.length > 0) {
          const album = albums[helpers.next[1]]
          wretch(
            'https://members.luscious.net/graphql/nobatch/?operationName=AlbumListOwnPictures'
          )
            .addon(AbortAddon())
            .json({
              operationName: 'AlbumListOwnPictures',
              query:
                'query AlbumListOwnPictures($input: PictureListInput!) {\n' +
                'picture {\n' +
                'list(input: $input) {\n' +
                'info {...FacetCollectionInfo}\n' +
                'items {...PictureStandardWithoutAlbum}\n' +
                '}\n' +
                '}\n' +
                '}\n' +
                'fragment FacetCollectionInfo on FacetCollectionInfo {\n' +
                'page\n' +
                'has_next_page\n' +
                'has_previous_page\n' +
                'total_items\n' +
                'total_pages\n' +
                'items_per_page\n' +
                '}\n' +
                'fragment PictureStandardWithoutAlbum on Picture {\n' +
                'url_to_original\n' +
                'url_to_video\n' +
                'url\n' +
                '}',
              variables: {
                input: {
                  filters: [
                    {
                      name: 'album_id',
                      value: album.id
                    }
                  ],
                  display: 'rating_all_time',
                  page: helpers.next[2] + 1
                }
              }
            })
            .post()
            .setTimeout(5000)
            .onAbort((e) => {
              pm(
                {
                  error: e.message,
                  helpers,
                  source,
                  timeout,
                  pathSep
                },
                resolve
              )
            })
            .notFound((e) => {
              pm(
                {
                  error: e.message,
                  helpers,
                  source,
                  timeout,
                  pathSep
                },
                resolve
              )
            })
            .json((json) => {
              const hasNextPage = json.data.picture.list.info.has_next_page
              if (hasNextPage) {
                helpers.next[2] = helpers.next[2] + 1
              } else {
                if (helpers.next[1] < albums.length - 1) {
                  helpers.next[1] = helpers.next[1] + 1
                  helpers.next[2] = 0
                } else {
                  if (userHasNextPage) {
                    helpers.next[0] = helpers.next[0] + 1
                    helpers.next[1] = 0
                    helpers.next[2] = 0
                  } else {
                    helpers.next = null
                  }
                }
              }
              const items = json.data.picture.list.items
              if (items.length > 0) {
                const images = []
                for (const item of items) {
                  images.push(item.url_to_original)
                }
                helpers.count =
                  helpers.count +
                  filterPathsToJustPlayable(IF.any, images, true).length
                pm(
                  {
                    data: filterPathsToJustPlayable(filter, images, true),
                    allURLs,
                    allPosts,
                    weight,
                    helpers,
                    source,
                    timeout,
                    pathSep
                  },
                  resolve
                )
              } else {
                pm(
                  {
                    data: [],
                    allURLs,
                    allPosts,
                    weight,
                    helpers,
                    source,
                    timeout,
                    pathSep
                  },
                  resolve
                )
              }
            })
            .catch((e) => {
              pm(
                {
                  error: e.message,
                  helpers,
                  source,
                  timeout,
                  pathSep
                },
                resolve
              )
            })
        } else {
          helpers.next = null
          pm(
            {
              warning: json,
              data: [],
              allURLs,
              allPosts,
              weight,
              helpers,
              source,
              timeout,
              pathSep
            },
            resolve
          )
        }
      })
      .catch((e) => {
        pm(
          {
            error: e.message,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      })
  }
}

export const loadBDSMlr = (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve?: Function
) => {
  const timeout = 8000
  let url = source.url
  if (url.endsWith('/rss')) {
    url = url.substring(0, url.indexOf('/rss'))
  }
  const retry = () => {
    if (helpers.retries < 3) {
      helpers.retries += 1
      pm(
        {
          data: [],
          allURLs,
          allPosts,
          weight,
          helpers,
          source,
          timeout,
          pathSep
        },
        resolve
      )
    } else {
      pm(
        {
          helpers,
          source,
          timeout,
          pathSep
        },
        resolve
      )
    }
  }
  wretch(url + '/rss?page=' + (helpers.next + 1))
    .addon(AbortAddon())
    .get()
    .setTimeout(5000)
    .onAbort(retry)
    .notFound((e) => {
      pm(
        {
          error: e.message,
          helpers,
          source,
          timeout,
          pathSep
        },
        resolve
      )
    })
    .internalError(retry)
    .text((html) => {
      helpers.retries = 0
      const itemEls = new DOMParser()
        .parseFromString(html, 'text/html')
        .querySelectorAll('item')
      if (itemEls.length > 0) {
        let imageCount = 0
        const images = Array<string>()
        for (let i = 0; i < itemEls.length; i++) {
          const item = itemEls.item(i)
          const embeddedImages = item.querySelectorAll('description > img')
          if (embeddedImages.length > 0) {
            for (const image of embeddedImages) {
              imageCount++
              images.push(image.getAttribute('src') as string)
            }
          }
        }
        helpers.next = helpers.next + 1
        helpers.count =
          helpers.count + filterPathsToJustPlayable(IF.any, images, true).length
        pm(
          {
            data: filterPathsToJustPlayable(filter, images, true),
            allURLs,
            allPosts,
            weight,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      } else {
        helpers.next = null
        pm(
          {
            data: [],
            allURLs,
            allPosts,
            weight,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      }
    })
}

let piwigoLoggedIn: boolean = false
export const loadPiwigo = (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve?: Function
) => {
  const timeout = 8000
  const url = source.url

  const user = config.remoteSettings.piwigoUsername
  const pass = config.remoteSettings.piwigoPassword
  const host = config.remoteSettings.piwigoHost
  const protocol = config.remoteSettings.piwigoProtocol
  const configured =
    host !== '' && protocol !== '' && user !== '' && pass !== ''

  if (configured) {
    const login = async () => {
      await wretch(protocol + '://' + host + '/ws.php?format=json')
        .addon(AbortAddon())
        .addon(FormUrlAddon)
        .formUrl({
          method: 'pwg.session.login',
          username: user,
          password: pass
        })
        .post()
        .setTimeout(5000)
        .notFound((e) => {
          pm(
            {
              error: e.message,
              helpers,
              source,
              timeout,
              pathSep
            },
            resolve
          )
        })
        .internalError((e) => {
          pm(
            {
              error: e.message,
              helpers,
              source,
              timeout,
              pathSep
            },
            resolve
          )
        })
        .json((json) => {
          if (json.stat === 'ok') {
            piwigoLoggedIn = true
            search()
          } else {
            pm(
              {
                error: 'Piwigo login failed.',
                helpers,
                source,
                timeout,
                pathSep
              },
              resolve
            )
          }
        })
        .catch((e) => {
          pm(
            {
              error: e.message,
              helpers,
              source,
              timeout,
              pathSep
            },
            resolve
          )
        })
    }

    const retry = () => {
      if (helpers.retries < 3) {
        helpers.retries += 1
        pm(
          {
            data: [],
            allURLs,
            allPosts,
            weight,
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      } else {
        pm(
          {
            helpers,
            source,
            timeout,
            pathSep
          },
          resolve
        )
      }
    }

    const search = async () => {
      await wretch(url + '&page=' + helpers.next)
        .addon(AbortAddon())
        .get()
        .setTimeout(5000)
        .onAbort(retry)
        .notFound((e) => {
          pm(
            {
              error: e.message,
              helpers,
              source,
              timeout,
              pathSep
            },
            resolve
          )
        })
        .internalError(retry)
        .json((json) => {
          if (json.stat !== 'ok') {
            helpers.next = null
            pm(
              {
                data: [],
                allURLs,
                allPosts,
                weight,
                helpers,
                source,
                timeout,
                pathSep
              },
              resolve
            )
            return
          }

          const images = Array<string>()
          if (json?.result?.images) {
            for (let o = 0; o < json.result.images.length; o++) {
              const image = json.result.images[o]
              if (image.element_url) {
                images.push(image.element_url)
              }
            }
          }

          if (images.length > 0) {
            helpers.next = helpers.next + 1
            helpers.count =
              helpers.count +
              filterPathsToJustPlayable(IF.any, images, true).length
          } else {
            helpers.next = null
          }

          pm(
            {
              data: filterPathsToJustPlayable(filter, images, true),
              allURLs,
              allPosts,
              weight,
              helpers,
              source,
              timeout,
              pathSep
            },
            resolve
          )
        })
    }

    if (!piwigoLoggedIn) {
      login()
    } else {
      search()
    }
  } else {
    let systemMessage
    if (!piwigoAlerted) {
      systemMessage =
        "You haven't configured FlipFlip to work with Piwigo yet.\nVisit Settings to configure Piwigo."
      piwigoAlerted = true
    }
    pm(
      {
        systemMessage,
        helpers,
        source,
        timeout,
        pathSep
      },
      resolve
    )
  }
}

export const loadHydrus = (
  allURLs: Map<string, string[]>,
  allPosts: Map<string, string>,
  config: Config,
  source: LibrarySource,
  filter: string,
  weight: string,
  helpers: { next: any; count: number; retries: number; uuid: string },
  pathSep: string,
  resolve?: Function
) => {
  const timeout = 8000
  const chunk = 1000
  const apiKey = config.remoteSettings.hydrusAPIKey
  const configured = apiKey !== ''
  if (configured) {
    const protocol = config.remoteSettings.hydrusProtocol
    const domain = config.remoteSettings.hydrusDomain
    const port = config.remoteSettings.hydrusPort
    const hydrusURL = protocol + '://' + domain + ':' + port

    if (!source.url.startsWith(hydrusURL)) {
      let systemMessage
      if (!hydrusAlerted) {
        systemMessage =
          "Source url '" +
          source.url +
          "' does not match configured Hydrus server '" +
          hydrusURL
        hydrusAlerted = true
      }
      pm(
        {
          systemMessage,
          helpers,
          source,
          timeout,
          pathSep
        },
        resolve
      )
      return
    }

    const tagsRegex = /tags=([^&]*)&?.*$/.exec(source.url)
    const noTags = tagsRegex == null || tagsRegex.length <= 1

    let pages = 0
    const search = () => {
      const url = noTags
        ? hydrusURL + '/get_files/search_files'
        : hydrusURL + '/get_files/search_files?tags=' + tagsRegex[1]
      wretch(url)
        .addon(AbortAddon())
        .headers({ 'Hydrus-Client-API-Access-Key': apiKey })
        .get()
        .setTimeout(15000)
        .notFound((e) => {
          pm(
            {
              error: e.message,
              helpers,
              source,
              timeout,
              pathSep
            },
            resolve
          )
        })
        .internalError((e) => {
          pm(
            {
              error: e.message,
              helpers,
              source,
              timeout,
              pathSep
            },
            resolve
          )
        })
        .json((json) => {
          const fileIDs = json.file_ids
          pages = Math.ceil(fileIDs.length / chunk)
          getFileMetadata(fileIDs, 0)
        })
        .catch((e) => {
          pm(
            {
              error: e.message,
              helpers,
              source,
              timeout,
              pathSep
            },
            resolve
          )
        })
    }

    const images = Array<string>()
    const getFileMetadata = (fileIDs: number[], page: number) => {
      const pageIDs = fileIDs.slice(page * chunk, (page + 1) * chunk)
      wretch(
        hydrusURL +
          '/get_files/file_metadata?file_ids=[' +
          pageIDs.toString() +
          ']'
      )
        .headers({ 'Hydrus-Client-API-Access-Key': apiKey })
        .addon(AbortAddon())
        .get()
        .setTimeout(15000)
        .notFound((e) => {
          pm(
            {
              error: e.message,
              helpers,
              source,
              timeout,
              pathSep
            },
            resolve
          )
        })
        .internalError((e) => {
          pm(
            {
              error: e.message,
              helpers,
              source,
              timeout,
              pathSep
            },
            resolve
          )
        })
        .json((json) => {
          for (const metadata of json.metadata) {
            if (
              (filter === IF.any && isImageOrVideo(metadata.ext, true)) ||
              ((filter === IF.stills || filter === IF.images) &&
                isImage(metadata.ext, true)) ||
              (filter === IF.animated &&
                metadata.ext.toLowerCase().endsWith('.gif')) ||
              isVideo(metadata.ext, true) ||
              (filter === IF.videos && isVideo(metadata.ext, true))
            ) {
              images.push(
                hydrusURL +
                  '/get_files/file?file_id=' +
                  metadata.file_id +
                  '&Hydrus-Client-API-Access-Key=' +
                  apiKey +
                  '&ext=' +
                  metadata.ext
              )
            }
          }

          page += 1
          if (page === pages) {
            pm(
              {
                data: images,
                allURLs,
                allPosts,
                weight,
                helpers,
                source,
                timeout,
                pathSep
              },
              resolve
            )
          } else {
            getFileMetadata(fileIDs, page)
          }
        })
        .catch((e) => {
          pm(
            {
              error: e.message,
              helpers,
              source,
              timeout,
              pathSep
            },
            resolve
          )
        })
    }

    search()
  } else {
    let systemMessage
    if (!hydrusAlerted) {
      systemMessage =
        "You haven't configured FlipFlip to work with Hydrus yet.\nVisit Settings to configure Hydrus."
      hydrusAlerted = true
    }
    pm(
      {
        systemMessage,
        helpers,
        source,
        timeout,
        pathSep
      },
      resolve
    )
  }
}

export function getFileName(url: string, pathSep: string, extension = true) {
  let sep
  if (/^(https?:\/\/)|(file:\/\/)/g.exec(url) != null) {
    sep = '/'
  } else {
    sep = pathSep
  }
  url = url.substring(url.lastIndexOf(sep) + 1)
  if (url.includes('?')) {
    url = url.substring(0, url.indexOf('?'))
  }
  if (!extension) {
    url = url.substring(0, url.lastIndexOf('.'))
  }
  return url
}

let _redgifOAuth: any = null
async function convertURL(url: string, pathSep: string): Promise<string[]> {
  if (url.includes('.gifv')) {
    return [url.replace('.gifv', '.mp4')]
  }

  // If this is a imgur image page, return image file
  const imgurMatch = url.match('^https?://(?:m.)?imgur.com/([\\w\\d]{7})$')
  if (imgurMatch != null) {
    return ['https://i.imgur.com/' + imgurMatch[1] + '.jpg']
  }

  // If this is imgur album, return album images
  const imgurAlbumMatch = url.match('^https?://imgur.com/a/([\\w\\d]{7})$')
  if (imgurAlbumMatch != null) {
    const flipflip = FlipFlipService.getInstance()
    const album = getFileGroup(url, pathSep) as string
    return await flipflip.api.imgurAlbumImages(album)
  }

  // If this is gfycat page, return gfycat image
  const gfycatMatch = url.match('^https?://gfycat.com/(?:ifr/)?(\\w*)$')
  if (gfycatMatch != null) {
    // Only lookup CamelCase url if not already CamelCase
    if (/[A-Z]/.test(gfycatMatch[1])) {
      return ['https://giant.gfycat.com/' + gfycatMatch[1] + '.mp4']
    }

    const html = await wretch(url)
      .get()
      .notFound(() => {
        return [url]
      })
      .text()
    const gfycat = new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelectorAll(
        '#video-' + gfycatMatch[1].toLocaleLowerCase() + ' > source'
      )
    if (gfycat.length > 0) {
      for (const source of gfycat) {
        if ((source as any).type === 'video/webm') {
          return [(source as any).src]
        }
      }
      // Fallback to MP4
      for (const source of gfycat) {
        if (
          (source as any).type === 'video/mp4' &&
          !(source as any).src.endsWith('-mobile.mp4')
        ) {
          return [(source as any).src]
        }
      }
      // Fallback to MP4-mobile
      for (const source of gfycat) {
        if ((source as any).type === 'video/mp4') {
          return [(source as any).src]
        }
      }
    }
  }

  // If this is redgif page, return redgif image
  const redgifMatch =
    /^https?:\/\/(?:www\.)?redgifs\.com\/watch\/(\w*).*$/.exec(url)
  if (redgifMatch != null) {
    let fourOFour = false
    if (_redgifOAuth == null) {
      const authJson: any = await wretch(
        'https://api.redgifs.com/v2/oauth/client'
      )
        .addon(FormUrlAddon)
        .content('application/x-www-form-urlencoded')
        .formUrl({
          grant_type: 'client_credentials',
          client_id: '183c871ed84-0009-314e-0005-2eb73632ccb8',
          client_secret: 'e600b7ca33a0d5a012df08468b3adb25'
        })
        .post()
        .json()
      if (_redgifOAuth == null && authJson.access_token) {
        _redgifOAuth = 'Bearer ' + authJson.access_token
      }
    }

    const json: any = await wretch(
      'https://api.redgifs.com/v2/gifs/' + redgifMatch[1]
    )
      .auth(_redgifOAuth)
      .get()
      .notFound(() => {
        fourOFour = true
      })
      .json()
    if (fourOFour) {
      return [url]
    } else if (json?.gif) {
      if (json.gif.urls.hd) {
        return [json.gif.urls.hd]
      }
      if (json.gif.urls.sd) {
        return [json.gif.urls.sd]
      }
    }
  }

  if (url.includes('redgifs') || url.includes('gfycat')) {
    pm({
      warning: 'Possible missed file: ' + url,
      pathSep
    })
  }

  return [url]
}
