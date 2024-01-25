/// <reference path="./global.d.ts" />
import { MouseEvent, useState, useRef } from 'react'
import { Tooltip, IconButton, CircularProgress } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

export interface CopyButtonProps {
  value: string
}

export function CopyButton(props: CopyButtonProps) {
  const tooltipClickToCopy = 'Click to copy'
  const tooltipCopied = 'Copied!'

  const [loading, setLoading] = useState(false)
  const [tooltipTitle, setTooltipTitle] = useState(tooltipClickToCopy)
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)

  const _tooltipTimeout = useRef<number>()

  const copyToClipboard = async (text: string) => {
    if (window.flipflip == null) {
      return
    }

    setLoading(true)
    const link = await window.flipflip.ipc.getMagicLink(text)
    window.navigator.clipboard.writeText(link)
    setCopiedToClipboard(true)
    setLoading(false)
    setTooltipTitle(tooltipCopied)
    setTooltipOpen(true)
    delayedTooltipAction(() => {
      setTooltipOpen(false)
      setCopiedToClipboard(false)
      window.setTimeout(() => setTooltipTitle(tooltipClickToCopy), 100)
    }, 1000)
  }

  const toggleTooltipOpen = (open: boolean) => {
    if (copiedToClipboard === false) {
      delayedTooltipAction(() => {
        setTooltipOpen(open)
        if (open === true) {
          delayedTooltipAction(() => setTooltipOpen(false), 2000)
        }
      }, 500)
    }
  }

  const delayedTooltipAction = (action: () => void, delay: number) => {
    if (_tooltipTimeout.current != null) {
      window.clearTimeout(_tooltipTimeout.current)
    }
    _tooltipTimeout.current = window.setTimeout(action, delay)
  }

  return (
    <Tooltip
      title={tooltipTitle}
      open={tooltipOpen}
      onMouseEnter={(e: MouseEvent<HTMLDivElement>) => toggleTooltipOpen(true)}
      onMouseLeave={(e: MouseEvent<HTMLDivElement>) => toggleTooltipOpen(false)}
    >
      <IconButton
        disabled={loading}
        onClick={() => copyToClipboard(props.value)}
      >
        {loading ? <CircularProgress size={16} /> : <ContentCopyIcon />}
      </IconButton>
    </Tooltip>
  )
}
