import {
  gardenLevelForCount,
  aquariumLevelForCount,
  newlyUnlockedStickers,
  GARDEN_THRESHOLDS,
  AQUARIUM_THRESHOLDS,
} from './reward.model';

describe('reward.model helpers', () => {

  describe('gardenLevelForCount', () => {
    it('returns 0 for 0 check-ins', () => {
      expect(gardenLevelForCount(0)).toBe(0);
    });

    it('returns 1 at threshold 2', () => {
      expect(gardenLevelForCount(2)).toBe(1);
    });

    it('returns 2 at threshold 5', () => {
      expect(gardenLevelForCount(5)).toBe(2);
    });

    it('returns max level at 80+', () => {
      expect(gardenLevelForCount(80)).toBe(10);
      expect(gardenLevelForCount(200)).toBe(10);
    });

    it('stays at current level between thresholds', () => {
      expect(gardenLevelForCount(3)).toBe(1);
      expect(gardenLevelForCount(4)).toBe(1);
    });
  });

  describe('aquariumLevelForCount', () => {
    it('returns 0 for 0 check-ins', () => {
      expect(aquariumLevelForCount(0)).toBe(0);
    });

    it('returns 1 at first fish milestone (1)', () => {
      expect(aquariumLevelForCount(1)).toBe(1);
    });

    it('returns max level at 85+', () => {
      expect(aquariumLevelForCount(85)).toBe(10);
    });
  });

  describe('newlyUnlockedStickers', () => {
    it('returns empty array when no new milestones crossed', () => {
      expect(newlyUnlockedStickers(2, 2)).toEqual([]);
    });

    it('unlocks first_checkin sticker at 0→1', () => {
      const earned = newlyUnlockedStickers(0, 1);
      expect(earned.some(s => s.id === 'first_checkin')).toBe(true);
    });

    it('unlocks multiple stickers when crossing multiple milestones', () => {
      const earned = newlyUnlockedStickers(0, 5);
      expect(earned.length).toBeGreaterThanOrEqual(2);
    });

    it('does not re-unlock already unlocked stickers', () => {
      const earned = newlyUnlockedStickers(5, 6);
      expect(earned.some(s => s.milestone <= 5)).toBe(false);
    });
  });
});
