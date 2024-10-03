import { Kysely } from 'kysely'
import { DB } from '../../types'

const userTable = async (trx: Kysely<DB>) => {
  console.log('+ Create user table')
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
  console.log('+ Create remoteSettings table')
  return await trx.schema
    .createTable('remoteSettings')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('userId', 'integer', (col) => col.notNull())
    .addColumn('tumblrKey', 'text')
    .addColumn('tumblrSecret', 'text')
    .addColumn('tumblrOauthToken', 'text')
    .addColumn('tumblrOauthTokenSecret', 'text')
    .addColumn('silenceTumblrAlert', 'boolean', (col) => col.notNull())
    .addColumn('redditUserAgent', 'text')
    .addColumn('redditClientId', 'text')
    .addColumn('redditDeviceId', 'text')
    .addColumn('redditRefreshToken', 'text')
    .addColumn('twitterConsumerKey', 'text')
    .addColumn('twitterConsumerSecret', 'text')
    .addColumn('twitterAccessTokenKey', 'text')
    .addColumn('twitterAccessTokenSecret', 'text')
    .addColumn('instagramUsername', 'text')
    .addColumn('instagramPassword', 'text')
    .addColumn('hydrusProtocol', 'text')
    .addColumn('hydrusDomain', 'text')
    .addColumn('hydrusPort', 'integer')
    .addColumn('hydrusApiKey', 'text')
    .addColumn('piwigoProtocol', 'text')
    .addColumn('piwigoHost', 'text')
    .addColumn('piwigoUsername', 'text')
    .addColumn('piwigoPassword', 'text')
    .addForeignKeyConstraint(
      'FK_remoteSettings_user_userId',
      ['userId'],
      'user',
      ['id']
    )
    .execute()
}

const cacheSettingsTable = async (trx: Kysely<DB>) => {
  console.log('+ Create cacheSettings table')
  return await trx.schema
    .createTable('cacheSettings')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('userId', 'integer', (col) => col.notNull())
    .addColumn('enabled', 'boolean', (col) => col.notNull())
    .addColumn('directory', 'text')
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
  console.log('+ Create displaySettings table')
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
  console.log('+ Create tag table')
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
  console.log('+ Create ignoredTag table')
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
  console.log('+ Create generalSettings table')
  return await trx.schema
    .createTable('generalSettings')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('userId', 'integer', (col) => col.notNull())
    .addColumn('prioritizePerformance', 'boolean', (col) => col.notNull())
    .addColumn('portableMode', 'boolean', (col) => col.notNull())
    .addColumn('disableLocalSave', 'boolean', (col) => col.notNull())
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
    .addColumn('watermarkText', 'text')
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
  console.log('+ Create tutorials table')
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
  console.log('+ Create theme table')
  return await trx.schema
    .createTable('theme')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('userId', 'integer', (col) => col.notNull())
    .addColumn('mode', 'text')
    .addColumn('primaryColor', 'text')
    .addColumn('secondaryColor', 'text')
    .addForeignKeyConstraint('FK_theme_user_userId', ['userId'], 'user', ['id'])
    .execute()
}

