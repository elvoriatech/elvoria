import {
  buildFullMarketingEmailHtml,
  escapeHtml,
  normalizeMarketingBodyHtml,
} from '@/lib/emailMarketing/emailLayout';

describe('emailMarketing emailLayout', () => {
  describe('escapeHtml', () => {
    it('escapes HTML special characters', () => {
      expect(escapeHtml(`<script>"'&</script>`)).toBe(
        '&lt;script&gt;&quot;&#039;&amp;&lt;/script&gt;'
      );
    });
  });

  describe('normalizeMarketingBodyHtml', () => {
    it('returns placeholder for empty fragment', () => {
      expect(normalizeMarketingBodyHtml('')).toContain('(Empty message)');
    });

    it('adds inline styles to paragraph tags', () => {
      const html = normalizeMarketingBodyHtml('<p>Hello</p>');
      expect(html).toContain('color:#334155');
      expect(html).toContain('Hello');
    });
  });

  describe('buildFullMarketingEmailHtml', () => {
    it('wraps body with outreach header, CTA, and footer', () => {
      const html = buildFullMarketingEmailHtml('<p>Hi [First Name],</p>', {
        logoSrc: 'cid:elvoria-logo',
        preheader: 'Test preheader',
      });
      expect(html).toContain('Visit elvoria.tech');
      expect(html).toContain('AI-First Digital');
      expect(html).toContain('cid:elvoria-logo');
      expect(html).toContain('GDPR-aware engineering');
      expect(html).toContain('Test preheader');
    });
  });
});
