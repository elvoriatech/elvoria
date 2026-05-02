import type { ProposalDraft } from './proposalSchema';

type Estimate = {
  effortHours: { min: number; max: number };
  timelineWeeks: { min: number; max: number };
  budgetEur: { min: number; max: number };
  assumptions: string[];
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function estimateRough(draft: ProposalDraft): Estimate {
  // Very simple MVP estimator: points from features, multiplied by scope factors.
  // Support team can refine later; this keeps output consistent.
  const baseFeaturePoints = clamp(draft.mustHave.length * 3 + draft.niceToHave.length * 1, 6, 120);

  const platformCount = Object.values(draft.platforms).filter(Boolean).length;
  const platformMultiplier = platformCount <= 1 ? 1.0 : platformCount === 2 ? 1.6 : 2.1;

  const integrationsMultiplier =
    draft.integrations.length === 0 ? 1.0 : draft.integrations.length <= 2 ? 1.15 : 1.35;

  const securityMultiplier =
    draft.nonFunctional.securityLevel === 'basic'
      ? 1.0
      : draft.nonFunctional.securityLevel === 'standard'
        ? 1.2
        : 1.45;

  const unknownsMultiplier =
    draft.project.summary.trim().length < 40 || draft.mustHave.length < 4 ? 1.2 : 1.0;

  const points = baseFeaturePoints * platformMultiplier * integrationsMultiplier * securityMultiplier * unknownsMultiplier;

  // Convert "points" to hours range using a simple linear mapping.
  const hoursMin = Math.round(points * 6);
  const hoursMax = Math.round(points * 10);

  // Timeline depends on team size. Assume 2–3 dev capacity equivalent.
  const weeksMin = Math.max(3, Math.round(hoursMin / 60));
  const weeksMax = Math.max(4, Math.round(hoursMax / 45));

  const hourlyRateEur = Number(process.env.ESTIMATOR_HOURLY_RATE_EUR || '55');
  const budgetMin = Math.round(hoursMin * hourlyRateEur);
  const budgetMax = Math.round(hoursMax * hourlyRateEur);

  return {
    effortHours: { min: hoursMin, max: hoursMax },
    timelineWeeks: { min: weeksMin, max: weeksMax },
    budgetEur: { min: budgetMin, max: budgetMax },
    assumptions: [
      'Rough estimate only; final quote after a short discovery phase.',
      `Hourly rate used for estimate: €${hourlyRateEur}/hour (configurable).`,
    ],
  };
}

