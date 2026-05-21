import { applyTemplateVars, recipientToVars } from '@/lib/emailMarketing/templateVars';

describe('emailMarketing templateVars', () => {
  describe('recipientToVars', () => {
    it('extracts first name from contact name', () => {
      expect(
        recipientToVars({
          contactName: 'Sarah Chen',
          companyName: 'Acme GmbH',
          industry: 'SaaS',
        })
      ).toEqual({
        firstName: 'Sarah',
        companyName: 'Acme GmbH',
        industry: 'SaaS',
      });
    });

    it('uses fallbacks for empty fields', () => {
      expect(
        recipientToVars({
          contactName: '   ',
          companyName: '',
          industry: '',
        })
      ).toEqual({
        firstName: 'there',
        companyName: 'your company',
        industry: 'your industry',
      });
    });
  });

  describe('applyTemplateVars', () => {
    it('replaces placeholders case-insensitively', () => {
      const vars = { firstName: 'Alex', companyName: 'Beta AG', industry: 'FinTech' };
      const text = 'Hi [First Name], we help [Company Name] in [Industry].';
      expect(applyTemplateVars(text, vars)).toBe('Hi Alex, we help Beta AG in FinTech.');
    });
  });
});
