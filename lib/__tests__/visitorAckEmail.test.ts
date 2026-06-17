import { isVisitorAutoReplyEnabled, sendContactFormAutoReply } from '@/lib/visitorAckEmail';
import { sendSiteHtmlEmail } from '@/lib/siteMailer';

jest.mock('@/lib/siteMailer', () => ({
  sendSiteHtmlEmail: jest.fn(),
  getContactEmail: jest.fn(() => 'contact@elvoriatech.com'),
}));

const sendSiteHtmlEmailMock = sendSiteHtmlEmail as jest.MockedFunction<typeof sendSiteHtmlEmail>;

describe('visitorAckEmail', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env, SEND_AUTOREPLY: 'true', COMPANY_NAME: 'Elvoria Technologies' };
    sendSiteHtmlEmailMock.mockReset();
    sendSiteHtmlEmailMock.mockResolvedValue({ sent: true });
  });

  afterAll(() => {
    process.env = env;
  });

  describe('isVisitorAutoReplyEnabled', () => {
    it('is true by default', () => {
      delete process.env.SEND_AUTOREPLY;
      expect(isVisitorAutoReplyEnabled()).toBe(true);
    });

    it('is false when SEND_AUTOREPLY=false', () => {
      process.env.SEND_AUTOREPLY = 'false';
      expect(isVisitorAutoReplyEnabled()).toBe(false);
    });
  });

  describe('sendContactFormAutoReply', () => {
    it('skips send when SEND_AUTOREPLY is false', async () => {
      process.env.SEND_AUTOREPLY = 'false';
      const result = await sendContactFormAutoReply({
        name: 'Jane',
        email: 'jane@example.com',
        message: 'Hello',
      });
      expect(result).toEqual({ sent: false, skipped: true });
      expect(sendSiteHtmlEmailMock).not.toHaveBeenCalled();
    });

    it('sends marketing-layout email when enabled', async () => {
      const result = await sendContactFormAutoReply({
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Need a SaaS MVP',
      });
      expect(result).toEqual({ sent: true });
      expect(sendSiteHtmlEmailMock).toHaveBeenCalledTimes(1);
      const call = sendSiteHtmlEmailMock.mock.calls[0][0];
      expect(call.to).toBe('jane@example.com');
      expect(call.subject).toContain('Elvoria Technologies');
      expect(call.html).toContain('Visit elvoriatech.com');
      expect(call.html).toContain('Jane Doe');
      expect(call.html).toContain('Need a SaaS MVP');
      expect(call.attachments?.length).toBeGreaterThanOrEqual(0);
    });

    it('returns failure detail when send fails', async () => {
      sendSiteHtmlEmailMock.mockResolvedValue({
        sent: false,
        reason: 'send_failed',
        detail: 'SMTP error',
      });
      const result = await sendContactFormAutoReply({
        name: 'Jane',
        email: 'jane@example.com',
        message: 'Hi',
      });
      expect(result).toEqual({ sent: false, detail: 'SMTP error' });
    });
  });
});
