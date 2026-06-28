/** Admissions per minute when event.queue_admission_rate is unset */
export const DEFAULT_QUEUE_ADMISSION_RATE = 10;

/** Cookie: queue session token — value `{eventId}:{token}` */
export const QUEUE_TOKEN_COOKIE = "frontrowly_queue_token";

/** Cookie: admitted to shop — value `{eventId}:{token}` */
export const QUEUE_ADMIT_COOKIE = "frontrowly_queue_admit";

/** Admission pass lifetime (seconds) */
export const QUEUE_ADMIT_TTL_SECONDS = 2 * 60 * 60;
