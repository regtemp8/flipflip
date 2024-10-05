export function convertFromEpoch(backupFile: string) {
  const epochString = backupFile.substring(backupFile.lastIndexOf('.') + 1)
  const date = new Date(Number.parseInt(epochString))
  return date.toLocaleString()
}
