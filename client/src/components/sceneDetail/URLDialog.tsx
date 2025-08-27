import { type ChangeEvent, type MouseEvent, useState } from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField
} from '@mui/material'

import { AF } from 'flipflip-common'

export interface URLDialogProps {
  open: boolean
  onClose: () => void
  onImportURL: (type: string, e?: MouseEvent, urls?: string[]) => void
}

function URLDialog(props: URLDialogProps) {
  const [importURLs, setImportURLs] = useState('')

  const onURLChange = (e: ChangeEvent<HTMLInputElement>) => {
    setImportURLs(e.target.value)
  }

  const onImportURL = () => {
    const urls = importURLs.split('\n').map((url) => url.trim()).filter((url) => url.length > 0)
    props.onImportURL(AF.list, undefined, urls)
    setImportURLs('')
    props.onClose()
  }

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      maxWidth='md'
      fullWidth
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
          rows={10}
          onChange={onURLChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={onImportURL} color="primary">
          Add Sources
        </Button>
      </DialogActions>
    </Dialog>
  )
}

;(URLDialog as any).displayName = 'URLDialog'
export default URLDialog
