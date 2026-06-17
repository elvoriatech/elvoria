import {
  createSiteMailer,
  formatMailSendError,
  getCampaignSentCopyBcc,
  getContactEmail,
  isSiteMailConfigured,
  normalizeMailPassword,
} from '@/lib/siteMailer';

describe('siteMailer', () => {
  const env = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...env };
  });

  afterAll(() => {
    process.env = env;
  });

  describe('normalizeMailPassword', () => {
    it('strips spaces from Google app passwords', () => {
      expect(normalizeMailPassword('abcd efgh ijkl mnop')).toBe('abcdefghijklmnop');
    });

    it('returns empty string for undefined', () => {
      expect(normalizeMailPassword(undefined)).toBe('');
    });
  });

  describe('getContactEmail', () => {
    it('uses CONTACT_EMAIL when set', () => {
      process.env.CONTACT_EMAIL = 'hello@example.com';
      expect(getContactEmail()).toBe('hello@example.com');
    });

    it('falls back to default contact address', () => {
      delete process.env.CONTACT_EMAIL;
      expect(getContactEmail()).toBe('contact@elvoriatech.com');
    });
  });

  describe('createSiteMailer / isSiteMailConfigured', () => {
    it('is not configured when env vars are missing', () => {
      delete process.env.EMAIL_SERVICE;
      delete process.env.EMAIL_USER;
      delete process.env.EMAIL_PASSWORD;
      expect(isSiteMailConfigured()).toBe(false);
      expect(createSiteMailer()).toEqual({ ok: false });
    });

    it('is configured with formatted From when env is set', () => {
      process.env.EMAIL_SERVICE = 'gmail';
      process.env.EMAIL_USER = 'contact@elvoriatech.com';
      process.env.EMAIL_PASSWORD = 'apppassword16chars';
      process.env.COMPANY_NAME = 'Elvoria Tech';

      const kit = createSiteMailer();
      expect(kit.ok).toBe(true);
      if (kit.ok) {
        expect(kit.from).toBe('Elvoria Tech <contact@elvoriatech.com>');
      }
      expect(isSiteMailConfigured()).toBe(true);
    });
  });

  describe('getCampaignSentCopyBcc', () => {
    it('defaults to EMAIL_USER when unset', () => {
      delete process.env.EMAIL_CAMPAIGN_BCC;
      process.env.EMAIL_USER = 'sender@example.com';
      expect(getCampaignSentCopyBcc()).toBe('sender@example.com');
    });

    it('returns undefined when EMAIL_CAMPAIGN_BCC=false', () => {
      process.env.EMAIL_CAMPAIGN_BCC = 'false';
      expect(getCampaignSentCopyBcc()).toBeUndefined();
    });

    it('uses explicit EMAIL_CAMPAIGN_BCC address', () => {
      process.env.EMAIL_CAMPAIGN_BCC = 'archive@example.com';
      expect(getCampaignSentCopyBcc()).toBe('archive@example.com');
    });
  });

  describe('formatMailSendError', () => {
    it('maps Gmail auth errors (gsmtp) to App Password guidance', () => {
      const msg = formatMailSendError(
        'Invalid login: 535-5.7.8 Username and Password not accepted ... gsmtp'
      );
      expect(msg).toContain('Google App Password');
    });

    it('maps Gmail auth errors to App Password guidance when EMAIL_SERVICE=gmail', () => {
      process.env.EMAIL_SERVICE = 'gmail';
      const msg = formatMailSendError('Invalid login: 535-5.7.8 Username and Password not accepted');
      expect(msg).toContain('Google App Password');
    });

    it('maps custom SMTP (IONOS) auth errors to generic guidance with detail', () => {
      delete process.env.EMAIL_SERVICE;
      const msg = formatMailSendError('Invalid login: 535 Authentication credentials invalid');
      expect(msg).toContain('SMTP login rejected');
      expect(msg).toContain('535');
    });

    it('passes through unknown errors', () => {
      expect(formatMailSendError('timeout')).toBe('timeout');
    });
  });
});
