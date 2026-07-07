import { isEmergency, CheckIn, PainLevel } from './check-in.model';

const baseCheckIn: Partial<CheckIn> = {
  painLevel:     4 as PainLevel,
  bodyLocations: ['upper_belly'],
  symptoms:      [{ categoryId: 'abdominal', typeId: 'sharp' }],
  onset:         'today',
};

describe('isEmergency', () => {
  it('returns false when pain < 4', () => {
    expect(isEmergency({ ...baseCheckIn, painLevel: 3 as PainLevel })).toBe(false);
    expect(isEmergency({ ...baseCheckIn, painLevel: 2 as PainLevel })).toBe(false);
  });

  it('returns false when pain is 4 but no emergency indicators', () => {
    expect(isEmergency(baseCheckIn)).toBe(false);
  });

  it('returns true when pain is 4 and onset is just_now', () => {
    expect(isEmergency({ ...baseCheckIn, onset: 'just_now' })).toBe(true);
  });

  it('returns true when pain is 4 and 3+ body locations', () => {
    expect(isEmergency({
      ...baseCheckIn,
      bodyLocations: ['upper_belly', 'lower_belly', 'left_side'],
    })).toBe(true);
  });

  it('returns true when pain is 4 and burning symptom present', () => {
    expect(isEmergency({
      ...baseCheckIn,
      symptoms: [{ categoryId: 'abdominal', typeId: 'burning' }],
    })).toBe(true);
  });

  it('returns false when no data provided', () => {
    expect(isEmergency({})).toBe(false);
  });
});
