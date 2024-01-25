import React, { type ChangeEvent, type MouseEvent, useState } from 'react'

import {
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Theme
} from '@mui/material'

import { makeStyles } from 'tss-react/mui'

import { GT } from 'flipflip-common'
import flipflip from '../../FlipFlipService'

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    display: 'flex'
  },
  rootInput: {
    marginLeft: theme.spacing(2),
    flexGrow: 1
  }
}))

export interface GooninatorDialogProps {
  open: boolean
  onClose: () => void
  onImportURL: (type: string, e?: MouseEvent, ...args: any[]) => void
}

function GooninatorDialog(props: GooninatorDialogProps) {
  const [importType, setImportType] = useState(GT.tumblr)
  const [importURL, setImportURL] = useState('')
  const [rootDir, setRootDir] = useState('')

  const onTypeChange = (e: SelectChangeEvent<string>) => {
    setImportType(e.target.value)
  }

  const onURLChange = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setImportURL(e.target.value)
  }

  const onRootChange = async () => {
    let result = await flipflip().api.openDirectory()
    if (!result || !result.length) return
    setRootDir(result[0])
  }

  const onImportURL = () => {
    props.onImportURL(importType, undefined, importURL, rootDir)
    props.onClose()
  }

  const { classes } = useStyles()
  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      aria-labelledby="url-import-title"
      aria-describedby="url-import-description"
    >
      <DialogTitle id="url-import-title">Import URL</DialogTitle>
      <DialogContent>
        <DialogContentText id="remove-all-description">
          Paste a gooninator URL and choose how to import the sources:
        </DialogContentText>
        <TextField
          variant="standard"
          label="Gooninator URL"
          fullWidth
          placeholder="Paste URL Here"
          margin="dense"
          value={importURL}
          onChange={onURLChange}
        />
        <div className={classes.root}>
          <FormControl variant="standard">
            <InputLabel>Import as</InputLabel>
            <Select
              variant="standard"
              value={importType}
              onChange={onTypeChange}
            >
              <MenuItem value={GT.tumblr}>Tumblr Blogs</MenuItem>
              <MenuItem value={GT.local}>Local Directories</MenuItem>
            </Select>
          </FormControl>
          <Collapse className={classes.rootInput} in={importType === GT.local}>
            <TextField
              variant="standard"
              fullWidth
              label="Parent Directory"
              value={rootDir}
              InputProps={{ readOnly: true }}
              onClick={onRootChange}
            />
          </Collapse>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose} color="secondary">
          Cancel
        </Button>
        <Button
          disabled={
            !importURL.match('^https?://') ||
            (importType === GT.local && rootDir.length === 0)
          }
          onClick={onImportURL}
          color="primary"
        >
          Import
        </Button>
      </DialogActions>
    </Dialog>
  )
}

;(GooninatorDialog as any).displayName = 'GooninatorDialog'
export default GooninatorDialog
