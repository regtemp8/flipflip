import { cx } from '@emotion/css'
import { Grid2, Collapse, MenuItem, type Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import type ReduxProps from './ReduxProps'
import BaseSlider from './slider/BaseSlider'
import BaseSelect from './BaseSelect'
import BaseSwitch from './BaseSwitch'

const useStyles = makeStyles()((theme: Theme) => ({
  fullWidth: {
    width: '100%'
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
}))

export interface MoveCardProps {
  sidebar: boolean
  enabled: boolean
  values: Record<string, string>
  valueMapper: (value: string) => string
  label: string
  type: ReduxProps<string>
  random: ReduxProps<boolean>
  imageWidth?: ReduxProps<boolean>
  imageHeight?: ReduxProps<boolean>
  level: ReduxProps<number>
  levelMin: ReduxProps<number>
  levelMax: ReduxProps<number>
}

function MoveCard(props: MoveCardProps) {
  const { data: type } = props.type.selector()
  const { data: random } = props.random.selector()
  const { data: imageWidth } = props.imageWidth?.selector() ?? { data: false }
  const { data: imageHeight } = props.imageHeight?.selector() ?? { data: false }

  const { classes } = useStyles()
  return (
    <Grid2
      container
      spacing={props.enabled && type !== props.values.none ? 2 : 0}
      alignItems="center"
    >
      <Grid2
        size={{
          xs: 12,
          sm: !props.sidebar && type !== props.values.none ? 5 : 12
        }}
      >
        <Collapse in={props.enabled} className={classes.fullWidth}>
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
      </Grid2>
      <Grid2
        size={{
          xs: 12,
          sm: !props.sidebar && type !== props.values.none ? 7 : 12
        }}
        className={cx(
          (!props.enabled || type === props.values.none) && classes.noPadding
        )}
      >
        <Collapse
          in={
            props.enabled &&
            imageWidth === false &&
            imageHeight === false &&
            type !== props.values.none
          }
          className={classes.fullWidth}
        >
          <BaseSwitch
            label="Randomize"
            size="small"
            selector={props.random.selector}
            action={props.random.action}
          />
        </Collapse>
        {props.imageWidth != null ? (
          <Collapse
            in={props.enabled && type !== props.values.none}
            className={classes.fullWidth}
          >
            <BaseSwitch
              label="Use Img Width"
              size="small"
              selector={props.imageWidth.selector}
              action={props.imageWidth.action}
            />
          </Collapse>
        ) : null}
        {props.imageHeight != null ? (
          <Collapse
            in={props.enabled && type !== props.values.none}
            className={classes.fullWidth}
          >
            <BaseSwitch
              label="Use Img Height"
              size="small"
              selector={props.imageHeight.selector}
              action={props.imageHeight.action}
            />
          </Collapse>
        ) : null}
      </Grid2>
      <Grid2
        size={12}
        className={cx(
          (!props.enabled || type === props.values.none) && classes.noPadding
        )}
      >
        <Collapse
          in={
            props.enabled &&
            imageWidth === false &&
            imageHeight === false &&
            type !== props.values.none &&
            random === false
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
            props.enabled &&
            imageWidth === false &&
            imageHeight === false &&
            type !== props.values.none &&
            random === true
          }
          className={classes.fullWidth}
        >
          <Grid2 container spacing={2} alignItems="center">
            <Grid2 size={{ xs: 12, sm: props.sidebar ? 12 : 6 }}>
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
            </Grid2>
            <Grid2 size={{ xs: 12, sm: props.sidebar ? 12 : 6 }}>
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
            </Grid2>
          </Grid2>
        </Collapse>
      </Grid2>
    </Grid2>
  )
}

export default MoveCard
