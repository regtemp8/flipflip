import db from './database'
import { Tutorials, User } from './types/generated'

export async function findTutorials(user: User): Promise<Tutorials> {
  return await db()
    .query()
    .selectFrom('tutorials as t')
    .selectAll()
    .where('t.userId', '=', user.id)
    .executeTakeFirstOrThrow()
}
