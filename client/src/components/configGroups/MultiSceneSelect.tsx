import Select, { MultiValue, components } from 'react-select'

import { Checkbox, type Theme } from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'
import { grey } from '@mui/material/colors'

import { useAppSelector } from '../../store/hooks'
import { selectMultiSceneSelectOptions } from '../../store/scene/selectors'

const styles = (theme: Theme) =>
  createStyles({
    select: {
      color: grey[900]
    }
  })

const Option = withStyles(styles)((props: any) => (
  <div>
    <components.Option {...props}>
      <Checkbox
        className={props.classes.select}
        checked={props.isSelected}
        onChange={() => null}
      />{' '}
      <label>{props.label}</label>
    </components.Option>
  </div>
))

const MultiValueComponent = (props: any) => (
  <components.MultiValue {...props}>
    <span>{props.data.label}</span>
  </components.MultiValue>
)

interface MultiSceneSelectProps extends WithStyles<typeof styles> {
  values?: number[]
  onChange: (sceneIDs: number[]) => void
}

function MultiSceneSelect(props: MultiSceneSelectProps) {
  const options = useAppSelector(selectMultiSceneSelectOptions())
  const optionsList = Object.keys(options).map((key) => {
    return { value: key, label: options[key] }
  })

  const onChange = (e: MultiValue<{ label: any; value: any }>) => {
    props.onChange(e.map((v) => Number(v.value)))
  }

  const toValue = (id: number) => {
    const value = id.toString()
    return { value, label: options[value] }
  }

  return (
    <Select
      className={props.classes.select}
      value={props.values ? props.values.map(toValue) : []}
      options={optionsList}
      components={{ Option, MultiValue: MultiValueComponent }}
      isClearable
      isMulti
      hideSelectedOptions={false}
      closeMenuOnSelect={false}
      backspaceRemovesValue={false}
      placeholder={'Search scenes ...'}
      onChange={onChange}
    />
  )
}

;(MultiSceneSelect as any).displayName = 'MultiSceneSelect'
export default withStyles(styles)(MultiSceneSelect as any)
