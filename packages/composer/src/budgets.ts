// SPEC-002 §5 — budgets & the cognitive-load fitter's law.

export interface Budgets {
  maxLiveElements: number; // default 7 (GENESIS Law 1 / methodology cap)
  maxMarginSlots: number; // default 2 (GENESIS 04-VI, C-5)
  maxClocks: number; // default 4 visible; profile-overridable — DM WORLD = Infinity (M3, §6.2)
  paintP50Ms: number; // 80 (CI budget)
  paintP95Ms: number; // 120 (CI budget)
}

export const DEFAULT_BUDGETS: Budgets = {
  maxLiveElements: 7,
  maxMarginSlots: 2,
  maxClocks: 4,
  paintP50Ms: 80,
  paintP95Ms: 120,
};

export function withBudgetOverrides(base: Budgets, overrides?: Partial<Budgets>): Budgets {
  return overrides ? { ...base, ...overrides } : base;
}
