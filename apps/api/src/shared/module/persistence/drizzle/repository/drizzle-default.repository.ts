import { eq, InferSelectModel } from 'drizzle-orm'
import { AnyPgColumn, AnyPgTable, PgInsertValue } from 'drizzle-orm/pg-core'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { DefaultModel } from 'src/shared/core/model/default.model'

export abstract class DrizzleDefaultRepository<
  M extends DefaultModel,
  T extends AnyPgTable & { id: AnyPgColumn },
> {
  constructor(
    protected readonly db: PostgresJsDatabase<NonNullable<unknown>>,
    protected readonly table: T,
  ) {}

  async create(model: M): Promise<void> {
    await this.db
      .insert(this.table)
      .values(model as PgInsertValue<T>)
      .execute()
  }

  async findById(id: string): Promise<M | null> {
    const res = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
    if (res.length === 0) return null
    return this.mapToModel(res[0] as InferSelectModel<T>)
  }

  protected abstract mapToModel(data: InferSelectModel<T>): M

  async deleteAll(): Promise<void> {
    if (process.env.NODE_ENV === 'test') {
      await this.db.delete(this.table).execute()
    }
  }
}
