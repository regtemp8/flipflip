import { Card, CardContent, Grid } from '@mui/material'
import Masonry from '@mui/lab/Masonry/Masonry'

import PlayerBoolCard from '../configGroups/PlayerBoolCard'
import PlayerBoolCard2 from '../configGroups/PlayerBoolCard2'
import PlayerNumCard from '../configGroups/PlayerNumCard'
import CacheCard from '../configGroups/CacheCard'
import BackupCard from '../configGroups/BackupCard'
import APICard from '../configGroups/APICard'
import ThemeCard from '../configGroups/ThemeCard'
import WatermarkCard from '../configGroups/WatermarkCard'
import { useAppSelector } from '../../store/hooks'
import { selectConstants } from '../../store/constants/selectors'

export default function GeneralConfig() {
  const { masonryDefaultHeight, masonryDefaultColumns } =
    useAppSelector(selectConstants())

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Masonry
          columns={[1, 2, 3, 4]}
          spacing={2}
          defaultSpacing={2}
          defaultColumns={masonryDefaultColumns}
          defaultHeight={masonryDefaultHeight}
        >
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
      </Grid>
      <Grid item xs={12} sm={'auto'}>
        <Card>
          <CardContent>
            <BackupCard />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={'auto'}>
        <Card>
          <CardContent>
            <ThemeCard />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

;(GeneralConfig as any).displayName = 'GeneralConfig'
