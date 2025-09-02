import { Card, CardContent, Grid2 } from '@mui/material'

import AudioCard from '../configGroups/AudioCard'
import TextCard from '../configGroups/TextCard'

export interface AudioTextEffectsProps {
  sceneID: number
}

export default function AudioTextEffects(props: AudioTextEffectsProps) {
  return (
    <Grid2 container spacing={2}>
      <Grid2 size={{ xs: 12, lg: 6 }}>
        <Card>
          <CardContent>
            <AudioCard sceneID={props.sceneID} startPlaying={false} />
          </CardContent>
        </Card>
      </Grid2>
      <Grid2 size={{ xs: 12, lg: 6 }}>
        <Card>
          <CardContent>
            <TextCard sceneID={props.sceneID} />
          </CardContent>
        </Card>
      </Grid2>
    </Grid2>
  )
}

;(AudioTextEffects as any).displayName = 'AudioTextEffects'
