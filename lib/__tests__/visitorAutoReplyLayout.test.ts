import {
  buildVisitorAutoReplyHtml,
  visitorAutoReplyInfoBox,
  visitorAutoReplySignOff,
} from '@/lib/visitorAutoReplyLayout';

describe('visitorAutoReplyLayout', () => {
  it('uses marketing shell with logo cid', () => {
    const html = buildVisitorAutoReplyHtml('<p>Thanks for your inquiry.</p>', 'We received your message');
    expect(html).toContain('cid:elvoria-logo');
    expect(html).toContain('Visit elvoriatech.com');
    expect(html).toContain('Thanks for your inquiry');
  });

  it('renders sign-off with brand link', () => {
    const signOff = visitorAutoReplySignOff();
    expect(signOff).toContain('Elvoria Tech Team');
    expect(signOff).toContain('elvoriatech.com');
  });

  it('renders info box with light card styles', () => {
    const box = visitorAutoReplyInfoBox('Your message', 'Hello world');
    expect(box).toContain('Your message');
    expect(box).toContain('Hello world');
    expect(box).toContain('#f8fafc');
  });
});
