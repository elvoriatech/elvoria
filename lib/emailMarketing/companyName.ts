/** Customer-facing brand in outreach emails — same as COMPANY_NAME. */
export function marketingCompanyName(): string {
  return (process.env.COMPANY_NAME || 'Elvoria Technologies').trim();
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

  return normalizeLegacyShortBrand(out);
}

/** Upgrade saved "Elvoria Tech" copy to the full brand name. */
export function normalizeLegacyShortBrand(text: string): string {
  const brand = marketingCompanyName();
  const team = marketingCompanyTeamLabel();
  let out = text;

  out = out.replace(/\bElvoria Tech Team\b/g, team);
  out = out.replace(/\bElvoria Tech\b(?!nologies\b)/gi, brand);

  return out;
}

export function isBrandTextCorrupted(text: string): boolean {
  return /Technologies(?:nologies)+/i.test(text);
}

export function usesLegacyShortBrand(text: string): boolean {
  return /\bElvoria Tech\b(?!nologies\b)/i.test(text);
}
