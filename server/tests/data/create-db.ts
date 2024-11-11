import path from 'path';
import db from '../../src/db/database'

void async function() {
    process.env.FF_USERNAME = 'admin'
    process.env.FF_PASSWORD = 'admin'
    process.env.FF_SAVE_DIR = path.join(process.cwd(), 'tests', 'data')
    await db().migrateToLatest()

    await db().query()
        .updateTable('user')
        .set({tokenValue: '987654', tokenExpiry: 9223372036854775807})
        .where('username', '=', process.env.FF_USERNAME)
        .execute()
  }();