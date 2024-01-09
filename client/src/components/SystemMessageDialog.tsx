import React from 'react'
import { Dialog, DialogContent, DialogContentText } from '@mui/material'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectAppSystemMessage } from '../store/app/selectors'
import { closeMessage } from '../store/app/slice'

export default function SystemMessageDialog() {
  const dispatch = useAppDispatch()
  const systemMessage = useAppSelector(selectAppSystemMessage())

  return (
    <Dialog
      open={!!systemMessage}
      onClose={() => dispatch(closeMessage())}
      aria-describedby="message-description"
    >
      <DialogContent>
        <DialogContentText id="message-description">
          {systemMessage}
        </DialogContentText>
      </DialogContent>
    </Dialog>
  )
}
