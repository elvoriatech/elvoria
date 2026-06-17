import { NextRequest } from 'next/server';
import { POST } from '@/app/api/contact/route';

jest.mock('node:fs', () => ({
  existsSync: jest.fn(() => false),
}));

jest.mock('@/lib/siteMailer', () => ({
  isSiteMailConfigured: jest.fn(),
  getContactEmail: jest.fn(() => 'contact@elvoria.tech'),
  sendSiteHtmlEmail: jest.fn(),
}));

jest.mock('@/lib/visitorAckEmail', () => ({
  isVisitorAutoReplyEnabled: jest.fn(() => true),
  sendContactFormAutoReply: jest.fn(),
}));

import { isSiteMailConfigured, sendSiteHtmlEmail } from '@/lib/siteMailer';
import { sendContactFormAutoReply } from '@/lib/visitorAckEmail';

const isSiteMailConfiguredMock = isSiteMailConfigured as jest.MockedFunction<
  typeof isSiteMailConfigured
>;
const sendSiteHtmlEmailMock = sendSiteHtmlEmail as jest.MockedFunction<typeof sendSiteHtmlEmail>;
const sendContactFormAutoReplyMock = sendContactFormAutoReply as jest.MockedFunction<
  typeof sendContactFormAutoReply
>;

function postContact(body: Record<string, unknown>) {
  return POST(
    new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  );
}

describe('POST /api/contact', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isSiteMailConfiguredMock.mockReturnValue(true);
    sendSiteHtmlEmailMock.mockResolvedValue({ sent: true });
    sendContactFormAutoReplyMock.mockResolvedValue({ sent: true });
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await postContact({ name: 'Jane', email: 'jane@example.com' });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Missing required fields/i);
    expect(sendSiteHtmlEmailMock).not.toHaveBeenCalled();
  });

  it('returns 500 when mail is not configured', async () => {
    isSiteMailConfiguredMock.mockReturnValue(false);
    const res = await postContact({
      name: 'Jane',
      email: 'jane@example.com',
      message: 'Hello',
    });
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toMatch(/not configured/i);
  });

  it('sends staff email and auto-reply on success', async () => {
    const res = await postContact({
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'Project inquiry',
      company: 'Acme',
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.autoReplySent).toBe(true);
    expect(sendSiteHtmlEmailMock).toHaveBeenCalledTimes(1);
    expect(sendContactFormAutoReplyMock).toHaveBeenCalledWith({
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'Project inquiry',
    });
  });

  it('returns 500 when staff email fails', async () => {
    sendSiteHtmlEmailMock.mockResolvedValue({
      sent: false,
      reason: 'send_failed',
      detail: 'EAUTH',
    });
    const res = await postContact({
      name: 'Jane',
      email: 'jane@example.com',
      message: 'Hello',
    });
    expect(res.status).toBe(500);
    expect(sendContactFormAutoReplyMock).not.toHaveBeenCalled();
  });
});