const contentSourceTable = async (trx: Kysely<DB>) => {
  console.log('+ Create contentSource table')
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
  console.log('+ Create contentSourceTag table')
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
  console.log('+ Create clip table')
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
  console.log('+ Create clipTag table')
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
  console.log('+ Create contentSourceBlacklistItem table')
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
  console.log('+ Create scene table')
  return await trx.schema
    .createTable('scene')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('userId', 'integer', (col) => col.notNull())
    .addColumn('sceneGroupId', 'integer')
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('useWeights', 'boolean', (col) => col.notNull())
    .addColumn('timingFunction', 'text')
    .addColumn('timingConstant', 'integer')
    .addColumn('timingMin', 'integer')
    .addColumn('timingMax', 'integer')
    .addColumn('timingSinRate', 'integer')
    .addColumn('timingBpmMulti', 'integer')
    .addColumn('backForth', 'boolean', (col) => col.notNull())
    .addColumn('backForthTf', 'text')
    .addColumn('backForthConstant', 'integer')
    .addColumn('backForthMin', 'integer')
    .addColumn('backForthMax', 'integer')
    .addColumn('backForthSinRate', 'integer')
    .addColumn('backForthBpmMulti', 'integer')
    .addColumn('imageType', 'text')
    .addColumn('backgroundType', 'text')
    .addColumn('backgroundBlur', 'integer')
    .addColumn('imageTypeFilter', 'text')
    .addColumn('fullSource', 'boolean', (col) => col.notNull())
    .addColumn('imageOrientation', 'text')
    .addColumn('gifOption', 'text')
    .addColumn('gifTimingConstant', 'integer')
    .addColumn('gifTimingMin', 'integer')
    .addColumn('gifTimingMax', 'integer')
    .addColumn('videoOrientation', 'text')
    .addColumn('videoOption', 'text')
    .addColumn('videoTimingConstant', 'integer')
    .addColumn('videoTimingMin', 'integer')
    .addColumn('videoTimingMax', 'integer')
    .addColumn('videoSpeed', 'integer')
    .addColumn('videoRandomSpeed', 'boolean', (col) => col.notNull())
    .addColumn('videoSpeedMin', 'integer')
    .addColumn('videoSpeedMax', 'integer')
    .addColumn('videoSkip', 'integer')
    .addColumn('randomVideoStart', 'boolean', (col) => col.notNull())
    .addColumn('continueVideo', 'boolean', (col) => col.notNull())
    .addColumn('playVideoClips', 'boolean', (col) => col.notNull())
    .addColumn('skipVideoStart', 'integer')
    .addColumn('skipVideoEnd', 'integer')
    .addColumn('videoVolume', 'integer')
    .addColumn('weightFunction', 'text')
    .addColumn('sourceOrderFunction', 'text')
    .addColumn('forceAllSource', 'boolean', (col) => col.notNull())
    .addColumn('orderFunction', 'text')
    .addColumn('forceAll', 'boolean', (col) => col.notNull())
    .addColumn('zoom', 'boolean', (col) => col.notNull())
    .addColumn('zoomRandom', 'boolean', (col) => col.notNull())
    .addColumn('zoomStart', 'integer')
    .addColumn('zoomStartMin', 'integer')
    .addColumn('zoomStartMax', 'integer')
    .addColumn('zoomEnd', 'integer')
    .addColumn('zoomEndMin', 'integer')
    .addColumn('zoomEndMax', 'integer')
    .addColumn('horizTransType', 'text')
    .addColumn('horizTransLevel', 'integer')
    .addColumn('horizTransLevelMin', 'integer')
    .addColumn('horizTransLevelMax', 'integer')
    .addColumn('horizTransRandom', 'boolean', (col) => col.notNull())
    .addColumn('vertTransType', 'text')
    .addColumn('vertTransLevel', 'integer')
    .addColumn('vertTransLevelMin', 'integer')
    .addColumn('vertTransLevelMax', 'integer')
    .addColumn('vertTransRandom', 'boolean', (col) => col.notNull())
    .addColumn('transTf', 'text')
    .addColumn('transDuration', 'integer')
    .addColumn('transDurationMin', 'integer')
    .addColumn('transDurationMax', 'integer')
    .addColumn('transSinRate', 'integer')
    .addColumn('transBpmMulti', 'integer')
    .addColumn('transEase', 'text')
    .addColumn('transExp', 'integer')
    .addColumn('transAmp', 'integer')
    .addColumn('transPer', 'integer')
    .addColumn('transOv', 'integer')
    .addColumn('crossFade', 'boolean', (col) => col.notNull())
    .addColumn('crossFadeAudio', 'boolean', (col) => col.notNull())
    .addColumn('fadeTf', 'text')
    .addColumn('fadeDuration', 'integer')
    .addColumn('fadeDurationMin', 'integer')
    .addColumn('fadeDurationMax', 'integer')
    .addColumn('fadeSinRate', 'integer')
    .addColumn('fadeBpmMulti', 'integer')
    .addColumn('fadeEase', 'text')
    .addColumn('fadeExp', 'integer')
    .addColumn('fadeAmp', 'integer')
    .addColumn('fadePer', 'integer')
    .addColumn('fadeOv', 'integer')
    .addColumn('slide', 'boolean', (col) => col.notNull())
    .addColumn('slideTf', 'text')
    .addColumn('slideType', 'text')
    .addColumn('slideDistance', 'integer')
    .addColumn('slideDuration', 'integer')
    .addColumn('slideDurationMin', 'integer')
    .addColumn('slideDurationMax', 'integer')
    .addColumn('slideSinRate', 'integer')
    .addColumn('slideBpmMulti', 'integer')
    .addColumn('slideEase', 'text')
    .addColumn('slideExp', 'integer')
    .addColumn('slideAmp', 'integer')
    .addColumn('slidePer', 'integer')
    .addColumn('slideOv', 'integer')
    .addColumn('strobe', 'boolean', (col) => col.notNull())
    .addColumn('strobePulse', 'boolean', (col) => col.notNull())
    .addColumn('strobeLayer', 'text')
    .addColumn('strobeOpacity', 'integer')
    .addColumn('strobeTf', 'text')
    .addColumn('strobeTime', 'integer')
    .addColumn('strobeTimeMin', 'integer')
    .addColumn('strobeTimeMax', 'integer')
    .addColumn('strobeSinRate', 'integer')
    .addColumn('strobeBpmMulti', 'integer')
    .addColumn('strobeDelayTf', 'text')
    .addColumn('strobeDelay', 'integer')
    .addColumn('strobeDelayMin', 'integer')
    .addColumn('strobeDelayMax', 'integer')
    .addColumn('strobeDelaySinRate', 'integer')
    .addColumn('strobeDelayBpmMulti', 'integer')
    .addColumn('strobeColorType', 'text')
    .addColumn('strobeEase', 'text')
    .addColumn('strobeExp', 'integer')
    .addColumn('strobeAmp', 'integer')
    .addColumn('strobePer', 'integer')
    .addColumn('strobeOv', 'integer')
    .addColumn('fadeInOut', 'boolean', (col) => col.notNull())
    .addColumn('fadeIoPulse', 'boolean', (col) => col.notNull())
    .addColumn('fadeIoTf', 'text')
    .addColumn('fadeIoDuration', 'integer')
    .addColumn('fadeIoDurationMin', 'integer')
    .addColumn('fadeIoDurationMax', 'integer')
    .addColumn('fadeIoSinRate', 'integer')
    .addColumn('fadeIoBpmMulti', 'integer')
    .addColumn('fadeIoDelayTf', 'text')
    .addColumn('fadeIoDelay', 'integer')
    .addColumn('fadeIoDelayMin', 'integer')
    .addColumn('fadeIoDelayMax', 'integer')
    .addColumn('fadeIoDelaySinRate', 'integer')
    .addColumn('fadeIoDelayBpmMulti', 'integer')
    .addColumn('fadeIoStartEase', 'text')
    .addColumn('fadeIoStartExp', 'integer')
    .addColumn('fadeIoStartAmp', 'integer')
    .addColumn('fadeIoStartPer', 'integer')
    .addColumn('fadeIoStartOv', 'integer')
    .addColumn('fadeIoEndEase', 'text')
    .addColumn('fadeIoEndExp', 'integer')
    .addColumn('fadeIoEndAmp', 'integer')
    .addColumn('fadeIoEndPer', 'integer')
    .addColumn('fadeIoEndOv', 'integer')
    .addColumn('panning', 'boolean', (col) => col.notNull())
    .addColumn('panTf', 'text')
    .addColumn('panDuration', 'integer')
    .addColumn('panDurationMin', 'integer')
    .addColumn('panDurationMax', 'integer')
    .addColumn('panSinRate', 'integer')
    .addColumn('panBpmMulti', 'integer')
    .addColumn('panHorizTransType', 'text')
    .addColumn('panHorizTransImg', 'boolean', (col) => col.notNull())
    .addColumn('panHorizTransLevel', 'integer')
    .addColumn('panHorizTransLevelMax', 'integer')
    .addColumn('panHorizTransLevelMin', 'integer')
    .addColumn('panHorizTransRandom', 'boolean', (col) => col.notNull())
    .addColumn('panVertTransType', 'text')
    .addColumn('panVertTransImg', 'boolean', (col) => col.notNull())
    .addColumn('panVertTransLevel', 'integer')
    .addColumn('panVertTransLevelMax', 'integer')
    .addColumn('panVertTransLevelMin', 'integer')
    .addColumn('panVertTransRandom', 'boolean', (col) => col.notNull())
    .addColumn('panStartEase', 'text')
    .addColumn('panStartExp', 'integer')
    .addColumn('panStartAmp', 'integer')
    .addColumn('panStartPer', 'integer')
    .addColumn('panStartOv', 'integer')
    .addColumn('panEndEase', 'text')
    .addColumn('panEndExp', 'integer')
    .addColumn('panEndAmp', 'integer')
    .addColumn('panEndPer', 'integer')
    .addColumn('panEndOv', 'integer')
    .addColumn('overrideIgnore', 'boolean', (col) => col.notNull())
    .addColumn('scriptScene', 'boolean', (col) => col.notNull())
    .addColumn('downloadScene', 'boolean', (col) => col.notNull())
    .addColumn('generatorMax', 'integer')
    .addColumn('persistAudio', 'boolean', (col) => col.notNull())
    .addColumn('persistText', 'boolean', (col) => col.notNull())
    .addColumn('libraryId', 'integer')
    .addColumn('audioScene', 'boolean', (col) => col.notNull())
    .addColumn('audioEnabled', 'boolean', (col) => col.notNull())
    .addColumn('audioStartIndex', 'integer')
    .addColumn('textEnabled', 'boolean', (col) => col.notNull())
    .addColumn('scriptStartIndex', 'integer')
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
  console.log('+ Create scenePlaylist table')
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
  console.log('+ Create weightGroup table')
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
  console.log('+ Create sceneColor table')
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
  console.log('+ Create libraryContentSource table')
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
  console.log('+ Create sceneContentSource table')
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
  console.log('+ Create sceneGroup table')
  return await trx.schema
    .createTable('sceneGroup')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('type', 'text', (col) => col.notNull())
    .addColumn('name', 'text', (col) => col.notNull())
    .execute()
}

