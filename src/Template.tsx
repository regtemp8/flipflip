import * as React from 'react'

import { type Theme } from '@mui/material'

import createStyles from '@mui/styles/createStyles'
import withStyles, { type WithStyles } from '@mui/styles/withStyles'

const styles = (theme: Theme) =>
  createStyles({
    fullWidth: {
      width: '100%'
    },
    marginTop: {
      marginTop: '20px'
    }
  })

interface TemplateProps extends WithStyles<typeof styles> {}

function Template (props: TemplateProps): JSX.Element {
  const classes = props.classes

  return <div className={classes.fullWidth} />
}

;(Template as any).displayName = 'Template'
export default withStyles(styles)(Template as any)
