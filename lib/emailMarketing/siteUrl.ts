/** Public marketing site URL (customer-facing emails and links). */
export function elvoriaWebsiteUrl(): string {
  const raw = (
    process.env.MARKETING_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    'https://elvoriatech.com'
  ).trim();
  return raw.endsWith('/') ? raw : `${raw}/`;
}

export function elvoriaWebsiteBase(): string {
  return elvoriaWebsiteUrl().replace(/\/$/, '');
}

/** Hostname shown as link text in emails (e.g. elvoriatech.com). */
export function elvoriaWebsiteHostname(): string {
  try {
    return new URL(elvoriaWebsiteUrl()).hostname;
  } catch {
    return 'elvoriatech.com';
  }
}

/** Opens the "Schedule a free consultation" modal on the homepage. */
export function elvoriaConsultationScheduleUrl(): string {
  return `${elvoriaWebsiteBase()}/?schedule=consultation`;
}

export const SCHEDULE_CONSULTATION_QUERY = 'schedule=consultation';
