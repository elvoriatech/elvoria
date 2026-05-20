export type TemplateVars = {
  firstName: string;
  companyName: string;
  industry: string;
};

export function recipientToVars(r: {
  contactName: string;
  companyName: string;
  industry: string;
}): TemplateVars {
  const full = r.contactName.trim();
  const firstName = full.split(/\s+/)[0] || 'there';
  return {
    firstName,
    companyName: r.companyName.trim() || 'your company',
    industry: r.industry.trim() || 'your industry',
  };
}

export function applyTemplateVars(text: string, vars: TemplateVars): string {
  return text
    .replace(/\[First Name\]/gi, vars.firstName)
    .replace(/\[Company Name\]/gi, vars.companyName)
    .replace(/\[Industry\]/gi, vars.industry);
}
