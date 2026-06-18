import {
  getDefaultTemplates,
  buildCallInviteLineHtml,
} from '@/lib/emailMarketing/defaults';
import {
  isBrandTextCorrupted,
  marketingCompanyName,
  normalizeLegacyShortBrand,
  repairCorruptedBrandText,
} from '@/lib/emailMarketing/companyName';
import { elvoriaConsultationScheduleUrl } from '@/lib/emailMarketing/siteUrl';

describe('emailMarketing company branding', () => {
  const env = process.env;

  afterEach(() => {
    process.env = env;
  });

  it('uses COMPANY_NAME in default template subjects', () => {
    process.env = { ...env, COMPANY_NAME: 'Acme Corp' };
    const templates = getDefaultTemplates();
    expect(templates.initial.subject).toBe('Quick intro for [Company Name] — Acme Corp');
  });

  it('defaults to Elvoria Technologies for customer-facing outreach', () => {
    process.env = { ...env };
    delete process.env.COMPANY_NAME;
    expect(marketingCompanyName()).toBe('Elvoria Technologies');
    expect(getDefaultTemplates().initial.subject).toContain('Elvoria Technologies');
  });

  it('uses COMPANY_NAME for footer and body brand', () => {
    process.env = { ...env, COMPANY_NAME: 'Elvoria Technologies' };
    expect(marketingCompanyName()).toBe('Elvoria Technologies');
    expect(getDefaultTemplates().initial.bodyHtml).toContain('Elvoria Technologies');
  });

  it('repairs cascading Technologiesnologies corruption', () => {
    expect(repairCorruptedBrandText('Elvoria Technologiesnologiesnologies Team')).toBe(
      'Elvoria Technologies Team'
    );
    expect(isBrandTextCorrupted('Elvoria Technologiesnologies')).toBe(true);
  });

  it('upgrades legacy Elvoria Tech to Elvoria Technologies', () => {
    expect(normalizeLegacyShortBrand("I'm reaching out from Elvoria Tech,")).toContain(
      'Elvoria Technologies'
    );
  });

  it('links call invite to consultation schedule URL', () => {
    delete process.env.MARKETING_SITE_URL;
    delete process.env.SITE_URL;
    const html = buildCallInviteLineHtml();
    expect(html).toContain(elvoriaConsultationScheduleUrl());
    expect(html).toContain('schedule=consultation');
  });
});
