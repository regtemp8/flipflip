import * as fs from 'fs'
import * as path from 'path'
import moment from 'moment'

import { type Config } from 'flipflip-common'
import { getSaveDir } from '../MainUtils'

export function getBackups (): Array<{ url: string, size: number }> {
  const saveDir = getSaveDir()
  const files = fs.readdirSync(saveDir)
  const backups = Array<any>()
  for (const file of files) {
    if (file.startsWith('data.json.') && file !== 'data.json.new') {
      const stats = fs.statSync(saveDir + '/' + file)
      backups.push({ url: file, size: stats.size })
    }
  }
  backups.sort((a, b) => {
    const aFile = a.url
    const bFile = b.url
    if (aFile > bFile) {
      return -1
    } else if (aFile < bFile) {
      return 1
    } else {
      return 0
    }
  })
  return backups
}

export function cleanBackups (config: Config): void {
  const saveDir = getSaveDir()
  let backups = getBackups()
  if (backups.length <= 1) return
  if (config.generalSettings.autoCleanBackup) {
    const keepDays = [backups[0]]
    const keepWeeks = [backups[0]]
    const keepMonths = [backups[0]]

    const convertFromEpoch = (backupFile: string): Date => {
      const epochString = backupFile.substring(backupFile.lastIndexOf('.') + 1)
      return new Date(Number.parseInt(epochString))
    }

    for (const backup of backups) {
      const backupDate = convertFromEpoch(backup.url)
      const lastDay = convertFromEpoch(keepDays[keepDays.length - 1].url)
      const lastWeek = convertFromEpoch(keepWeeks[keepWeeks.length - 1].url)
      const lastMonth = convertFromEpoch(keepMonths[keepMonths.length - 1].url)

      if (moment(backupDate).isSame(lastDay, 'day')) {
        if (
          moment(backupDate).isSame(new Date(), 'day') &&
          backupDate > lastDay
        ) {
          keepDays[keepDays.length - 1] = backup
        } else if (
          !moment(backupDate).isSame(new Date(), 'day') &&
          backupDate < lastDay
        ) {
          keepDays[keepDays.length - 1] = backup
        }
      } else if (keepDays.length < config.generalSettings.autoCleanBackupDays) {
        keepDays.push(backup)
      }

      if (moment(backupDate).isSame(lastWeek, 'week')) {
        if (backupDate < lastWeek) {
          keepWeeks[keepWeeks.length - 1] = backup
        }
      } else if (
        keepWeeks.length < config.generalSettings.autoCleanBackupWeeks
      ) {
        keepWeeks.push(backup)
      }

      if (moment(backupDate).isSame(lastMonth, 'month')) {
        if (backupDate < lastWeek) {
          keepMonths[keepMonths.length - 1] = backup
        }
      } else if (
        keepMonths.length < config.generalSettings.autoCleanBackupMonths
      ) {
        keepMonths.push(backup)
      }
    }
    backups = backups.filter(
      (b) =>
        !keepDays.includes(b) &&
        !keepWeeks.includes(b) &&
        !keepMonths.includes(b)
    )
  } else {
    for (let k = 0; k < config.generalSettings.cleanRetain; k++) {
      backups.shift() // Keep the K newest backups
    }
  }
  for (const backup of backups) {
    try {
      fs.unlinkSync(saveDir + path.sep + backup.url)
    } catch (e) {
      console.error(e)
    }
  }
}
