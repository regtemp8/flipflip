import clsx from 'clsx'
import { Grid, Collapse, MenuItem, type Theme } from '@mui/material'
import { type WithStyles, createStyles, withStyles } from '@mui/styles'
import type ReduxProps from './ReduxProps'
import { useAppSelector } from '../../store/hooks'
import BaseSlider from './slider/BaseSlider'
import BaseSelect from './BaseSelect'
import BaseSwitch from './BaseSwitch'
import { RootState } from '../../store/store'

const styles = (theme: Theme) =>
  createStyles({
    fullWidth: {
      width: '100%'
    },
    paddingLeft: {
      [theme.breakpoints.up('sm')]: {
        paddingLeft: theme.spacing(1)
      }
    },
    endInput: {
      paddingLeft: theme.spacing(1),
      paddingTop: 0
    },
    percentInput: {
      minWidth: theme.spacing(11)
    },
    noPadding: {
      padding: '0 !important'
    }
  })

export interface MoveCardProps extends WithStyles<typeof styles> {
  sidebar: boolean
  enabled: boolean
  values: any
  valueMapper: (value: any) => string
  label: string
  type: ReduxProps<string>
  random: ReduxProps<boolean>
  imageWidth?: ReduxProps<boolean>
  level: ReduxProps<number>
  levelMin: ReduxProps<number>
  levelMax: ReduxProps<number>
}

function MoveCard(props: MoveCardProps) {
  const type = useAppSelector(props.type.selector)
  const random = useAppSelector(props.random.selector)
  const imageWidthSelector: (state: RootState) => boolean =
    props.imageWidth?.selector ?? ((state) => false)
  const imageWidth = useAppSelector(imageWidthSelector)
  const classes = props.classes
  return (
    <Grid container spacing={2} alignItems="center">
      <Grid
        item
        xs={12}
        sm={!props.sidebar && type !== props.values.none ? 5 : 12}
      >
        <Collapse
          in={props.enabled}
          className={clsx(classes.fullWidth, classes.paddingLeft)}
        >
          <BaseSelect
            label={props.label}
            selector={props.type.selector}
            action={props.type.action}
            controlClassName={classes.fullWidth}
          >
            {Object.values(props.values).map((tf: any) => {
              return (
                <MenuItem key={tf} value={tf}>
                  {props.valueMapper(tf)}
                </MenuItem>
              )
            })}
          </BaseSelect>
        </Collapse>
      </Grid>
      <Grid
        item
        xs={12}
        sm={!props.sidebar && type !== props.values.none ? 7 : 12}
        className={clsx(
          (!props.enabled || type === props.values.none) && classes.noPadding
        )}
      >
        <Collapse
          in={props.enabled && !imageWidth && type !== props.values.none}
          className={clsx(classes.fullWidth, classes.paddingLeft)}
        >
          <BaseSwitch
            label="Randomize"
            size="small"
            selector={props.random.selector}
            action={props.random.action}
          />
        </Collapse>
        {props.imageWidth ? (
          <Collapse
            in={props.enabled && type !== props.values.none}
            className={clsx(classes.fullWidth, classes.paddingLeft)}
          >
            <BaseSwitch
              label="Use Img Width"
              size="small"
              selector={props.imageWidth.selector}
              action={props.imageWidth.action}
            />
          </Collapse>
        ) : null}
      </Grid>
      <Grid
        item
        xs={12}
        className={clsx(
          (!props.enabled || type === props.values.none) && classes.noPadding
        )}
      >
        <Collapse
          in={
            props.enabled &&
            !imageWidth &&
            type !== props.values.none &&
            !random
          }
          className={classes.fullWidth}
        >
          <BaseSlider
            min={0}
            max={100}
            selector={props.level.selector}
            action={props.level.action}
            labelledBy="horiz-trans-level-slider"
            format={{
              type: 'percent'
            }}
            textField={{
              className: classes.endInput,
              step: 5
            }}
          />
        </Collapse>
        <Collapse
          in={
            props.enabled && !imageWidth && type !== props.values.none && random
          }
          className={classes.fullWidth}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={props.sidebar ? 12 : 6}>
              <BaseSlider
                selector={props.levelMin.selector}
                action={props.levelMin.action}
                min={0}
                max={100}
                labelledBy="horiz-trans-min-slider"
                format={{ type: 'percent' }}
                label={{
                  text: 'Min:',
                  variant: 'body1',
                  color: 'text.primary',
                  appendValue: true
                }}
              />
            </Grid>
            <Grid item xs={12} sm={props.sidebar ? 12 : 6}>
              <BaseSlider
                selector={props.levelMax.selector}
                action={props.levelMax.action}
                min={0}
                max={100}
                labelledBy="horiz-trans-max-slider"
                format={{ type: 'percent' }}
                label={{
                  text: 'Max:',
                  variant: 'body1',
                  color: 'text.primary',
                  appendValue: true
                }}
              />
            </Grid>
          </Grid>
        </Collapse>
      </Grid>
    </Grid>
  )
}

export default withStyles(styles)(MoveCard as any)
