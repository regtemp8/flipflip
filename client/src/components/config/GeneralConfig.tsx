import { Card, CardContent, Grid2 } from '@mui/material'
import Masonry from '@mui/lab/Masonry/Masonry'

import PlayerBoolCard from '../configGroups/PlayerBoolCard'
import PlayerBoolCard2 from '../configGroups/PlayerBoolCard2'
import PlayerNumCard from '../configGroups/PlayerNumCard'
import CacheCard from '../configGroups/CacheCard'
import BackupCard from '../configGroups/BackupCard'
import APICard from '../configGroups/APICard'
import ThemeCard from '../configGroups/ThemeCard'
import WatermarkCard from '../configGroups/WatermarkCard'

export default function GeneralConfig() {
  return (
    <Grid2 container spacing={2}>
      <Grid2 size={12}>
        <Masonry columns={[1, 2, 3, 4]} spacing={2} defaultSpacing={2}>
          <Card>
            <CardContent>
              <PlayerBoolCard />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <PlayerBoolCard2 />
            </CardContent>
          </Card>
          <Card style={{ overflow: 'visible' }}>
            <CardContent>
              <PlayerNumCard />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <CacheCard />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <APICard />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <WatermarkCard />
            </CardContent>
          </Card>
        </Masonry>
      </Grid2>
      <Grid2 size={{ xs: 12, sm: 'auto' }}>
        <Card>
          <CardContent>
            <BackupCard />
          </CardContent>
        </Card>
      </Grid2>
      <Grid2 size={{ xs: 12, sm: 'auto' }}>
        <Card>
          <CardContent>
            <ThemeCard />
          </CardContent>
        </Card>
      </Grid2>
    </Grid2>
  )
}

;(GeneralConfig as any).displayName = 'GeneralConfig'
