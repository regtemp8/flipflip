import { Kysely } from 'kysely'
import { DB } from '../../types/generated'
import logger from '../../../logger'

const userTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create user table')
  return await trx.schema
    .createTable('user')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('username', 'text', (col) => col.unique().notNull())
    .addColumn('hashedPassword', 'blob', (col) => col.notNull())
    .addColumn('salt', 'blob', (col) => col.notNull())
    .addColumn('tokenValue', 'text')
    .addColumn('tokenExpiry', 'integer')
    .execute()
}

const remoteSettingsTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create remoteSettings table')
  return await trx.schema
    .createTable('remoteSettings')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('userId', 'integer', (col) => col.notNull())
    .addColumn('tumblrKey', 'text', (col) => col.notNull())
    .addColumn('tumblrSecret', 'text', (col) => col.notNull())
    .addColumn('tumblrOauthToken', 'text', (col) => col.notNull())
    .addColumn('tumblrOauthTokenSecret', 'text', (col) => col.notNull())
    .addColumn('silenceTumblrAlert', 'boolean', (col) => col.notNull())
    .addColumn('redditUserAgent', 'text', (col) => col.notNull())
    .addColumn('redditClientId', 'text', (col) => col.notNull())
    .addColumn('redditDeviceId', 'text', (col) => col.notNull())
    .addColumn('redditRefreshToken', 'text', (col) => col.notNull())
    .addColumn('twitterConsumerKey', 'text', (col) => col.notNull())
    .addColumn('twitterConsumerSecret', 'text', (col) => col.notNull())
    .addColumn('twitterAccessTokenKey', 'text', (col) => col.notNull())
    .addColumn('twitterAccessTokenSecret', 'text', (col) => col.notNull())
    .addColumn('instagramUsername', 'text', (col) => col.notNull())
    .addColumn('instagramPassword', 'text', (col) => col.notNull())
    .addColumn('hydrusProtocol', 'text', (col) => col.notNull())
    .addColumn('hydrusDomain', 'text', (col) => col.notNull())
    .addColumn('hydrusPort', 'integer', (col) => col.notNull())
    .addColumn('hydrusApiKey', 'text', (col) => col.notNull())
    .addColumn('piwigoProtocol', 'text', (col) => col.notNull())
    .addColumn('piwigoHost', 'text', (col) => col.notNull())
    .addColumn('piwigoUsername', 'text', (col) => col.notNull())
    .addColumn('piwigoPassword', 'text', (col) => col.notNull())
    .addForeignKeyConstraint(
      'FK_remoteSettings_user_userId',
      ['userId'],
      'user',
      ['id']
    )
    .execute()
}

const cacheSettingsTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create cacheSettings table')
  return await trx.schema
    .createTable('cacheSettings')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('userId', 'integer', (col) => col.notNull())
    .addColumn('enabled', 'boolean', (col) => col.notNull())
    .addColumn('directory', 'text', (col) => col.notNull())
    .addColumn('maxSize', 'integer', (col) => col.notNull())
    .addForeignKeyConstraint(
      'FK_cacheSettings_user_userId',
      ['userId'],
      'user',
      ['id']
    )
    .execute()
}

const displaySettingsTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create displaySettings table')
  return await trx.schema
    .createTable('displaySettings')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('userId', 'integer', (col) => col.notNull())
    .addColumn('fullScreen', 'boolean', (col) => col.notNull())
    .addColumn('clickToProgress', 'boolean', (col) => col.notNull())
    .addColumn('clickToProgressWhilePlaying', 'boolean', (col) => col.notNull())
    .addColumn('startImmediately', 'boolean', (col) => col.notNull())
    .addColumn('easingControls', 'boolean', (col) => col.notNull())
    .addColumn('audioAlert', 'boolean', (col) => col.notNull())
    .addColumn('minImageSize', 'integer', (col) => col.notNull())
    .addColumn('minVideoSize', 'integer', (col) => col.notNull())
    .addColumn('maxInMemory', 'integer', (col) => col.notNull())
    .addColumn('maxInHistory', 'integer', (col) => col.notNull())
    .addColumn('maxLoadingAtOnce', 'integer', (col) => col.notNull())
    .addForeignKeyConstraint(
      'FK_displaySettings_user_userId',
      ['userId'],
      'user',
      ['id']
    )
    .execute()
}

const tagTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create tag table')
  return await trx.schema
    .createTable('tag')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('userId', 'integer', (col) => col.notNull())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('phraseString', 'text')
    .addForeignKeyConstraint('FK_tag_user_userId', ['userId'], 'user', ['id'])
    .addUniqueConstraint('UQ_tag_userId_name', ['userId', 'name'])
    .execute()
}

const ignoredTagTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create ignoredTag table')
  return await trx.schema
    .createTable('ignoredTag')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('displaySettingsId', 'integer', (col) => col.notNull())
    .addColumn('tagId', 'integer', (col) => col.notNull())
    .addForeignKeyConstraint(
      'FK_ignoredTag_displaySettings_displaySettingsId',
      ['displaySettingsId'],
      'displaySettings',
      ['id']
    )
    .addForeignKeyConstraint('FK_ignoredTag_tag_tagId', ['tagId'], 'tag', [
      'id'
    ])
    .execute()
}

const generalSettingsTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create generalSettings table')
  return await trx.schema
    .createTable('generalSettings')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('userId', 'integer', (col) => col.notNull())
    .addColumn('prioritizePerformance', 'boolean', (col) => col.notNull())
    .addColumn('confirmSceneDeletion', 'boolean', (col) => col.notNull())
    .addColumn('confirmBlacklist', 'boolean', (col) => col.notNull())
    .addColumn('confirmFileDeletion', 'boolean', (col) => col.notNull())
    .addColumn('autoBackup', 'boolean', (col) => col.notNull())
    .addColumn('autoBackupDays', 'integer', (col) => col.notNull())
    .addColumn('autoCleanBackup', 'boolean', (col) => col.notNull())
    .addColumn('autoCleanBackupDays', 'integer', (col) => col.notNull())
    .addColumn('autoCleanBackupWeeks', 'integer', (col) => col.notNull())
    .addColumn('autoCleanBackupMonths', 'integer', (col) => col.notNull())
    .addColumn('cleanRetain', 'integer', (col) => col.notNull())
    .addColumn('watermark', 'boolean', (col) => col.notNull())
    .addColumn('watermarkDisplay', 'boolean', (col) => col.notNull())
    .addColumn('watermarkCorner', 'text', (col) => col.notNull())
    .addColumn('watermarkText', 'text', (col) => col.notNull())
    .addColumn('watermarkFontFamily', 'text', (col) => col.notNull())
    .addColumn('watermarkFontSize', 'integer', (col) => col.notNull())
    .addColumn('watermarkColor', 'text', (col) => col.notNull())
    .addForeignKeyConstraint(
      'FK_generalSettings_user_userId',
      ['userId'],
      'user',
      ['id']
    )
    .execute()
}

const tutorialsTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create tutorials table')
  return await trx.schema
    .createTable('tutorials')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('userId', 'integer', (col) => col.notNull())
    .addColumn('current', 'text') // from App.tutorial
    .addColumn('scenePicker', 'text')
    .addColumn('sceneDetail', 'text')
    .addColumn('sceneGenerator', 'text')
    .addColumn('library', 'text')
    .addColumn('audios', 'text')
    .addColumn('scripts', 'text')
    .addColumn('player', 'text')
    .addColumn('scriptor', 'text')
    .addColumn('videoClipper', 'text')
    .addForeignKeyConstraint('FK_tutorials_user_userId', ['userId'], 'user', [
      'id'
    ])
    .execute()
}

const themeTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create theme table')
  return await trx.schema
    .createTable('theme')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('userId', 'integer', (col) => col.notNull())
    .addColumn('mode', 'text', (col) => col.notNull())
    .addColumn('primaryColor', 'text', (col) => col.notNull())
    .addColumn('secondaryColor', 'text', (col) => col.notNull())
    .addForeignKeyConstraint('FK_theme_user_userId', ['userId'], 'user', ['id'])
    .execute()
}

const contentSourceTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create contentSource table')
  return await trx.schema
    .createTable('contentSource') // library source
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('userId', 'integer', (col) => col.notNull())
    .addColumn('url', 'text', (col) => col.notNull())
    .addColumn('offline', 'boolean', (col) => col.notNull())
    .addColumn('marked', 'boolean', (col) => col.notNull())
    .addColumn('lastCheck', 'integer')
    .addColumn('count', 'integer', (col) => col.notNull())
    .addColumn('countComplete', 'boolean', (col) => col.notNull())
    .addColumn('weight', 'integer', (col) => col.notNull())
    .addColumn('localDirOfSources', 'boolean', (col) => col.notNull())
    .addColumn('videoSubtitleFile', 'text')
    .addColumn('videoDuration', 'integer')
    .addColumn('videoResolution', 'integer')
    .addColumn('redditFunc', 'text')
    .addColumn('redditTime', 'text')
    .addColumn('twitterIncludeRetweets', 'boolean', (col) => col.notNull())
    .addColumn('twitterIncludeReplies', 'boolean', (col) => col.notNull())
    .addForeignKeyConstraint(
      'FK_contentSource_user_userId',
      ['userId'],
      'user',
      ['id']
    )
    .execute()
}

const contentSourceTagTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create contentSourceTag table')
  return await trx.schema
    .createTable('contentSourceTag')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('contentSourceId', 'integer', (col) => col.notNull())
    .addColumn('tagId', 'integer', (col) => col.notNull())
    .addForeignKeyConstraint(
      'FK_contentSourceTag_contentSource_contentSourceId',
      ['contentSourceId'],
      'contentSource',
      ['id']
    )
    .addForeignKeyConstraint(
      'FK_contentSourceTag_tag_tagId',
      ['tagId'],
      'tag',
      ['id']
    )
    .execute()
}

const clipTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create clip table')
  return await trx.schema
    .createTable('clip')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('userId', 'integer', (col) => col.notNull())
    .addColumn('contentSourceId', 'integer', (col) => col.notNull())
    .addColumn('disabled', 'boolean', (col) => col.notNull())
    .addColumn('start', 'integer')
    .addColumn('end', 'integer')
    .addColumn('volume', 'integer')
    .addForeignKeyConstraint('FK_clip_user_userId', ['userId'], 'user', ['id'])
    .addForeignKeyConstraint(
      'FK_clip_contentSource_contentSourceId',
      ['contentSourceId'],
      'contentSource',
      ['id']
    )
    .execute()
}

const clipTagTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create clipTag table')
  return await trx.schema
    .createTable('clipTag')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('clipId', 'integer', (col) => col.notNull())
    .addColumn('tagId', 'integer', (col) => col.notNull())
    .addForeignKeyConstraint('FK_clipTag_clip_clipId', ['clipId'], 'clip', [
      'id'
    ])
    .addForeignKeyConstraint('FK_clipTag_tag_tagId', ['tagId'], 'tag', ['id'])
    .execute()
}

const contentSourceBlacklistItemTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create contentSourceBlacklistItem table')
  return await trx.schema
    .createTable('contentSourceBlacklistItem')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('contentSourceId', 'integer', (col) => col.notNull())
    .addColumn('url', 'text', (col) => col.notNull())
    .addForeignKeyConstraint(
      'FK_contentSourceClip_contentSource_contentSourceId',
      ['contentSourceId'],
      'contentSource',
      ['id']
    )
    .execute()
}

const sceneTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create scene table')
  return await trx.schema
    .createTable('scene')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('userId', 'integer', (col) => col.notNull())
    .addColumn('sceneGroupId', 'integer')
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('useWeights', 'boolean', (col) => col.notNull())
    .addColumn('timingFunction', 'text', (col) => col.notNull())
    .addColumn('timingConstant', 'integer', (col) => col.notNull())
    .addColumn('timingMin', 'integer', (col) => col.notNull())
    .addColumn('timingMax', 'integer', (col) => col.notNull())
    .addColumn('timingSinRate', 'integer', (col) => col.notNull())
    .addColumn('timingBpmMulti', 'integer', (col) => col.notNull())
    .addColumn('backForth', 'boolean', (col) => col.notNull())
    .addColumn('backForthTf', 'text', (col) => col.notNull())
    .addColumn('backForthConstant', 'integer', (col) => col.notNull())
    .addColumn('backForthMin', 'integer', (col) => col.notNull())
    .addColumn('backForthMax', 'integer', (col) => col.notNull())
    .addColumn('backForthSinRate', 'integer', (col) => col.notNull())
    .addColumn('backForthBpmMulti', 'integer', (col) => col.notNull())
    .addColumn('imageType', 'text', (col) => col.notNull())
    .addColumn('backgroundType', 'text', (col) => col.notNull())
    .addColumn('backgroundBlur', 'integer', (col) => col.notNull())
    .addColumn('imageTypeFilter', 'text', (col) => col.notNull())
    .addColumn('fullSource', 'boolean', (col) => col.notNull())
    .addColumn('imageOrientation', 'text', (col) => col.notNull())
    .addColumn('gifOption', 'text', (col) => col.notNull())
    .addColumn('gifTimingConstant', 'integer', (col) => col.notNull())
    .addColumn('gifTimingMin', 'integer', (col) => col.notNull())
    .addColumn('gifTimingMax', 'integer', (col) => col.notNull())
    .addColumn('videoOrientation', 'text', (col) => col.notNull())
    .addColumn('videoOption', 'text', (col) => col.notNull())
    .addColumn('videoTimingConstant', 'integer', (col) => col.notNull())
    .addColumn('videoTimingMin', 'integer', (col) => col.notNull())
    .addColumn('videoTimingMax', 'integer', (col) => col.notNull())
    .addColumn('videoSpeed', 'integer', (col) => col.notNull())
    .addColumn('videoRandomSpeed', 'boolean', (col) => col.notNull())
    .addColumn('videoSpeedMin', 'integer', (col) => col.notNull())
    .addColumn('videoSpeedMax', 'integer', (col) => col.notNull())
    .addColumn('videoSkip', 'integer', (col) => col.notNull())
    .addColumn('randomVideoStart', 'boolean', (col) => col.notNull())
    .addColumn('continueVideo', 'boolean', (col) => col.notNull())
    .addColumn('playVideoClips', 'boolean', (col) => col.notNull())
    .addColumn('skipVideoStart', 'integer', (col) => col.notNull())
    .addColumn('skipVideoEnd', 'integer', (col) => col.notNull())
    .addColumn('videoVolume', 'integer', (col) => col.notNull())
    .addColumn('weightFunction', 'text', (col) => col.notNull())
    .addColumn('sourceOrderFunction', 'text', (col) => col.notNull())
    .addColumn('forceAllSource', 'boolean', (col) => col.notNull())
    .addColumn('orderFunction', 'text', (col) => col.notNull())
    .addColumn('forceAll', 'boolean', (col) => col.notNull())
    .addColumn('zoom', 'boolean', (col) => col.notNull())
    .addColumn('zoomRandom', 'boolean', (col) => col.notNull())
    .addColumn('zoomStart', 'integer', (col) => col.notNull())
    .addColumn('zoomStartMin', 'integer', (col) => col.notNull())
    .addColumn('zoomStartMax', 'integer', (col) => col.notNull())
    .addColumn('zoomEnd', 'integer', (col) => col.notNull())
    .addColumn('zoomEndMin', 'integer', (col) => col.notNull())
    .addColumn('zoomEndMax', 'integer', (col) => col.notNull())
    .addColumn('horizTransType', 'text', (col) => col.notNull())
    .addColumn('horizTransLevel', 'integer', (col) => col.notNull())
    .addColumn('horizTransLevelMin', 'integer', (col) => col.notNull())
    .addColumn('horizTransLevelMax', 'integer', (col) => col.notNull())
    .addColumn('horizTransRandom', 'boolean', (col) => col.notNull())
    .addColumn('vertTransType', 'text', (col) => col.notNull())
    .addColumn('vertTransLevel', 'integer', (col) => col.notNull())
    .addColumn('vertTransLevelMin', 'integer', (col) => col.notNull())
    .addColumn('vertTransLevelMax', 'integer', (col) => col.notNull())
    .addColumn('vertTransRandom', 'boolean', (col) => col.notNull())
    .addColumn('transTf', 'text', (col) => col.notNull())
    .addColumn('transDuration', 'integer', (col) => col.notNull())
    .addColumn('transDurationMin', 'integer', (col) => col.notNull())
    .addColumn('transDurationMax', 'integer', (col) => col.notNull())
    .addColumn('transSinRate', 'integer', (col) => col.notNull())
    .addColumn('transBpmMulti', 'integer', (col) => col.notNull())
    .addColumn('transEase', 'text', (col) => col.notNull())
    .addColumn('transExp', 'integer', (col) => col.notNull())
    .addColumn('transAmp', 'integer', (col) => col.notNull())
    .addColumn('transPer', 'integer', (col) => col.notNull())
    .addColumn('transOv', 'integer', (col) => col.notNull())
    .addColumn('crossFade', 'boolean', (col) => col.notNull())
    .addColumn('crossFadeAudio', 'boolean', (col) => col.notNull())
    .addColumn('fadeTf', 'text', (col) => col.notNull())
    .addColumn('fadeDuration', 'integer', (col) => col.notNull())
    .addColumn('fadeDurationMin', 'integer', (col) => col.notNull())
    .addColumn('fadeDurationMax', 'integer', (col) => col.notNull())
    .addColumn('fadeSinRate', 'integer', (col) => col.notNull())
    .addColumn('fadeBpmMulti', 'integer', (col) => col.notNull())
    .addColumn('fadeEase', 'text', (col) => col.notNull())
    .addColumn('fadeExp', 'integer', (col) => col.notNull())
    .addColumn('fadeAmp', 'integer', (col) => col.notNull())
    .addColumn('fadePer', 'integer', (col) => col.notNull())
    .addColumn('fadeOv', 'integer', (col) => col.notNull())
    .addColumn('slide', 'boolean', (col) => col.notNull())
    .addColumn('slideTf', 'text', (col) => col.notNull())
    .addColumn('slideType', 'text', (col) => col.notNull())
    .addColumn('slideDistance', 'integer', (col) => col.notNull())
    .addColumn('slideDuration', 'integer', (col) => col.notNull())
    .addColumn('slideDurationMin', 'integer', (col) => col.notNull())
    .addColumn('slideDurationMax', 'integer', (col) => col.notNull())
    .addColumn('slideSinRate', 'integer', (col) => col.notNull())
    .addColumn('slideBpmMulti', 'integer', (col) => col.notNull())
    .addColumn('slideEase', 'text', (col) => col.notNull())
    .addColumn('slideExp', 'integer', (col) => col.notNull())
    .addColumn('slideAmp', 'integer', (col) => col.notNull())
    .addColumn('slidePer', 'integer', (col) => col.notNull())
    .addColumn('slideOv', 'integer', (col) => col.notNull())
    .addColumn('strobe', 'boolean', (col) => col.notNull())
    .addColumn('strobePulse', 'boolean', (col) => col.notNull())
    .addColumn('strobeLayer', 'text', (col) => col.notNull())
    .addColumn('strobeOpacity', 'integer', (col) => col.notNull())
    .addColumn('strobeTf', 'text', (col) => col.notNull())
    .addColumn('strobeTime', 'integer', (col) => col.notNull())
    .addColumn('strobeTimeMin', 'integer', (col) => col.notNull())
    .addColumn('strobeTimeMax', 'integer', (col) => col.notNull())
    .addColumn('strobeSinRate', 'integer', (col) => col.notNull())
    .addColumn('strobeBpmMulti', 'integer', (col) => col.notNull())
    .addColumn('strobeDelayTf', 'text', (col) => col.notNull())
    .addColumn('strobeDelay', 'integer', (col) => col.notNull())
    .addColumn('strobeDelayMin', 'integer', (col) => col.notNull())
    .addColumn('strobeDelayMax', 'integer', (col) => col.notNull())
    .addColumn('strobeDelaySinRate', 'integer', (col) => col.notNull())
    .addColumn('strobeDelayBpmMulti', 'integer', (col) => col.notNull())
    .addColumn('strobeColorType', 'text', (col) => col.notNull())
    .addColumn('strobeEase', 'text', (col) => col.notNull())
    .addColumn('strobeExp', 'integer', (col) => col.notNull())
    .addColumn('strobeAmp', 'integer', (col) => col.notNull())
    .addColumn('strobePer', 'integer', (col) => col.notNull())
    .addColumn('strobeOv', 'integer', (col) => col.notNull())
    .addColumn('fadeInOut', 'boolean', (col) => col.notNull())
    .addColumn('fadeIoPulse', 'boolean', (col) => col.notNull())
    .addColumn('fadeIoTf', 'text', (col) => col.notNull())
    .addColumn('fadeIoDuration', 'integer', (col) => col.notNull())
    .addColumn('fadeIoDurationMin', 'integer', (col) => col.notNull())
    .addColumn('fadeIoDurationMax', 'integer', (col) => col.notNull())
    .addColumn('fadeIoSinRate', 'integer', (col) => col.notNull())
    .addColumn('fadeIoBpmMulti', 'integer', (col) => col.notNull())
    .addColumn('fadeIoDelayTf', 'text', (col) => col.notNull())
    .addColumn('fadeIoDelay', 'integer', (col) => col.notNull())
    .addColumn('fadeIoDelayMin', 'integer', (col) => col.notNull())
    .addColumn('fadeIoDelayMax', 'integer', (col) => col.notNull())
    .addColumn('fadeIoDelaySinRate', 'integer', (col) => col.notNull())
    .addColumn('fadeIoDelayBpmMulti', 'integer', (col) => col.notNull())
    .addColumn('fadeIoStartEase', 'text', (col) => col.notNull())
    .addColumn('fadeIoStartExp', 'integer', (col) => col.notNull())
    .addColumn('fadeIoStartAmp', 'integer', (col) => col.notNull())
    .addColumn('fadeIoStartPer', 'integer', (col) => col.notNull())
    .addColumn('fadeIoStartOv', 'integer', (col) => col.notNull())
    .addColumn('fadeIoEndEase', 'text', (col) => col.notNull())
    .addColumn('fadeIoEndExp', 'integer', (col) => col.notNull())
    .addColumn('fadeIoEndAmp', 'integer', (col) => col.notNull())
    .addColumn('fadeIoEndPer', 'integer', (col) => col.notNull())
    .addColumn('fadeIoEndOv', 'integer', (col) => col.notNull())
    .addColumn('panning', 'boolean', (col) => col.notNull())
    .addColumn('panTf', 'text', (col) => col.notNull())
    .addColumn('panDuration', 'integer', (col) => col.notNull())
    .addColumn('panDurationMin', 'integer', (col) => col.notNull())
    .addColumn('panDurationMax', 'integer', (col) => col.notNull())
    .addColumn('panSinRate', 'integer', (col) => col.notNull())
    .addColumn('panBpmMulti', 'integer', (col) => col.notNull())
    .addColumn('panHorizTransType', 'text', (col) => col.notNull())
    .addColumn('panHorizTransImg', 'boolean', (col) => col.notNull())
    .addColumn('panHorizTransLevel', 'integer', (col) => col.notNull())
    .addColumn('panHorizTransLevelMax', 'integer', (col) => col.notNull())
    .addColumn('panHorizTransLevelMin', 'integer', (col) => col.notNull())
    .addColumn('panHorizTransRandom', 'boolean', (col) => col.notNull())
    .addColumn('panVertTransType', 'text', (col) => col.notNull())
    .addColumn('panVertTransImg', 'boolean', (col) => col.notNull())
    .addColumn('panVertTransLevel', 'integer', (col) => col.notNull())
    .addColumn('panVertTransLevelMax', 'integer', (col) => col.notNull())
    .addColumn('panVertTransLevelMin', 'integer', (col) => col.notNull())
    .addColumn('panVertTransRandom', 'boolean', (col) => col.notNull())
    .addColumn('panStartEase', 'text', (col) => col.notNull())
    .addColumn('panStartExp', 'integer', (col) => col.notNull())
    .addColumn('panStartAmp', 'integer', (col) => col.notNull())
    .addColumn('panStartPer', 'integer', (col) => col.notNull())
    .addColumn('panStartOv', 'integer', (col) => col.notNull())
    .addColumn('panEndEase', 'text', (col) => col.notNull())
    .addColumn('panEndExp', 'integer', (col) => col.notNull())
    .addColumn('panEndAmp', 'integer', (col) => col.notNull())
    .addColumn('panEndPer', 'integer', (col) => col.notNull())
    .addColumn('panEndOv', 'integer', (col) => col.notNull())
    .addColumn('overrideIgnore', 'boolean', (col) => col.notNull())
    .addColumn('scriptScene', 'boolean', (col) => col.notNull())
    .addColumn('downloadScene', 'boolean', (col) => col.notNull())
    .addColumn('generatorMax', 'integer', (col) => col.notNull())
    .addColumn('persistAudio', 'boolean', (col) => col.notNull())
    .addColumn('persistText', 'boolean', (col) => col.notNull())
    .addColumn('libraryId', 'integer', (col) => col.notNull())
    .addColumn('audioScene', 'boolean', (col) => col.notNull())
    .addColumn('audioEnabled', 'boolean', (col) => col.notNull())
    .addColumn('audioStartIndex', 'integer', (col) => col.notNull())
    .addColumn('textEnabled', 'boolean', (col) => col.notNull())
    .addColumn('scriptStartIndex', 'integer', (col) => col.notNull())
    .addColumn('regenerate', 'boolean', (col) => col.notNull())
    .addColumn('defaultScene', 'boolean', (col) => col.notNull())
    .addForeignKeyConstraint('FK_scene_user_userId', ['userId'], 'user', ['id'])
    .addForeignKeyConstraint(
      'FK_scene_sceneGroup_sceneGroupId',
      ['sceneGroupId'],
      'sceneGroup',
      ['id']
    )
    .execute()
}

const scenePlaylistTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create scenePlaylist table')
  return await trx.schema
    .createTable('scenePlaylist')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('sceneId', 'integer', (col) => col.notNull())
    .addColumn('playlistId', 'integer', (col) => col.notNull())
    .addForeignKeyConstraint(
      'FK_scenePlaylist_scene_sceneId',
      ['sceneId'],
      'scene',
      ['id']
    )
    .addForeignKeyConstraint(
      'FK_scenePlaylist_playlist_playlistId',
      ['playlistId'],
      'playlist',
      ['id']
    )
    .execute()
}

const weightGroupTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create weightGroup table')
  return await trx.schema
    .createTable('weightGroup')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('sceneId', 'integer', (col) => col.notNull())
    .addColumn('ruleId', 'integer')
    .addColumn('percent', 'integer')
    .addColumn('type', 'text')
    .addColumn('search', 'text')
    .addColumn('max', 'integer')
    .addColumn('chosen', 'integer')
    .addForeignKeyConstraint(
      'FK_weightGroup_scene_sceneId',
      ['sceneId'],
      'scene',
      ['id']
    )
    .addForeignKeyConstraint(
      'FK_weightGroup_weightGroup_ruleId',
      ['ruleId'],
      'weightGroup',
      ['id']
    )
    .execute()
}

const sceneColorTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create sceneColor table')
  return await trx.schema
    .createTable('sceneColor')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('sceneId', 'integer', (col) => col.notNull())
    .addColumn('color', 'text', (col) => col.notNull())
    .addColumn('type', 'text', (col) => col.notNull()) // background, strobe
    .addForeignKeyConstraint(
      'FK_sceneBackgroundColor_scene_sceneId',
      ['sceneId'],
      'scene',
      ['id']
    )
    .execute()
}

const libraryContentSourceTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create libraryContentSource table')
  return await trx.schema
    .createTable('libraryContentSource')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('userId', 'integer', (col) => col.notNull())
    .addColumn('contentSourceId', 'integer', (col) => col.notNull())
    .addForeignKeyConstraint(
      'FK_libraryContentSource_user_userId',
      ['userId'],
      'user',
      ['id']
    )
    .addForeignKeyConstraint(
      'FK_libraryContentSource_contentSource_contentSourceId',
      ['contentSourceId'],
      'contentSource',
      ['id']
    )
    .execute()
}

const sceneContentSourceTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create sceneContentSource table')
  return await trx.schema
    .createTable('sceneContentSource')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('sceneId', 'integer', (col) => col.notNull())
    .addColumn('contentSourceId', 'integer', (col) => col.notNull())
    .addForeignKeyConstraint(
      'FK_sceneContentSource_scene_sceneId',
      ['sceneId'],
      'scene',
      ['id']
    )
    .addForeignKeyConstraint(
      'FK_sceneContentSource_contentSource_contentSourceId',
      ['contentSourceId'],
      'contentSource',
      ['id']
    )
    .execute()
}

const sceneGroupTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create sceneGroup table')
  return await trx.schema
    .createTable('sceneGroup')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('userId', 'integer', (col) => col.notNull())
    .addColumn('type', 'text', (col) => col.notNull())
    .addColumn('name', 'text', (col) => col.notNull())
    .addForeignKeyConstraint('FK_sceneGroup_user_userId', ['userId'], 'user', [
      'id'
    ])
    .execute()
}

const displayTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create display table')
  return await trx.schema
    .createTable('display')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('userId', 'integer', (col) => col.notNull())
    .addColumn('sceneGroupId', 'integer')
    .addForeignKeyConstraint('FK_display_user_userId', ['userId'], 'user', [
      'id'
    ])
    .addForeignKeyConstraint(
      'FK_display_sceneGroup_sceneGroupId',
      ['sceneGroupId'],
      'sceneGroup',
      ['id']
    )
    .execute()
}

const displayViewTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create displayView table')
  return await trx.schema
    .createTable('displayView')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('displayId', 'integer', (col) => col.notNull())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('x', 'integer', (col) => col.notNull())
    .addColumn('y', 'integer', (col) => col.notNull())
    .addColumn('z', 'integer', (col) => col.notNull())
    .addColumn('width', 'integer', (col) => col.notNull())
    .addColumn('height', 'integer', (col) => col.notNull())
    .addColumn('color', 'text', (col) => col.notNull())
    .addColumn('opacity', 'integer', (col) => col.notNull())
    .addColumn('visible', 'boolean', (col) => col.notNull())
    .addColumn('playlistId', 'integer')
    .addColumn('sync', 'boolean', (col) => col.notNull())
    .addColumn('syncWithView', 'integer')
    .addColumn('mirrorSyncedView', 'text', (col) => col.notNull())
    .addForeignKeyConstraint(
      'FK_displayView_display_displayId',
      ['displayId'],
      'display',
      ['id']
    )
    .addForeignKeyConstraint(
      'FK_displayView_playlist_playlistId',
      ['playlistId'],
      'playlist',
      ['id']
    )
    .addForeignKeyConstraint(
      'FK_displayView_displayView_syncWithView',
      ['syncWithView'],
      'displayView',
      ['id']
    )
    .execute()
}

const audioPlaylistItemTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create audioPlaylistItem table')
  return await trx.schema
    .createTable('audioPlaylistItem')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('playlistId', 'integer', (col) => col.notNull())
    .addColumn('index', 'integer', (col) => col.notNull())
    .addColumn('audioId', 'integer', (col) => col.notNull())
    .addForeignKeyConstraint(
      'FK_audioPlaylistItem_playlist_playlistId',
      ['playlistId'],
      'playlist',
      ['id']
    )
    .addForeignKeyConstraint(
      'FK_audioPlaylistItem_audio_audioId',
      ['audioId'],
      'audio',
      ['id']
    )
    .execute()
}

const captionScriptPlaylistItemTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create captionScriptPlaylistItem table')
  return await trx.schema
    .createTable('captionScriptPlaylistItem')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('playlistId', 'integer', (col) => col.notNull())
    .addColumn('index', 'integer', (col) => col.notNull())
    .addColumn('captionScriptId', 'integer', (col) => col.notNull())
    .addForeignKeyConstraint(
      'FK_captionScriptPlaylistItem_playlist_playlistId',
      ['playlistId'],
      'playlist',
      ['id']
    )
    .addForeignKeyConstraint(
      'FK_captionScriptPlaylistItem_captionScript_captionScriptId',
      ['captionScriptId'],
      'captionScript',
      ['id']
    )
    .execute()
}

const displayPlaylistItemTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create displayPlaylistItem table')
  return await trx.schema
    .createTable('displayPlaylistItem')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('playlistId', 'integer', (col) => col.notNull())
    .addColumn('index', 'integer', (col) => col.notNull())
    .addColumn('duration', 'integer')
    .addForeignKeyConstraint(
      'FK_displayPlaylistItem_playlist_playlistId',
      ['playlistId'],
      'playlist',
      ['id']
    )
    .execute()
}

const displayPlaylistItemDisplayTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create displayPlaylistItemDisplay table')
  return await trx.schema
    .createTable('displayPlaylistItemDisplay')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('displayPlaylistItemId', 'integer', (col) => col.notNull())
    .addColumn('displayId', 'integer', (col) => col.notNull())
    .addForeignKeyConstraint(
      'FK_displayPlaylistItemDisplay_displayPlaylistItem_displayPlaylistItemId',
      ['displayPlaylistItemId'],
      'displayPlaylistItem',
      ['id']
    )
    .addForeignKeyConstraint(
      'FK_displayPlaylistItemScene_display_displayId',
      ['displayId'],
      'display',
      ['id']
    )
    .execute()
}

const scenePlaylistItemTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create scenePlaylistItem table')
  return await trx.schema
    .createTable('scenePlaylistItem')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('playlistId', 'integer', (col) => col.notNull())
    .addColumn('index', 'integer', (col) => col.notNull())
    .addColumn('duration', 'integer')
    .addColumn('playAfterAllImages', 'boolean', (col) => col.notNull())
    .addForeignKeyConstraint(
      'FK_scenePlaylistItem_playlist_playlistId',
      ['playlistId'],
      'playlist',
      ['id']
    )
    .execute()
}

const scenePlaylistItemSceneTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create scenePlaylistItemScene table')
  return await trx.schema
    .createTable('scenePlaylistItemScene')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('scenePlaylistItemId', 'integer', (col) => col.notNull())
    .addColumn('sceneId', 'integer', (col) => col.notNull())
    .addForeignKeyConstraint(
      'FK_scenePlaylistItemScene_scenePlaylistItem_scenePlaylistItemId',
      ['scenePlaylistItemId'],
      'scenePlaylistItem',
      ['id']
    )
    .addForeignKeyConstraint(
      'FK_scenePlaylistItemScene_scene_sceneId',
      ['sceneId'],
      'scene',
      ['id']
    )
    .execute()
}

const playlistTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create playlist table')
  return await trx.schema
    .createTable('playlist')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('userId', 'integer', (col) => col.notNull())
    .addColumn('sceneGroupId', 'integer')
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('type', 'text', (col) => col.notNull())
    .addColumn('shuffle', 'boolean', (col) => col.notNull())
    .addColumn('repeat', 'text', (col) => col.notNull())
    .addForeignKeyConstraint('FK_playlist_user_userId', ['userId'], 'user', [
      'id'
    ])
    .addForeignKeyConstraint(
      'FK_playlist_sceneGroup_sceneGroupId',
      ['sceneGroupId'],
      'sceneGroup',
      ['id']
    )
    .execute()
}

const audioTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create audio table')
  return await trx.schema
    .createTable('audio')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('userId', 'integer', (col) => col.notNull())
    .addColumn('url', 'text', (col) => col.notNull())
    .addColumn('marked', 'boolean', (col) => col.notNull())
    .addColumn('volume', 'integer', (col) => col.notNull())
    .addColumn('speed', 'integer', (col) => col.notNull())
    .addColumn('stopAtEnd', 'boolean', (col) => col.notNull())
    .addColumn('nextSceneAtEnd', 'boolean', (col) => col.notNull())
    .addColumn('tick', 'boolean', (col) => col.notNull())
    .addColumn('tickMode', 'text', (col) => col.notNull())
    .addColumn('tickDelay', 'integer', (col) => col.notNull())
    .addColumn('tickMinDelay', 'integer', (col) => col.notNull())
    .addColumn('tickMaxDelay', 'integer', (col) => col.notNull())
    .addColumn('tickSinRate', 'integer', (col) => col.notNull())
    .addColumn('tickBpmMulti', 'integer', (col) => col.notNull())
    .addColumn('bpm', 'integer', (col) => col.notNull())
    .addColumn('thumb', 'text')
    .addColumn('name', 'text')
    .addColumn('artist', 'text')
    .addColumn('album', 'text')
    .addColumn('trackNum', 'integer')
    .addColumn('duration', 'integer')
    .addColumn('comment', 'text')
    .addColumn('playedCount', 'integer', (col) => col.notNull())
    .addForeignKeyConstraint('FK_audio_user_userId', ['userId'], 'user', ['id'])
    .execute()
}

const audioTagTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create audioTag table')
  return await trx.schema
    .createTable('audioTag')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('audioId', 'integer', (col) => col.notNull())
    .addColumn('tagId', 'integer', (col) => col.notNull())
    .addForeignKeyConstraint(
      'FK_audioTag_audio_audioId',
      ['audioId'],
      'audio',
      ['id']
    )
    .addForeignKeyConstraint('FK_audioTag_tag_tagId', ['tagId'], 'tag', ['id'])
    .execute()
}

const fontSettingsTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create fontSettings table')
  return await trx.schema
    .createTable('fontSettings')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('userId', 'integer', (col) => col.notNull())
    .addColumn('color', 'text', (col) => col.notNull())
    .addColumn('fontSize', 'integer', (col) => col.notNull())
    .addColumn('fontFamily', 'text', (col) => col.notNull())
    .addColumn('border', 'boolean', (col) => col.notNull())
    .addColumn('borderpx', 'integer', (col) => col.notNull())
    .addColumn('borderColor', 'text', (col) => col.notNull())
    .execute()
}

const captionScriptTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create captionScript table')
  return await trx.schema
    .createTable('captionScript')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('userId', 'integer', (col) => col.notNull())
    .addColumn('url', 'text')
    .addColumn('script', 'text')
    .addColumn('marked', 'boolean', (col) => col.notNull())
    .addColumn('opacity', 'integer', (col) => col.notNull())
    .addColumn('stopAtEnd', 'boolean', (col) => col.notNull())
    .addColumn('nextSceneAtEnd', 'boolean', (col) => col.notNull())
    .addColumn('syncWithAudio', 'boolean', (col) => col.notNull())
    .addColumn('blinkFontId', 'integer')
    .addColumn('captionFontId', 'integer')
    .addColumn('captionBigFontId', 'integer')
    .addColumn('countFontId', 'integer')
    .addForeignKeyConstraint(
      'FK_captionScript_user_userId',
      ['userId'],
      'user',
      ['id']
    )
    .addForeignKeyConstraint(
      'FK_captionScript_fontSettings_blinkFontId',
      ['blinkFontId'],
      'fontSettings',
      ['id']
    )
    .addForeignKeyConstraint(
      'FK_captionScript_fontSettings_captionFontId',
      ['captionFontId'],
      'fontSettings',
      ['id']
    )
    .addForeignKeyConstraint(
      'FK_captionScript_fontSettings_captionBigFontId',
      ['captionBigFontId'],
      'fontSettings',
      ['id']
    )
    .addForeignKeyConstraint(
      'FK_captionScript_fontSettings_countFontId',
      ['countFontId'],
      'fontSettings',
      ['id']
    )
    .execute()
}

const captionScriptTagTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create captionScriptTag table')
  return await trx.schema
    .createTable('captionScriptTag')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('captionScriptId', 'integer', (col) => col.notNull())
    .addColumn('tagId', 'integer', (col) => col.notNull())
    .addForeignKeyConstraint(
      'FK_captionScriptTag_captionScript_captionScriptId',
      ['captionScriptId'],
      'captionScript',
      ['id']
    )
    .addForeignKeyConstraint(
      'FK_captionScriptTag_tag_tagId',
      ['tagId'],
      'tag',
      ['id']
    )
    .execute()
}

