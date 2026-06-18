import {
  getDefaultTemplates,
  buildCallInviteLineHtml,
} from '@/lib/emailMarketing/defaults';
import {
  isBrandTextCorrupted,
  marketingCompanyName,
  repairCorruptedBrandText,
} from '@/lib/emailMarketing/companyName';
import { elvoriaConsultationScheduleUrl } from '@/lib/emailMarketing/siteUrl';

describe('emailMarketing company branding', () => {
  const env = process.env;

  afterEach(() => {
    process.env = env;
  });

  it('uses MARKETING_BRAND_NAME in default template subjects', () => {
    process.env = { ...env, MARKETING_BRAND_NAME: 'Acme Corp' };
    const templates = getDefaultTemplates();
    expect(templates.initial.subject).toBe('Quick intro for [Company Name] — Acme Corp');
  });

  it('defaults to Elvoria Tech for customer-facing outreach', () => {
    process.env = { ...env };
    delete process.env.MARKETING_BRAND_NAME;
    delete process.env.COMPANY_NAME;
    expect(marketingCompanyName()).toBe('Elvoria Tech');
    expect(getDefaultTemplates().initial.subject).toContain('Elvoria Tech');
  });

  it('repairs cascading Technologiesnologies corruption', () => {
    expect(repairCorruptedBrandText('Elvoria Technologiesnologiesnologies Team')).toBe(
      'Elvoria Tech Team'
    );
    expect(isBrandTextCorrupted('Elvoria Technologiesnologies')).toBe(true);
  });

  it('links call invite to consultation schedule URL', () => {
    delete process.env.MARKETING_SITE_URL;
    delete process.env.SITE_URL;
    const html = buildCallInviteLineHtml();
    expect(html).toContain(elvoriaConsultationScheduleUrl());
    expect(html).toContain('schedule=consultation');
  });
});
