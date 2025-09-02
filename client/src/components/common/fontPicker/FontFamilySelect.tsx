import {
  ReactNode,
  HTMLAttributes,
  forwardRef,
  createContext,
  useContext,
  useRef,
  useEffect,
  useMemo
} from 'react'
import TextField from '@mui/material/TextField'
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete'
import useMediaQuery from '@mui/material/useMediaQuery'
import Popper from '@mui/material/Popper'
import { useTheme, styled } from '@mui/material/styles'
import { VariableSizeList, ListChildComponentProps } from 'react-window'
import type ReduxProps from '../ReduxProps'
import fontInfo from './fontInfo.json'
import './font-previews.css'
import { ListItemButton } from '@mui/material'
import { useAppDispatch } from '../../../store/hooks'

const LISTBOX_PADDING = 8 // px
function renderRow(props: ListChildComponentProps) {
  const { data, index, style } = props
  const dataSet = data[index]
  const inlineStyle = {
    ...style,
    top: (style.top as number) + LISTBOX_PADDING
  }

  const { key, ...optionProps } = dataSet[0]
  return (
    <ListItemButton
      key={key}
      component="li"
      {...optionProps}
      noWrap
      style={inlineStyle}
      className={`font-preview-${dataSet[1].sane}`}
      selected={dataSet[1].selected}
    />
  )
}

const OuterElementContext = createContext({})

const OuterElementType = forwardRef<HTMLDivElement>((props, ref) => {
  const outerProps = useContext(OuterElementContext)
  return <div ref={ref} {...props} {...outerProps} />
})

function useResetCache(data: any) {
  const ref = useRef<VariableSizeList>(null)
  useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true)
    }
  }, [data])
  return ref
}

// Adapter for react-window
const ListboxComponent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLElement>
>(function ListboxComponent(props, ref) {
  const { children, ...other } = props
  const itemData: ReactNode[] = []
  ;(children as ReactNode[]).forEach((item) => {
    itemData.push(item)
  })

  const theme = useTheme()
  const smUp = useMediaQuery(theme.breakpoints.up('sm'))
  const itemCount = itemData.length
  const itemSize = smUp ? 36 : 48

  const getChildSize = (_child: ReactNode) => itemSize

  const getHeight = () => {
    if (itemCount > 8) {
      return 8 * itemSize
    }
    return itemData.map(getChildSize).reduce((a, b) => a + b, 0)
  }

  const gridRef = useResetCache(itemCount)

  let offset = 0
  const selectedIndex = itemData.findIndex(
    (data) => (data as any[])[1].selected
  )
  if (selectedIndex != -1) {
    for (let i = 0; i < selectedIndex; i++) {
      offset += getChildSize(itemData[i])
    }
  }

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          itemData={itemData}
          height={getHeight() + 2 * LISTBOX_PADDING}
          width="100%"
          ref={gridRef}
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={(index) => getChildSize(itemData[index])}
          overscanCount={5}
          itemCount={itemCount}
          initialScrollOffset={offset}
        >
          {renderRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </div>
  )
})

const StyledPopper = styled(Popper)({
  [`& .${autocompleteClasses.listbox}`]: {
    boxSizing: 'border-box',
    '& ul': {
      padding: 0,
      margin: 0
    }
  }
})

export interface FontFamilySelectProps extends ReduxProps<string> {
  id: string
  label: string
}

const DEFAULT_VALUE = { name: '', category: '', sane: '', variants: [] }
export default function FontFamilySelect(props: FontFamilySelectProps) {
  const dispatch = useAppDispatch()
  const { data: fontFamily } = props.selector()

  const value = useMemo(() => {
    return fontInfo.find((info) => info.name === fontFamily) ?? DEFAULT_VALUE
  }, [fontInfo, fontFamily])

  return (
    <Autocomplete
      id={props.id}
      disableListWrap
      options={fontInfo}
      value={value}
      onChange={(_, value) => {
        dispatch(props.action(value?.name ?? ''))
      }}
      renderInput={(params) => (
        <TextField {...params} label={props.label} variant="standard" />
      )}
      renderOption={(props, option, state) =>
        [
          props,
          { ...option, selected: option.name === fontFamily },
          state.index
        ] as ReactNode
      }
      getOptionLabel={(option) => option.name}
      slots={{
        popper: StyledPopper,
        listbox: ListboxComponent
      }}
    />
  )
}
