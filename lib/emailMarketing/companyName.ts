/** Customer-facing brand in outreach emails (distinct from legal COMPANY_NAME). */
export function marketingCompanyName(): string {
  return (process.env.MARKETING_BRAND_NAME || 'Elvoria Tech').trim();
}

export function marketingCompanyTeamLabel(): string {
  return `${marketingCompanyName()} Team`;
}

/** Fix cascading rename corruption (e.g. Elvoria Technologiesnologiesnologies). */
export function repairCorruptedBrandText(text: string): string {
  const brand = marketingCompanyName();
  const team = marketingCompanyTeamLabel();
  let out = text;

  out = out.replace(/Elvoria Technologies(?:nologies)+(?: Team)?/gi, (match) =>
    /team/i.test(match) ? team : brand
  );
  out = out.replace(/\bElvoria Technologies Team\b/g, team);
  out = out.replace(/\bElvoria Technologies\b/g, brand);

  return out;
}

export function isBrandTextCorrupted(text: string): boolean {
  return /Technologies(?:nologies)+/i.test(text);
}
