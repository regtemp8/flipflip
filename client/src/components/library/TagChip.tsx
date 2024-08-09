import * as React from 'react'
import { useAppSelector } from '../../store/hooks'
import { selectTagName } from '../../store/tag/selectors'
import { Chip } from '@mui/material'

export interface TagChipProps {
  tagID: number
  className?: string
  simpleTag?: boolean
  outlined?: boolean
}

export default function TagChip(props: TagChipProps) {
  const tagName = useAppSelector(selectTagName(props.tagID))

  const getSimpleTag = (tagName?: string) => {
    return tagName?.replace(/[a-z]/g, '').replace(/\s/g, '')
  }

  return (
    <Chip
      className={props.className}
      label={props.simpleTag ? getSimpleTag(tagName) : tagName}
      color="primary"
      size="small"
      variant={props.outlined ? 'outlined' : undefined}
    />
  )
}
