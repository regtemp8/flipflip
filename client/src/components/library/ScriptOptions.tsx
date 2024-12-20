import {
  AppBar,
  Card,
  CardContent,
  Collapse,
  Grid2,
  IconButton,
  type Theme,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

import { makeStyles } from 'tss-react/mui'

import FontOptions from './FontOptions'
import BaseSwitch from '../common/BaseSwitch'
import {
  setCaptionScriptStopAtEnd,
  setCaptionScriptNextSceneAtEnd,
  setCaptionScriptSyncWithAudio,
  setCaptionScriptOpacity
} from '../../store/api/thunks'
import {
  useGetCaptionScriptStopAtEndQuery,
  useGetCaptionScriptNextSceneAtEndQuery,
  useGetCaptionScriptSyncWithAudioQuery,
  useGetCaptionScriptOpacityQuery
} from '../../store/api/selectors'
import BaseSlider from '../common/slider/BaseSlider'
import { useGetCaptionScriptQuery } from '../../store/api/slice'
import { useNavigate, useParams } from 'react-router-dom'
import { cx } from '@emotion/css'

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    display: 'flex'
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1
  },
  appBarSpacer: {
    backgroundColor: theme.palette.primary.main,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    minHeight: 64
  },
  backButton: {
    float: 'left'
  },
  title: {
    textAlign: 'center',
    flexGrow: 1
  },
  headerBar: {
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    flexWrap: 'nowrap'
  },
  headerLeft: {
    flexBasis: '3%'
  },
  content: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: theme.palette.background.default
  },
  fill: {
    padding: theme.spacing(2)
  }
}))

function ScriptOptions() {
  const navigate = useNavigate()
  const params = useParams()
  const id = Number(params.id)
  const { data: script } = useGetCaptionScriptQuery(id)

  const goBack = () => {
    navigate(-1)
  }

  const { classes } = useStyles()
  return (
    <div className={classes.root}>
      <AppBar enableColorOnDark position="absolute" className={classes.appBar}>
        <Toolbar className={classes.headerBar}>
          <div className={classes.headerLeft}>
            <Tooltip disableInteractive title="Back" placement="right-end">
              <IconButton
                edge="start"
                color="inherit"
                aria-label="Back"
                className={classes.backButton}
                onClick={goBack}
                size="large"
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          </div>

          <Typography
            component="h1"
            variant="h4"
            color="inherit"
            noWrap
            className={classes.title}
          >
            {script?.url ?? ''}
          </Typography>
          <div className={classes.headerLeft} />
        </Toolbar>
      </AppBar>

      <main className={classes.content}>
        <div className={classes.appBarSpacer} />

        <div className={cx(classes.root, classes.fill)}>
          <Grid2 container spacing={2}>
            <Grid2
              size={{ xs: 12, md: 6, lg: 4 }}
              offset={{ xs: 0, md: 3, lg: 0 }}
            >
              <Card>
                <CardContent>
                  <Grid2 container spacing={2} alignItems="center">
                    <Grid2>
                      <Collapse in={!script?.nextSceneAtEnd}>
                        <BaseSwitch
                          label="Stop at End"
                          size="small"
                          selector={() => useGetCaptionScriptStopAtEndQuery(id)}
                          action={setCaptionScriptStopAtEnd(id)}
                        />
                      </Collapse>
                      <Collapse in={!script?.stopAtEnd}>
                        <BaseSwitch
                          label="Next Scene at End"
                          size="small"
                          selector={() =>
                            useGetCaptionScriptNextSceneAtEndQuery(id)
                          }
                          action={setCaptionScriptNextSceneAtEnd(id)}
                        />
                      </Collapse>
                      <BaseSwitch
                        label="Sync Timestamp with Audio"
                        size="small"
                        selector={() =>
                          useGetCaptionScriptSyncWithAudioQuery(id)
                        }
                        action={setCaptionScriptSyncWithAudio(id)}
                      />
                    </Grid2>
                    <Grid2 size={12}>
                      <BaseSlider
                        min={0}
                        max={100}
                        selector={() => useGetCaptionScriptOpacityQuery(id)}
                        action={setCaptionScriptOpacity(id)}
                        labelledBy="opacity-slider"
                        label={{ text: 'Script Opacity:', appendValue: true }}
                        format={{ type: 'percent' }}
                      />
                    </Grid2>
                  </Grid2>
                </CardContent>
              </Card>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6, lg: 4 }}>
              <Card>
                <CardContent>
                  <FontOptions
                    name={'Blink'}
                    captionScriptID={id}
                    type="blink"
                  />
                </CardContent>
              </Card>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6, lg: 4 }}>
              <Card>
                <CardContent>
                  <FontOptions
                    name={'Caption'}
                    captionScriptID={id}
                    type="caption"
                  />
                </CardContent>
              </Card>
            </Grid2>
            <Grid2
              size={{ xs: 12, md: 6, lg: 4 }}
              offset={{ xs: 0, md: 0, lg: 4 }}
            >
              <Card>
                <CardContent>
                  <FontOptions
                    name={'Big Caption'}
                    captionScriptID={id}
                    type="captionBig"
                  />
                </CardContent>
              </Card>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6, lg: 4 }}>
              <Card>
                <CardContent>
                  <FontOptions
                    name={'Count'}
                    captionScriptID={id}
                    type="count"
                  />
                </CardContent>
              </Card>
            </Grid2>
          </Grid2>
        </div>
      </main>
    </div>
  )
}

;(ScriptOptions as any).displayName = 'ScriptOptions'
export default ScriptOptions
