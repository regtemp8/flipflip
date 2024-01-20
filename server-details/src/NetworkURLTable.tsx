import {
  Typography,
  Table,
  TableContainer,
  TableBody,
  Paper
} from '@mui/material'
import { NetworkURLRow } from './NetworkURLRow'

export interface NetworkURLTableProps {
  networkURLs: Array<{ name: string; url: string }>
}

export function NetworkURLTable(props: NetworkURLTableProps) {
  return (
    <>
      <Typography variant="h6" component="div" marginTop={3} marginBottom={2}>
        You can now view FlipFlip in the browser.
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            {props.networkURLs.map(({ name, url }, index) => (
              <NetworkURLRow key={index} name={name} url={url} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}
