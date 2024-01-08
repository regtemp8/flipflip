import Select from 'react-select'

import { type Theme } from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'
import { grey } from '@mui/material/colors'

import { useAppSelector } from '../../../store/hooks'
import { selectAppPlaylistOptions } from '../../../store/playlist/selectors'

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

interface PlaylistSelectProps extends WithStyles<typeof styles> {
  menuIsOpen?: boolean
  autoFocus?: boolean
  onChange: (sceneID: number) => void
}

function PlaylistSelect(props: PlaylistSelectProps) {
  const playlists = useAppSelector(selectAppPlaylistOptions())
  const onChange = (e: { label: any; value: any }) => {
    this.props.onChange(e.value)
  }

  const classes = props.classes
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
      onChange={onChange.bind(this)}
    />
  )
}

;(PlaylistSelect as any).displayName = 'PlaylistSelect'
export default withStyles(styles)(PlaylistSelect as any)
