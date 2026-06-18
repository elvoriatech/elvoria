/** Brand name for outreach templates — driven by COMPANY_NAME in .env. */
export function marketingCompanyName(): string {
  return (process.env.COMPANY_NAME || 'Elvoria Technologies').trim();
}

export function marketingCompanyTeamLabel(): string {
  return `${marketingCompanyName()} Team`;
}

/** Known legacy brand strings stored in em_templates before the rename. */
export const LEGACY_MARKETING_BRAND_NAMES = [
  'Elvoria Tech',
  'Elvoriatech',
  'Elvoria Tech Team',
  'Elvoriatech Team',
] as const;
