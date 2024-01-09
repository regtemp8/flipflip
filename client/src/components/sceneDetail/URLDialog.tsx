import React, { type ChangeEvent, useState } from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  type Theme
} from '@mui/material'

import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'

import { AF } from 'flipflip-common'

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: 'flex'
    },
    rootInput: {
      marginLeft: theme.spacing(2),
      flexGrow: 1
    },
    urlInput: {
      minWidth: 550,
      minHeight: 300,
      whiteSpace: 'nowrap',
      overflowX: 'hidden',
      overflowY: 'auto !important' as any
    }
  })

export interface URLDialogProps extends WithStyles<typeof styles> {
  open: boolean
  onClose: () => void
  onImportURL: (type: string, e?: MouseEvent, ...args: any[]) => void
}

function URLDialog(props: URLDialogProps) {
  const [importURLs, setImportURLs] = useState('')

  const onURLChange = (e: ChangeEvent<HTMLInputElement>) => {
    setImportURLs(e.target.value)
  }

  const onImportURL = () => {
    props.onImportURL(AF.list, undefined, importURLs);
    setImportURLs('')
    props.onClose()
  }

  const classes = props.classes
  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      aria-labelledby="url-import-title"
      aria-describedby="url-import-description"
    >
      <DialogTitle id="url-import-title">Add Multiple URL Sources</DialogTitle>
      <DialogContent>
        <DialogContentText id="remove-all-description">
          Paste URLs to add as sources, one per line:
        </DialogContentText>
        <TextField
          variant="standard"
          label="Source URLs"
          fullWidth
          multiline
          margin="dense"
          value={importURLs}
          inputProps={{className: classes.urlInput}}
          onChange={onURLChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={onImportURL}
          color="primary"
        >
          Add Sources
        </Button>
      </DialogActions>
    </Dialog>
  )
}

;(URLDialog as any).displayName = 'URLDialog'
export default withStyles(styles)(URLDialog as any)
