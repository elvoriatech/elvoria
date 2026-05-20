import {
  CrmNotConfiguredError,
  deleteLeadById,
  listLeadsForAdmin,
  upsertLeadForConversation,
  type CrmLeadRow,
} from '@/lib/crmStore';

export type SupportLeadSource =
  | 'proposal_widget'
  | 'contact_technical_proposal'
  | 'hero_start_project'
  | 'hero_build_together'
  | 'contact_start_project';

export type SupportLeadRecord = {
  id: string;
  conversationId: string;
  /** ISO 8601 UTC when the lead was saved */
  timestamp: string;
  source: SupportLeadSource;
  fullName: string;
  email: string;
  company: string;
  phone: string;
};

const VALID_SOURCES = new Set<SupportLeadSource>([
  'proposal_widget',
  'contact_technical_proposal',
  'hero_start_project',
  'hero_build_together',
  'contact_start_project',
]);

function toRecord(row: CrmLeadRow): SupportLeadRecord {
  return {
    id: row.id,
    conversationId: row.conversationId,
    timestamp: row.timestamp,
    source: row.source,
    fullName: row.fullName,
    email: row.email,
    company: row.company,
    phone: row.phone,
  };
}

export async function readSupportLeads(): Promise<SupportLeadRecord[]> {
  const leads = await listLeadsForAdmin();
  return leads.map(toRecord);
}

export async function appendSupportLead(
  record: Omit<SupportLeadRecord, 'timestamp' | 'id'> & {
    timestamp?: string;
    id?: string;
  }
): Promise<SupportLeadRecord> {
  const source = VALID_SOURCES.has(record.source) ? record.source : 'proposal_widget';
  const row = await upsertLeadForConversation({
    conversationId: record.conversationId,
    source,
    fullName: record.fullName,
    email: record.email,
    company: record.company,
    phone: record.phone || '',
  });
  return toRecord(row);
}

export async function deleteSupportLeadById(leadId: string): Promise<boolean> {
  return deleteLeadById(leadId);
}

export { CrmNotConfiguredError };
