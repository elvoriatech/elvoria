import { NextRequest } from 'next/server';
import { POST } from '@/app/api/support-lead/route';

jest.mock('@/lib/supportLeads', () => ({
  appendSupportLead: jest.fn(),
  CrmNotConfiguredError: class CrmNotConfiguredError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'CrmNotConfiguredError';
    }
  },
}));

jest.mock('@/lib/visitorAckEmail', () => ({
  isVisitorAutoReplyEnabled: jest.fn(() => true),
  sendSupportLeadAutoReply: jest.fn(),
}));

import { appendSupportLead } from '@/lib/supportLeads';
import { sendSupportLeadAutoReply } from '@/lib/visitorAckEmail';

const appendSupportLeadMock = appendSupportLead as jest.MockedFunction<typeof appendSupportLead>;
const sendSupportLeadAutoReplyMock = sendSupportLeadAutoReply as jest.MockedFunction<
  typeof sendSupportLeadAutoReply
>;

const validConversationId = '030798ee-577b-4d62-8b2f-5e955c7ddb9c';

function postSupportLead(body: Record<string, unknown>) {
  return POST(
    new NextRequest('http://localhost/api/support-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  );
}

describe('POST /api/support-lead', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    appendSupportLeadMock.mockResolvedValue(undefined);
    sendSupportLeadAutoReplyMock.mockResolvedValue({ sent: true });
  });

  it('returns 400 for invalid conversationId', async () => {
    const res = await postSupportLead({
      conversationId: 'not-a-uuid',
      fullName: 'Jane',
      email: 'jane@example.com',
      company: 'Acme',
    });
    expect(res.status).toBe(400);
    expect(appendSupportLeadMock).not.toHaveBeenCalled();
  });

  it('returns 400 when email is invalid', async () => {
    const res = await postSupportLead({
      conversationId: validConversationId,
      fullName: 'Jane',
      email: 'not-an-email',
      company: 'Acme',
    });
    expect(res.status).toBe(400);
  });

  it('saves lead and sends auto-reply', async () => {
    const res = await postSupportLead({
      conversationId: validConversationId,
      fullName: 'Jane Doe',
      email: 'Jane@Example.COM',
      company: 'Acme GmbH',
      phone: '+49123',
      source: 'proposal_widget',
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.autoReplySent).toBe(true);
    expect(appendSupportLeadMock).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: validConversationId,
        email: 'jane@example.com',
        fullName: 'Jane Doe',
        company: 'Acme GmbH',
      })
    );
    expect(sendSupportLeadAutoReplyMock).toHaveBeenCalledWith({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      company: 'Acme GmbH',
    });
  });
});
