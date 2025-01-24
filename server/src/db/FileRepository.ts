import fs from 'fs'
import path from 'path'
import stream from 'stream'
import crypto, { randomUUID } from 'crypto'
import { Kysely } from 'kysely'
import { DB } from './types/generated'
import { getThumbsDir } from '../utils'
import db from './database'

async function getFileHash(path: string) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256')
    const rs = fs.createReadStream(path)
    rs.on('error', reject)
    rs.on('data', (chunk) => hash.update(chunk))
    rs.on('end', () => resolve(hash.digest('hex')))
  })
}

async function findFileIdByPath(path: string, trx: Kysely<DB>) {
  const file = await trx
    .selectFrom('file')
    .select('id')
    .where('path', '=', path)
    .executeTakeFirst()
  return file?.id
}

export async function insertThumb(
  userId: number,
  path: string,
  trx: Kysely<DB>
) {
  return await trx
    .insertInto('file')
    .values({
      userId,
      path,
      publicId: randomUUID()
    })
    .returning('id')
    .executeTakeFirst()
    .then((value) => value?.id as number)
}

export async function createThumb(
  userId: number,
  thumb: string,
  trx?: Kysely<DB>
) {
  const hash = await getFileHash(thumb)
  const extension = thumb.split('.').pop ?? ''
  const thumbPath = path.join(getThumbsDir(), `${hash}.${extension}`)

  const conn = trx ?? db().query()
  const id = await findFileIdByPath(thumbPath, conn)
  if (id != null) {
    return id
  }

  await fs.promises.copyFile(thumb, thumbPath)
  return await conn
    .insertInto('file')
    .values({
      userId,
      publicId: randomUUID(),
      path: thumbPath
    })
    .returning('id')
    .executeTakeFirst()
    .then((value) => value?.id as number)
}

export async function createThumbFromMetadata(
  userId: number,
  path: string,
  trx?: Kysely<DB>
) {
  const conn = trx ?? db().query()
  const id = await findFileIdByPath(path, conn)
  if (id != null) {
    return id
  }

  return await insertThumb(userId, path, conn)
}
