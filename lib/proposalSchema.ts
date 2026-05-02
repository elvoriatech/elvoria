export type ProposalDraft = {
  project: {
    summary: string;
    targetUsers?: string;
    region?: string;
    languages?: string[];
  };
  platforms: { web: boolean; ios: boolean; android: boolean; desktop: boolean };
  mustHave: string[];
  niceToHave: string[];
  integrations: string[];
  nonFunctional: {
    securityLevel: 'basic' | 'standard' | 'high';
    scaleTarget: 'mvp' | 'growth' | 'enterprise';
    compliance: string[];
  };
  keyFlows: string[];
  assumptions: string[];
  outOfScope: string[];
  risks: string[];
  /** Free-form bullets from the chat (decisions, constraints, Q&A) for the final document */
  additionalContext: string[];
};

export const emptyDraft: ProposalDraft = {
  project: { summary: '' },
  platforms: { web: false, ios: false, android: false, desktop: false },
  mustHave: [],
  niceToHave: [],
  integrations: [],
  nonFunctional: { securityLevel: 'standard', scaleTarget: 'mvp', compliance: [] },
  keyFlows: [],
  assumptions: [],
  outOfScope: [],
  risks: [],
  additionalContext: [],
};

export function normalizeDraft(partial: Partial<ProposalDraft> | null | undefined): ProposalDraft {
  return {
    ...emptyDraft,
    ...partial,
    project: { ...emptyDraft.project, ...partial?.project },
    platforms: { ...emptyDraft.platforms, ...partial?.platforms },
    nonFunctional: { ...emptyDraft.nonFunctional, ...partial?.nonFunctional },
    mustHave: partial?.mustHave ?? emptyDraft.mustHave,
    niceToHave: partial?.niceToHave ?? emptyDraft.niceToHave,
    integrations: partial?.integrations ?? emptyDraft.integrations,
    keyFlows: partial?.keyFlows ?? emptyDraft.keyFlows,
    assumptions: partial?.assumptions ?? emptyDraft.assumptions,
    outOfScope: partial?.outOfScope ?? emptyDraft.outOfScope,
    risks: partial?.risks ?? emptyDraft.risks,
    additionalContext: partial?.additionalContext ?? emptyDraft.additionalContext,
  };
}

export function readiness(draft: ProposalDraft) {
  const missing: string[] = [];
  if (!draft.project.summary?.trim()) missing.push('project.summary');
  if (!Object.values(draft.platforms).some(Boolean)) missing.push('platforms');
  if (!draft.mustHave || draft.mustHave.length < 3) missing.push('mustHave (>= 3 items)');
  if (!draft.keyFlows || draft.keyFlows.length < 1) missing.push('keyFlows (>= 1 flow)');
  if (!draft.nonFunctional?.securityLevel) missing.push('nonFunctional.securityLevel');
  if (!draft.nonFunctional?.scaleTarget) missing.push('nonFunctional.scaleTarget');

  const score = Math.max(0, 100 - missing.length * 15);
  return { score, missing };
}