const displayTable = async (trx: Kysely<DB>) => {
  console.log('+ Create display table')
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
  console.log('+ Create displayView table')
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
  console.log('+ Create audioPlaylistItem table')
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
  console.log('+ Create captionScriptPlaylistItem table')
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
  console.log('+ Create displayPlaylistItem table')
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
  console.log('+ Create displayPlaylistItemDisplay table')
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
  console.log('+ Create scenePlaylistItem table')
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
  console.log('+ Create scenePlaylistItemScene table')
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
  console.log('+ Create playlist table')
  return await trx.schema
    .createTable('playlist')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('userId', 'integer', (col) => col.notNull())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('type', 'text', (col) => col.notNull())
    .addColumn('shuffle', 'boolean', (col) => col.notNull())
    .addColumn('repeat', 'text', (col) => col.notNull())
    .addForeignKeyConstraint('FK_playlist_user_userId', ['userId'], 'user', [
      'id'
    ])
    .execute()
}

const audioTable = async (trx: Kysely<DB>) => {
  console.log('+ Create audio table')
  return await trx.schema
    .createTable('audio')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('userId', 'integer', (col) => col.notNull())
    .addColumn('url', 'text', (col) => col.notNull())
    .addColumn('marked', 'boolean', (col) => col.notNull())
    .addColumn('volume', 'integer')
    .addColumn('speed', 'integer')
    .addColumn('stopAtEnd', 'boolean', (col) => col.notNull())
    .addColumn('nextSceneAtEnd', 'boolean', (col) => col.notNull())
    .addColumn('tick', 'boolean', (col) => col.notNull())
    .addColumn('tickMode', 'text')
    .addColumn('tickDelay', 'integer')
    .addColumn('tickMinDelay', 'integer')
    .addColumn('tickMaxDelay', 'integer')
    .addColumn('tickSinRate', 'integer')
    .addColumn('tickBpmMulti', 'integer')
    .addColumn('bpm', 'integer')
    .addColumn('thumb', 'text')
    .addColumn('name', 'text')
    .addColumn('artist', 'text')
    .addColumn('album', 'text')
    .addColumn('trackNum', 'integer')
    .addColumn('duration', 'integer')
    .addColumn('comment', 'text')
    .addColumn('playedCount', 'integer')
    .addForeignKeyConstraint('FK_audio_user_userId', ['userId'], 'user', ['id'])
    .execute()
}

