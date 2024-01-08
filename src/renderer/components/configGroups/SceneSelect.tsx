import Select from 'react-select'

import { type Theme } from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'
import { grey } from '@mui/material/colors'

import { useAppSelector } from '../../../store/hooks'
import { selectSceneSelectOptions } from '../../../store/scene/selectors'

const styles = (theme: Theme) =>
  createStyles({
    searchSelect: {
      minWidth: 200,
      maxWidth: `calc(100% - ${theme.spacing(7)})`,
      maxHeight: theme.mixins.toolbar.minHeight,
      color: grey[900]
    },
    select: {
      color: grey[900]
    }
  })

export interface SceneSelectProps extends WithStyles<typeof styles> {
  value: number
  menuIsOpen?: boolean
  autoFocus?: boolean
  includeGrids?: boolean
  includeExtra?: boolean
  onlyExtra?: boolean
  onChange: (sceneID: number) => void
}

function SceneSelect (props: SceneSelectProps) {
  const options = useAppSelector(
    selectSceneSelectOptions(
      props.onlyExtra,
      props.includeExtra,
      props.includeGrids
    )
  )
  const optionsList = Object.keys(options).map((key) => {
    return { value: key, label: options[key] }
  })

  const onChange = (e: { label: string, value: string }) => {
    props.onChange(Number(e.value))
  }

  const classes = props.classes
  return (
    <Select
      className={classes.select}
      value={{
        label: options[props.value.toString()],
        value: props.value.toString()
      }}
      options={optionsList}
      backspaceRemovesValue={false}
      menuIsOpen={props.menuIsOpen}
      autoFocus={props.autoFocus}
      onChange={onChange.bind(this)}
    />
  )
}

;(SceneSelect as any).displayName = 'SceneSelect'
export default withStyles(styles)(SceneSelect as any)
