export function isPostgrestMissingTableError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const o = err as { code?: string; message?: string };
  return (
    o.code === 'PGRST205' ||
    (typeof o.message === 'string' &&
      (o.message.includes('schema cache') || o.message.includes('Could not find the table')))
  );
}

export class CrmSchemaNotAppliedError extends Error {
  constructor() {
    super(
      'CRM tables are missing in Supabase. Open SQL Editor and run the full supabase/crm_schema.sql file, then reload this page.'
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
