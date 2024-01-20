import {
  ButtonGroup,
  TableRow,
  TableCell,
  Link,
  Box,
  Tooltip
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { CopyButton } from './CopyButton'
import { QRCodeAction } from './QRCodeAction'

export interface NetworkURLRowProps {
  name: string
  url: string
}

export function NetworkURLRow(props: NetworkURLRowProps) {
  const isLocalhost = (url: string) => {
    const { hostname } = new URL(url)
    return hostname === '127.0.0.1' || hostname === 'localhost'
  }

  const theme = useTheme()
  return (
    <TableRow>
      <TableCell sx={{ pl: 1, py: 1, pr: 0 }}>
        <Tooltip
          title={props.name}
          placement="bottom-start"
          slotProps={{
            popper: {
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    // theme.spacing returns string, e.g. '16px'
                    offset: [0, Number(theme.spacing(-1.5).slice(0, -2))]
                  }
                }
              ]
            }
          }}
        >
          <Box
            component="div"
            sx={{
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              maxWidth: '200px'
            }}
          >
            {props.name}
          </Box>
        </Tooltip>
      </TableCell>
      <TableCell sx={{ pl: 1, py: 1, pr: 0 }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => {
            window.flipflip?.ipc.openExternal(props.url)
          }}
        >
          {props.url}
        </Link>
      </TableCell>
      <TableCell sx={{ p: 1 }} align="right">
        <ButtonGroup variant="outlined">
          {!isLocalhost(props.url) ? <QRCodeAction url={props.url} /> : null}
          <CopyButton value={props.url} />
        </ButtonGroup>
      </TableCell>
    </TableRow>
  )
}
