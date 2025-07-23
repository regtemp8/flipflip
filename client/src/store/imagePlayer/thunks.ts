import { ImageViewData} from "flipflip-common"
import { flipflipApi } from "../api/slice"
import { AppDispatch, RootState } from "../store"
import { ImageViewState, setImagePlayerIFrameCount, setImagePlayerIsLoading, setImagePlayerLoadingComplete, setImagePlayerSetImageView, setImagePlayerStartLoading } from "./slice"

export function loadImageViews(uuid: string) {
    return async (dispatch: AppDispatch, getState: () => RootState) => {
        const state = getState()
        const player = state.imagePlayer[uuid]
        if (player == null || player.isLoading) {
            return
        }

        dispatch(setImagePlayerIsLoading({uuid, value: true}))
        const { mainLoaded, loader, currentSceneID } = player
        const canLoad = Math.min(
            loader.maxCanLoadAtOnce - loader.loadingCount,
            loader.readyToLoad.length
        )
        if (canLoad <= 0) {
            dispatch(setImagePlayerIsLoading({uuid, value: false}))
            return
        }

        let items: ImageViewData[] = []
        try {
            const result = await dispatch(flipflipApi.endpoints.getViewPlayerItems.initiate({ id: uuid, size: canLoad }, {forceRefetch: true}));
            if (result.data != null) {
                items = result.data
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        }

        let iframeCount = loader.iframeCount
        const maxIframeCount = 2
        dispatch(setImagePlayerStartLoading({ uuid, value: items.length }))
        items.forEach((item, i) => {
            const index = loader.readyToLoad[i]
            let keep = currentSceneID === item.sceneId
                && loader.imageViews[index]?.data.url !== item.data.url // if url hasn't changed, then onload event isn't triggered

            if (keep && item.data.type === 'iframe') {
                if (iframeCount < maxIframeCount) {
                    iframeCount++
                } else {
                    // TODO bring back onlyIframes, so that a scene with only iframes stops loading
                    keep = false
                }
            }

            if (keep) {
                const imageView: ImageViewState = {
                    ...item,
                    show: false,
                    zIndex: -1
                }

                dispatch(
                    setImagePlayerSetImageView({
                        uuid,
                        value: { index, view: imageView }
                    })
                )
            } else {
                const payload = { uuid, value: [index] }
                dispatch(setImagePlayerLoadingComplete(payload))
            }
        })

        dispatch(setImagePlayerIFrameCount({uuid, value: iframeCount}))
        dispatch(setImagePlayerIsLoading({uuid, value: false}))
        if (mainLoaded) {
            dispatch(loadImageViews(uuid))
        } else {
            setTimeout(() => dispatch(loadImageViews(uuid)), 1000) // TODO remove setTimeout after debugging
        }
    }
}