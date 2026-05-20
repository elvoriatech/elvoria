export type EmailTemplateType = 'initial' | 'follow_up_1' | 'follow_up_2';

export type RecipientStatus = 'not_sent' | 'sent' | 'replied';

export type EmailTemplate = {
  templateType: EmailTemplateType;
  subject: string;
  bodyHtml: string;
  updatedAt: string;
};

export type EmailRecipient = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  industry: string;
  notes: string;
  status: RecipientStatus;
  autoFollowUp: boolean;
  initialSentAt: string | null;
  followUp1SentAt: string | null;
  followUp2SentAt: string | null;
  repliedAt: string | null;
  lastTemplateType: EmailTemplateType | null;
  createdAt: string;
  updatedAt: string;
};

export type EmailCampaign = {
  id: string;
  templateType: EmailTemplateType;
  autoFollowUp: boolean;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
};

export type EmailSendLog = {
  id: string;
  campaignId: string | null;
  recipientId: string | null;
  templateType: EmailTemplateType;
  email: string;
  status: 'sent' | 'failed';
  errorMessage: string;
  sentAt: string;
};

export const TEMPLATE_LABELS: Record<EmailTemplateType, string> = {
  initial: 'Initial outreach',
  follow_up_1: 'Follow-up (2–3 days)',
  follow_up_2: 'Final follow-up',
};
