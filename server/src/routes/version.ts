import express from 'express'
import { LatestVersion, ValueResponse } from 'flipflip-common'

const VERSION = '4.0.0-beta5'

const router = express.Router()
router.get('/', (req, res) => {
  // TODO get version value from variable
  const response: ValueResponse = { value: VERSION }
  res.status(200).send(response)
})

router.get('/latest', async (req, res, next) => {
  try {
    const response = await fetch(
      'https://api.github.com/repos/regtemp8/flipflip/releases?per_page=1'
    )
    const json = await response.json()
    const newestReleaseTag = json[0].tag_name
    let releaseVersion = newestReleaseTag
      .replace('v', '')
      .replace('.', '')
      .replace('.', '')
    let releaseBetaVersion = -1
    if (releaseVersion.includes('-')) {
      const releaseSplit = releaseVersion.split('-')
      releaseVersion = releaseSplit[0]
      const betaString = releaseSplit[1]
      const betaNumber = betaString.replace('beta', '')
      if (betaNumber === '') {
        releaseBetaVersion = 0
      } else {
        releaseBetaVersion = parseInt(betaNumber)
      }
    }
    let thisVersion = VERSION.replace('.', '').replace('.', '')
    let thisBetaVersion = -1
    if (thisVersion.includes('-')) {
      const releaseSplit = thisVersion.split('-')
      thisVersion = releaseSplit[0]
      const betaString = releaseSplit[1]
      const betaNumber = betaString.replace('beta', '')
      if (betaNumber === '') {
        thisBetaVersion = 0
      } else {
        thisBetaVersion = parseInt(betaNumber)
      }
    }

    if (
      isNewVersion(
        releaseVersion,
        releaseBetaVersion,
        thisVersion,
        thisBetaVersion
      )
    ) {
      const latest: LatestVersion = {
        version: newestReleaseTag,
        url: json[0].html_url
      }
      res.status(200).send(latest)
    } else {
      res.status(204).end()
    }
  } catch (error) {
    next(error)
  }
})

function isNewVersion(
  latestVersion: string,
  latestBetaVersion: number,
  currentVersion: string,
  currentBetaVersion: number
) {
  return (
    parseInt(latestVersion) > parseInt(currentVersion) ||
    (parseInt(latestVersion) === parseInt(currentVersion) &&
      ((latestBetaVersion === -1 && currentBetaVersion >= 0) ||
        latestBetaVersion > currentBetaVersion))
  )
}

export default router
