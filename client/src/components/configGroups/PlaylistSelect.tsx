import Select, { SingleValue } from 'react-select'

import { type Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

import { grey } from '@mui/material/colors'

import { useAppSelector } from '../../store/hooks'
import { selectAppPlaylistOptions } from '../../store/playlist/selectors'

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

interface PlaylistSelectProps {
  menuIsOpen?: boolean
  autoFocus?: boolean
  onChange: (sceneID: number) => void
}

function PlaylistSelect(props: PlaylistSelectProps) {
  const playlists = useAppSelector(selectAppPlaylistOptions())
  const onChange = (e: SingleValue<{ label: any; value: any }>) => {
    props.onChange(e?.value)
  }

  const { classes } = useStyles()
  playlists['-1'] = '+ New Playlist'
  const options = Object.keys(playlists).map((key) => {
    return { label: playlists[key], value: key }
  })

  return (
    <Select
      className={classes.select}
      options={options}
      backspaceRemovesValue={false}
      menuIsOpen={props.menuIsOpen}
      autoFocus={props.autoFocus}
      onChange={onChange}
    />
  )
}

;(PlaylistSelect as any).displayName = 'PlaylistSelect'
export default PlaylistSelect
