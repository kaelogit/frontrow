export interface QueueAdmissionInput {
  position: number;
  joinedAtMs: number;
  queueStartMs: number;
  admissionsPerMinute: number;
  totalWaiting: number;
}

export interface QueueAdmissionResult {
  admitted: boolean;
  position: number;
  totalWaiting: number;
  admittedUpTo: number;
  /** 0–100 for progress bar */
  progressPercent: number;
  estimatedWaitSeconds: number;
}

export function admissionsIntervalMs(ratePerMinute: number): number {
  const rate = Math.max(1, ratePerMinute);
  return Math.ceil(60_000 / rate);
}

export function computeAdmission(input: QueueAdmissionInput): QueueAdmissionResult {
  const interval = admissionsIntervalMs(input.admissionsPerMinute);
  const elapsed = Math.max(0, Date.now() - input.queueStartMs);
  const admittedUpTo = 1 + Math.floor(elapsed / interval);
  const admitted = input.position <= admittedUpTo;

  const intervalsUntilAdmit = Math.max(0, input.position - admittedUpTo);
  const estimatedWaitSeconds = admitted
    ? 0
    : Math.ceil((intervalsUntilAdmit * interval) / 1000);

  const waitTotal = Math.max(1, input.position * interval);
  const waitElapsed = Math.max(0, Date.now() - input.joinedAtMs);
  let progressPercent: number;

  if (admitted) {
    progressPercent = 100;
  } else {
    const timeProgress = (waitElapsed / waitTotal) * 88;
    const positionProgress = (admittedUpTo / input.position) * 88;
    progressPercent = Math.min(92, Math.max(8, Math.max(timeProgress, positionProgress)));
  }

  return {
    admitted,
    position: input.position,
    totalWaiting: input.totalWaiting,
    admittedUpTo,
    progressPercent: Math.round(progressPercent),
    estimatedWaitSeconds,
  };
}
