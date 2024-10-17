export function convertFromEpoch(backupFile: string) {
  const epochString = backupFile.substring(backupFile.lastIndexOf('.') + 1)
  const date = new Date(Number.parseInt(epochString))
  return date.toLocaleString()
}

export function getTimestamp(secs: number): string {
  const hours = Math.floor(secs / 3600)
  const minutes = Math.floor((secs % 3600) / 60)
  const seconds = Math.floor((secs % 3600) % 60)
  if (hours > 0) {
    return (
      hours +
      ':' +
      (minutes >= 10 ? minutes : '0' + minutes) +
      ':' +
      (seconds >= 10 ? seconds : '0' + seconds)
    )
  } else {
    return minutes + ':' + (seconds >= 10 ? seconds : '0' + seconds)
  }
}
