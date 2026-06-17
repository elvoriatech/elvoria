/** Official site — only marketing URL used in templates and the rich-text link action. */
export const ELVORIA_WEBSITE_URL = 'https://elvoria.tech/';

/** Colored logo for gradient email header (admin preview). */
export const ELVORIA_LOGO_PREVIEW_URL = 'https://elvoria.tech/elvoria.png';

/** Admin UI: companies per page. */
export const RECIPIENTS_PAGE_SIZE = 500;

/** PostgREST default max rows per request — use for internal fetch-all loops. */
export const POSTGREST_FETCH_PAGE = 1000;

/** Max IDs per `.in()` query when loading recipients for send. */
export const RECIPIENT_IDS_CHUNK = 200;

/** Pause between send chunks to reduce Gmail rate-limit errors. */
export const SEND_RECIPIENTS_CHUNK = 50;

export const SEND_CHUNK_DELAY_MS = 1200;

/** sessionStorage key for cross-tab recipient selection (Companies → Campaigns). */
export const CAMPAIGN_RECIPIENT_SELECTION_KEY = 'elvoria:email-marketing:selected-recipient-ids';

/** sessionStorage key for active background send job id. */
export const ACTIVE_SEND_JOB_STORAGE_KEY = 'elvoria:email-marketing:active-send-job-id';

/** Emails per worker invocation (keep under Vercel function timeout). */
export const SEND_JOB_BATCH_SIZE = 30;

/** Default client poll interval when a job is running (ms). */
export const SEND_JOB_POLL_MS = 3000;
