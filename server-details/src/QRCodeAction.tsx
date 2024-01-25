/// <reference path="./global.d.ts" />
import { MouseEvent, useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  Paper,
  CircularProgress,
  Tooltip
} from '@mui/material'
import QrCode2Icon from '@mui/icons-material/QrCode2'
import CloseIcon from '@mui/icons-material/Close'
import { QRCodeSVG } from 'qrcode.react'
import { CenteredBox } from './CenteredBox'

export interface QRCodeActionProps {
  url: string
}

export function QRCodeAction(props: QRCodeActionProps) {
  const [magicLink, setMagicLink] = useState<string>()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [tooltipOpen, setTooltipOpen] = useState(false)

  const _tooltipTimeout = useRef<number>()

  const clearTooltipTimeout = () => {
    if (_tooltipTimeout.current != null) {
      window.clearTimeout(_tooltipTimeout.current)
      _tooltipTimeout.current = undefined
    }
  }

  const delayedTooltipAction = (action: () => void, delay: number) => {
    clearTooltipTimeout()
    _tooltipTimeout.current = window.setTimeout(action, delay)
  }

  const toggleTooltipOpen = (open: boolean) => {
    delayedTooltipAction(() => {
      setTooltipOpen(open)
      if (open === true) {
        delayedTooltipAction(() => setTooltipOpen(false), 2000)
      }
    }, 500)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setMagicLink(undefined)
  }

  const openDialog = () => {
    if (window.flipflip != null) {
      window.flipflip.ipc
        .getMagicLink(props.url)
        .then((link: string) => setMagicLink(link))
    }

    clearTooltipTimeout()
    setTooltipOpen(false)
    setDialogOpen(true)
  }

  return (
    <>
      <Tooltip
        title="Show QR code"
        open={tooltipOpen}
        onMouseEnter={(e: MouseEvent<HTMLDivElement>) =>
          toggleTooltipOpen(true)
        }
        onMouseLeave={(e: MouseEvent<HTMLDivElement>) =>
          toggleTooltipOpen(false)
        }
      >
        <IconButton onClick={openDialog}>
          <QrCode2Icon />
        </IconButton>
      </Tooltip>
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm">
        <DialogContent>
          <CenteredBox>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{ textTransform: 'uppercase' }}
            >
              Scan Me
            </Typography>
            <IconButton
              aria-label="close"
              onClick={closeDialog}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8
              }}
            >
              <CloseIcon />
            </IconButton>
            <Paper elevation={0} sx={{ p: 2, backgroundColor: 'white' }}>
              {magicLink != null ? (
                <QRCodeSVG value={magicLink} size={256} />
              ) : (
                <CircularProgress />
              )}
            </Paper>
            <Typography variant="h6">Scan to open FlipFlip.</Typography>
          </CenteredBox>
        </DialogContent>
      </Dialog>
    </>
  )
}