const audioTagTable = async (trx: Kysely<DB>) => {
  console.log('+ Create audioTag table')
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
  console.log('+ Create fontSettings table')
  return await trx.schema
    .createTable('fontSettings')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('userId', 'integer', (col) => col.notNull())
    .addColumn('color', 'text')
    .addColumn('fontSize', 'integer')
    .addColumn('fontFamily', 'text')
    .addColumn('border', 'boolean', (col) => col.notNull())
    .addColumn('borderpx', 'integer')
    .addColumn('borderColor', 'text')
    .execute()
}

const captionScriptTable = async (trx: Kysely<DB>) => {
  console.log('+ Create captionScript table')
  return await trx.schema
    .createTable('captionScript')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('userId', 'integer', (col) => col.notNull())
    .addColumn('url', 'text')
    .addColumn('script', 'text')
    .addColumn('marked', 'boolean', (col) => col.notNull())
    .addColumn('opacity', 'integer')
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
  console.log('+ Create captionScriptTag table')
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
  })
}

export async function down(db: Kysely<DB>): Promise<void> {
  return await db.transaction().execute(async (trx) => {
    console.log('- Drop fontSettings table')
    await trx.schema.dropTable('fontSettings').execute()

    console.log('- Drop audioTag table')
    await trx.schema.dropTable('audioTag').execute()

    console.log('- Drop audio table')
    await trx.schema.dropTable('audio').execute()

    console.log('- Drop displayView table')
    await trx.schema.dropTable('displayView').execute()

    console.log('- Drop display table')
    await trx.schema.dropTable('display').execute()

    console.log('- Drop scenePlaylistItemScene table')
    await trx.schema.dropTable('scenePlaylistItemScene').execute()

    console.log('- Drop scenePlaylistItem table')
    await trx.schema.dropTable('scenePlaylistItem').execute()

    console.log('- Drop displayPlaylistItemScene table')
    await trx.schema.dropTable('displayPlaylistItemScene').execute()

    console.log('- Drop displayPlaylistItem table')
    await trx.schema.dropTable('displayPlaylistItem').execute()

    console.log('- Drop captionScriptPlaylistItem table')
    await trx.schema.dropTable('captionScriptPlaylistItem').execute()

    console.log('- Drop audioPlaylistItem table')
    await trx.schema.dropTable('audioPlaylistItem').execute()

    console.log('- Drop playlist table')
    await trx.schema.dropTable('playlist').execute()

    console.log('- Drop captionScriptTag table')
    await trx.schema.dropTable('captionScriptTag').execute()

    console.log('- Drop captionScript table')
    await trx.schema.dropTable('captionScript').execute()

    console.log('- Drop libraryContentSource table')
    await trx.schema.dropTable('libraryContentSource').execute()

    console.log('- Drop sceneContentSource table')
    await trx.schema.dropTable('sceneContentSource').execute()

    console.log('- Drop sceneColor table')
    await trx.schema.dropTable('sceneColor').execute()

    console.log('- Drop weightGroup table')
    await trx.schema.dropTable('weightGroup').execute()

    console.log('- Drop scenePlaylist table')
    await trx.schema.dropTable('scenePlaylist').execute()

    console.log('- Drop scene table')
    await trx.schema.dropTable('scene').execute()

    console.log('- Drop sceneGroup table')
    await trx.schema.dropTable('sceneGroup').execute()

    console.log('- Drop contentSourceBlacklistItem table')
    await trx.schema.dropTable('contentSourceBlacklistItem').execute()

    console.log('- Drop clipTag table')
    await trx.schema.dropTable('clipTag').execute()

    console.log('- Drop clip table')
    await trx.schema.dropTable('clip').execute()

    console.log('- Drop contentSourceTag table')
    await trx.schema.dropTable('contentSourceTag').execute()

    console.log('- Drop contentSource table')
    await trx.schema.dropTable('contentSource').execute()

    console.log('- Drop theme table')
    await trx.schema.dropTable('theme').execute()

    console.log('- Drop tutorials table')
    await trx.schema.dropTable('tutorials').execute()

    console.log('- Drop generalSettings table')
    await trx.schema.dropTable('generalSettings').execute()

    console.log('- Drop ignoredTag table')
    await trx.schema.dropTable('ignoredTag').execute()

    console.log('- Drop tag table')
    await trx.schema.dropTable('tag').execute()

    console.log('- Drop displaySettings table')
    await trx.schema.dropTable('displaySettings').execute()

    console.log('- Drop cacheSettings table')
    await trx.schema.dropTable('cacheSettings').execute()

    console.log('- Drop remoteSettings table')
    await trx.schema.dropTable('remoteSettings').execute()

    console.log('- Drop user table')
    await trx.schema.dropTable('user').execute()
  })
}
