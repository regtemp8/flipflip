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

export function getMsRemainder(sec: number): string | undefined {
  if (isNaN(sec) || sec < 0) {
    return undefined
  }

  const ms = Math.round(sec * 1000)
  let remainder = (Math.floor((ms % 1000) * 1000) / 1000).toString()
  while (remainder.length < 3) {
    remainder = '0' + remainder
  }
  return '.' + remainder
}

export async function extractMusicMetadata(
  audio: Audio,
  metadata: Audio
): Promise<Audio> {
  const newAudio: Audio = {
    ...metadata,
    ...audio
  }

  if (!newAudio.duration) {
    const arrayBuffer = await flipflip().api.readBinaryFile(audio.url as string)
    const context = new AudioContext()
    const audioBuffer = await context.decodeAudioData(arrayBuffer)
    newAudio.duration = audioBuffer.duration
  }

  return newAudio
}
