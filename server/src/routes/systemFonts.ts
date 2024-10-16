import express from 'express'
import fontList from 'font-list'
import SystemFonts from 'system-font-families'
import { isMacOSX } from '../utils'

const router = express.Router()
router.get('/', async (req, res) => {
  let systemFonts: string[]
  if (isMacOSX) {
    systemFonts = await new SystemFonts().getFonts().then(
      (fonts) => fonts,
      () => []
    )
  } else {
    systemFonts = await fontList.getFonts().then(
      (fonts) => {
        fonts = fonts.map((r: string) => {
          if (r.startsWith('"') && r.endsWith('"')) {
            r = r.substring(1, r.length - 1)
          }

          return r
        })

        return fonts
      },
      () => []
    )
  }

  res.status(200).send(systemFonts)
})

export default router
