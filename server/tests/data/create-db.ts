import path from 'path';
import db from '../../src/db/database'

void async function() {
    process.env.USERNAME = 'admin'
    process.env.PASSWORD = 'admin'
    process.env.SAVE_DIR = path.join(process.cwd(), 'tests', 'data')
    await db().migrateToLatest()

    await db().query()
        .updateTable('user')
        .set({tokenValue: '987654', tokenExpiry: 9223372036854775807})
        .where('username', '=', process.env.USERNAME)
        .execute()
  }();