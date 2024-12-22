import * as React from 'react'
import { Chip } from '@mui/material'
import { useGetTagQuery } from '../../store/api/slice'

const getSimpleTag = (tagName?: string) => {
  return tagName?.replace(/[a-z]/g, '').replace(/\s/g, '')
}

export interface TagChipProps {
  tagID: number
  className?: string
  simpleTag?: boolean
  outlined?: boolean
}

export default function TagChip(props: TagChipProps) {
  const { data: tag } = useGetTagQuery(props.tagID)

  return (
    <Chip
      className={props.className}
      label={props.simpleTag ? getSimpleTag(tag?.name) : tag?.name}
      color="primary"
      size="small"
      variant={props.outlined ? 'outlined' : undefined}
    />
  )
}