const backupTable = async (trx: Kysely<DB>) => {
  logger.info('+ Create backup table')
  return await trx.schema
    .createTable('backup')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('fileName', 'text', (col) => col.notNull())
    .addColumn('createdAt', 'integer', (col) => col.notNull())
    .addColumn('interval', 'text', (col) => col.notNull())
    .addColumn('intervalValue', 'integer', (col) => col.notNull())
    .addColumn('year', 'integer', (col) => col.notNull())
    .addUniqueConstraint('UQ_backup_interval_intervalValue_year', [
      'interval',
      'intervalValue',
      'year'
    ])
    .execute()
}

export async function up(db: Kysely<DB>): Promise<void> {
  return await db.transaction().execute(async (trx) => {
    await userTable(trx)
    await remoteSettingsTable(trx)
    await cacheSettingsTable(trx)
    await displaySettingsTable(trx)
    await tagTable(trx)
    await ignoredTagTable(trx)
    await generalSettingsTable(trx)
    await tutorialsTable(trx)
    await themeTable(trx)
    await contentSourceTable(trx)
    await contentSourceTagTable(trx)
    await clipTable(trx)
    await clipTagTable(trx)
    await contentSourceBlacklistItemTable(trx)
    await sceneGroupTable(trx)
    await sceneTable(trx)
    await scenePlaylistTable(trx)
    await weightGroupTable(trx)
    await sceneColorTable(trx)
    await sceneContentSourceTable(trx)
    await libraryContentSourceTable(trx)
    await captionScriptTable(trx)
    await captionScriptTagTable(trx)
    await playlistTable(trx)
    await audioPlaylistItemTable(trx)
    await captionScriptPlaylistItemTable(trx)
    await displayPlaylistItemTable(trx)
    await displayPlaylistItemDisplayTable(trx)
    await scenePlaylistItemTable(trx)
    await scenePlaylistItemSceneTable(trx)
    await displayTable(trx)
    await displayViewTable(trx)
    await audioTable(trx)
    await audioTagTable(trx)
    await fontSettingsTable(trx)
    await backupTable(trx)
  })
}

export async function down(db: Kysely<DB>): Promise<void> {
  return await db.transaction().execute(async (trx) => {
    logger.info('- Drop backup table')
    await trx.schema.dropTable('backup').execute()

    logger.info('- Drop fontSettings table')
    await trx.schema.dropTable('fontSettings').execute()

    logger.info('- Drop audioTag table')
    await trx.schema.dropTable('audioTag').execute()

    logger.info('- Drop audio table')
    await trx.schema.dropTable('audio').execute()

    logger.info('- Drop displayView table')
    await trx.schema.dropTable('displayView').execute()

    logger.info('- Drop display table')
    await trx.schema.dropTable('display').execute()

    logger.info('- Drop scenePlaylistItemScene table')
    await trx.schema.dropTable('scenePlaylistItemScene').execute()

    logger.info('- Drop scenePlaylistItem table')
    await trx.schema.dropTable('scenePlaylistItem').execute()

    logger.info('- Drop displayPlaylistItemScene table')
    await trx.schema.dropTable('displayPlaylistItemScene').execute()

    logger.info('- Drop displayPlaylistItem table')
    await trx.schema.dropTable('displayPlaylistItem').execute()

    logger.info('- Drop captionScriptPlaylistItem table')
    await trx.schema.dropTable('captionScriptPlaylistItem').execute()

    logger.info('- Drop audioPlaylistItem table')
    await trx.schema.dropTable('audioPlaylistItem').execute()

    logger.info('- Drop playlist table')
    await trx.schema.dropTable('playlist').execute()

    logger.info('- Drop captionScriptTag table')
    await trx.schema.dropTable('captionScriptTag').execute()

    logger.info('- Drop captionScript table')
    await trx.schema.dropTable('captionScript').execute()

    logger.info('- Drop libraryContentSource table')
    await trx.schema.dropTable('libraryContentSource').execute()

    logger.info('- Drop sceneContentSource table')
    await trx.schema.dropTable('sceneContentSource').execute()

    logger.info('- Drop sceneColor table')
    await trx.schema.dropTable('sceneColor').execute()

    logger.info('- Drop weightGroup table')
    await trx.schema.dropTable('weightGroup').execute()

    logger.info('- Drop scenePlaylist table')
    await trx.schema.dropTable('scenePlaylist').execute()

    logger.info('- Drop scene table')
    await trx.schema.dropTable('scene').execute()

    logger.info('- Drop sceneGroup table')
    await trx.schema.dropTable('sceneGroup').execute()

    logger.info('- Drop contentSourceBlacklistItem table')
    await trx.schema.dropTable('contentSourceBlacklistItem').execute()

    logger.info('- Drop clipTag table')
    await trx.schema.dropTable('clipTag').execute()

    logger.info('- Drop clip table')
    await trx.schema.dropTable('clip').execute()

    logger.info('- Drop contentSourceTag table')
    await trx.schema.dropTable('contentSourceTag').execute()

    logger.info('- Drop contentSource table')
    await trx.schema.dropTable('contentSource').execute()

    logger.info('- Drop theme table')
    await trx.schema.dropTable('theme').execute()

    logger.info('- Drop tutorials table')
    await trx.schema.dropTable('tutorials').execute()

    logger.info('- Drop generalSettings table')
    await trx.schema.dropTable('generalSettings').execute()

    logger.info('- Drop ignoredTag table')
    await trx.schema.dropTable('ignoredTag').execute()

    logger.info('- Drop tag table')
    await trx.schema.dropTable('tag').execute()

    logger.info('- Drop displaySettings table')
    await trx.schema.dropTable('displaySettings').execute()

    logger.info('- Drop cacheSettings table')
    await trx.schema.dropTable('cacheSettings').execute()

    logger.info('- Drop remoteSettings table')
    await trx.schema.dropTable('remoteSettings').execute()

    logger.info('- Drop user table')
    await trx.schema.dropTable('user').execute()
  })
}
