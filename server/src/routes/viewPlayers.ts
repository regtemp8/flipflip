import express from 'express'
import viewPlayers from '../player/ViewPlayerService'
import displayViews from '../services/displayViewService'
import { findDisplaySettings } from '../db/DisplaySettingsRepository'
import { User } from '../db/types/generated'
import { ViewPlayerConfig } from 'flipflip-common'

const router = express.Router()
router.get('/:id/config', async (req, res) => {
    const viewPlayer = viewPlayers().get(req.params.id)
    if(viewPlayer == null) {
        res.status(404).end()
        return
    }

    const view = await displayViews().getById(viewPlayer.getViewId())
    if(view != null) {
        const sceneId = viewPlayer.getCurrentSceneId()
        const {maxInMemory, maxLoadingAtOnce} = await findDisplaySettings(req.user as User)
        const body: ViewPlayerConfig = {
            view,
            sceneId,
            maxCanLoad: maxInMemory,
            maxCanLoadAtOnce: maxLoadingAtOnce
        }

        res.status(200).send(body)
    } else {
        res.status(404).end()
    }
})

router.get('/:id/items', async (req, res) => {
    let size = NaN
    if(req.query.size != null) {
        size = Number(req.query.size as string)
    }
    if(isNaN(size)) {
        res.status(400).end()
        return
    }

    const viewPlayer = viewPlayers().get(req.params.id)
    if(viewPlayer == null) {
        res.status(404).end()
        return
    }

    const items = viewPlayer.take(size)
    res.status(200).send(items)
})

export default router