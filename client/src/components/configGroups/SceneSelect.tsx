import Select, { SingleValue } from 'react-select'

import { type Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

import { grey } from '@mui/material/colors'

import { useAppSelector } from '../../store/hooks'
import { selectSceneSelectOptions } from '../../store/scene/selectors'

const useStyles = makeStyles()((theme: Theme) => ({
  searchSelect: {
    minWidth: 200,
    maxWidth: `calc(100% - ${theme.spacing(7)})`,
    maxHeight: theme.mixins.toolbar.minHeight,
    color: grey[900]
  },
  select: {
    color: grey[900]
  }
}))

export interface SceneSelectProps {
  value: number
  menuIsOpen?: boolean
  autoFocus?: boolean
  includeGrids?: boolean
  includeExtra?: boolean
  onlyExtra?: boolean
  onChange: (sceneID: number) => void
}

function SceneSelect(props: SceneSelectProps) {
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

  const onChange = (e: SingleValue<{ label: string; value: string }>) => {
    if (e != null) {
      props.onChange(Number(e.value))
    }
  }

  const { classes } = useStyles()
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
      onChange={onChange}
    />
  )
}

;(SceneSelect as any).displayName = 'SceneSelect'
export default SceneSelect
