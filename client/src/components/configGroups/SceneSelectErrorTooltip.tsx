import { Tooltip, type Theme } from '@mui/material'
import { cx } from '@emotion/css'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import { makeStyles } from 'tss-react/mui'
import { SceneSelectOption } from 'flipflip-common'

const useStyles = makeStyles()((theme: Theme) => ({
  errorIcon: {
    cursor: 'pointer',
    marginLeft: theme.spacing(0.5)
  }
}))

export interface SceneSelectErrorTooltipProps {
  option?: SceneSelectOption
}

function SceneSelectErrorTooltip({ option }: SceneSelectErrorTooltipProps) {
  const { classes } = useStyles()
  return (
    option != null &&
    (!option.hasSources || !option.hasValidWeights) && (
      <Tooltip
        disableInteractive
        title={
          !option.hasSources
            ? 'Scene has no sources'
            : 'Scene weights are invalid'
        }
      >
        <ErrorOutlineIcon
          color={'error'}
          className={cx(classes.errorIcon, classes.errorIcon)}
        />
      </Tooltip>
    )
  )
}

;(SceneSelectErrorTooltip as any).displayName = 'SceneSelectErrorTooltip'
export default SceneSelectErrorTooltip
