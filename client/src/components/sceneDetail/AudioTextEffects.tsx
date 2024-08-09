import { Card, CardContent, Grid } from '@mui/material'

import AudioCard from '../configGroups/AudioCard'
import TextCard from '../configGroups/TextCard'

export interface AudioTextEffectsProps {
  sceneID: number
}

export default function AudioTextEffects(props: AudioTextEffectsProps) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} lg={6}>
        <Card>
          <CardContent>
            <AudioCard sceneID={props.sceneID} startPlaying={false} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <TextCard sceneID={props.sceneID} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

;(AudioTextEffects as any).displayName = 'AudioTextEffects'
