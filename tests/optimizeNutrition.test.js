import { optimizeNutrition } from '../App.jsx';

describe('optimizeNutrition', () => {
  it('returns expected plan for 24h feeding', () => {
    const result = optimizeNutrition({
      usedBW: 60,
      formulaInfo: { kcal: 2.0, protein: 0.072 },
      hoursPerDay: 24
    });
    expect(result.rate).toBe(32);
    expect(result.supp).toBe(2);
  });

  it('handles 15h schedules', () => {
    const result = optimizeNutrition({
      usedBW: 50,
      formulaInfo: { kcal: 1.5, protein: 0.095 },
      hoursPerDay: 15
    });
    expect(result.rate).toBe(60);
    expect(result.supp).toBe(0);
  });

  it('keeps rate and supplement within allowed range', () => {
    const res = optimizeNutrition({
      usedBW: 30,
      formulaInfo: { kcal: 1.0, protein: 0.045 },
      hoursPerDay: 24
    });
    expect(res.rate).toBeGreaterThanOrEqual(5);
    expect(res.rate).toBeLessThanOrEqual(200);
    expect(res.supp).toBeGreaterThanOrEqual(0);
    expect(res.supp).toBeLessThanOrEqual(6);
  });
});
