import Select, { MultiValue, components } from 'react-select'

import { Checkbox, type Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

import { grey } from '@mui/material/colors'

import { useAppSelector } from '../../store/hooks'
import { selectMultiSceneSelectOptions } from '../../store/scene/selectors'

const useStyles = makeStyles()((theme: Theme) => ({
    select: {
      color: grey[900]
    }
  }))

const Option = (props: any) => {
  const {classes} = useStyles()
  return (
    <div>
      <components.Option {...props}>
        <Checkbox
          className={classes.select}
          checked={props.isSelected}
          onChange={() => null}
        />{' '}
        <label>{props.label}</label>
      </components.Option>
    </div>
  )
}

const MultiValueComponent = (props: any) => (
  <components.MultiValue {...props}>
    <span>{props.data.label}</span>
  </components.MultiValue>
)

interface MultiSceneSelectProps {
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

  const { classes } = useStyles()
  return (
    <Select
      className={classes.select}
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
export default MultiSceneSelect
