import { getDefaultTemplates } from '@/lib/emailMarketing/defaults';
import { marketingCompanyName } from '@/lib/emailMarketing/companyName';

describe('emailMarketing company branding', () => {
  const env = process.env;

  afterEach(() => {
    process.env = env;
  });

  it('uses COMPANY_NAME in default template subjects', () => {
    process.env = { ...env, COMPANY_NAME: 'Acme Corp' };
    const templates = getDefaultTemplates();
    expect(templates.initial.subject).toBe('Quick intro for [Company Name] — Acme Corp');
    expect(templates.follow_up_1.subject).toBe('Following up with [Company Name] — Acme Corp');
    expect(templates.follow_up_2.subject).toBe('Last follow-up for [Company Name] — Acme Corp');
  });

  it('falls back to Elvoria Technologies when COMPANY_NAME is unset', () => {
    process.env = { ...env };
    delete process.env.COMPANY_NAME;
    expect(marketingCompanyName()).toBe('Elvoria Technologies');
    expect(getDefaultTemplates().initial.subject).toContain('Elvoria Technologies');
  });
});
