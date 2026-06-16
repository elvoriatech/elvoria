/** Returns true when a pg error indicates the table does not exist. */
export function isPostgrestMissingTableError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const o = err as { code?: string; message?: string };
  // pg error code 42P01 = undefined_table
  return (
    o.code === '42P01' ||
    (typeof o.message === 'string' && o.message.includes('does not exist'))
  );
}

export class CrmSchemaNotAppliedError extends Error {
  constructor() {
    super(
      'CRM tables are missing. Run the SQL schema files against your PostgreSQL database, then reload this page.'
    );
    this.name = 'CrmSchemaNotAppliedError';
  }
}

export function throwIfDbError(error: unknown): void {
  if (!error) return;
  if (isPostgrestMissingTableError(error)) {
    throw new CrmSchemaNotAppliedError();
  }
  throw error;
}
