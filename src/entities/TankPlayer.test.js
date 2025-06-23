import { TankPlayer } from './TankPlayer.js';

describe('TankPlayer', () => {
  let tankPlayer;
  const initialTankID = 'TestTank';
  const initialDirection = 'w';
  const initialIsUser = 0;

  beforeEach(() => {
    tankPlayer = new TankPlayer(initialTankID, initialDirection, initialIsUser);
  });

  describe('constructor', () => {
    it('should initialize properties correctly', () => {
      expect(tankPlayer.tankName).toBe(initialTankID);
      expect(tankPlayer.direction).toBe(initialDirection);
      expect(tankPlayer.isPlayer).toBe(initialIsUser);
      expect(tankPlayer.destCook).toBe(33);
      expect(tankPlayer.destX).toBe(6); // Default initial grid X
      expect(tankPlayer.destY).toBe(4); // Default initial grid Y
      expect(tankPlayer.destW).toBe(33);
      expect(tankPlayer.destH).toBe(33);
      expect(tankPlayer.arc).toBe(0); // Default arc (facing right, though initialDirection 'w' will change it)
                                      // Note: constructor sets direction, but arc isn't updated until rotationAP
                                      // This is a nuance: arc's initial value is 0 from Player, then TankPlayer's
                                      // rotationAP would be the first thing to set it based on 'w', 'a', 's', 'd'.
                                      // For 'w' (up), arc becomes 270. For 'd' (right), arc becomes 0.
                                      // The constructor itself doesn't call rotationAP.

      expect(tankPlayer.X).toBe(6 * 33);
      expect(tankPlayer.Y).toBe(4 * 33);
      expect(tankPlayer.centerX).toBe((6 * 33) + (33 * 0.5));
      expect(tankPlayer.centerY).toBe((4 * 33) + (33 * 0.5));
      expect(tankPlayer.speedM).toBe(6);
      expect(tankPlayer.per).toBe(6 / 60);
      expect(tankPlayer.animSheet).toBeNull(); // Inherited from Player
    });
  });

  describe('updateSelfCoor', () => {
    it('should update X, Y, centerX, centerY based on destX and destY', () => {
      tankPlayer.destX = 10;
      tankPlayer.destY = 5;
      tankPlayer.updateSelfCoor();
      expect(tankPlayer.X).toBe(10 * 33);
      expect(tankPlayer.Y).toBe(5 * 33);
      expect(tankPlayer.centerX).toBe((10 * 33) + (33 * 0.5));
      expect(tankPlayer.centerY).toBe((5 * 33) + (33 * 0.5));
    });
  });

  describe('rotationAP', () => {
    let mockCmd;

    beforeEach(() => {
      mockCmd = { nextX: 0, nextY: 0, stop: false }; // Simulate active movement
      // Set an initial direction and arc consistent with it for some tests
      tankPlayer.direction = 'd'; // Facing right
      tankPlayer.arc = 0;
    });

    it('should update arc and direction, and set the correct cmd component for the new direction', () => {
      // Simulate cmd as APWatcher would prepare it (already zeroed) before calling rotationAP
      mockCmd.nextX = 0;
      mockCmd.nextY = 0;
      // tankPlayer.direction is 'd' from beforeEach

      tankPlayer.rotationAP('w', mockCmd); // Change to 'w' (up)

      expect(tankPlayer.direction).toBe('w');
      expect(tankPlayer.arc).toBe(270);
      expect(mockCmd.nextX).toBe(0); // Should remain 0 as 'w' movement doesn't affect nextX
      expect(mockCmd.nextY).toBe(-tankPlayer.per); // Correctly set for 'w' movement.
    });

    it('should set cmd.nextY to -this.per for "w" when direction is already "w"', () => {
      tankPlayer.direction = 'w'; // Ensure current direction is 'w'
      tankPlayer.arc = 270;
      tankPlayer.rotationAP('w', mockCmd);
      expect(mockCmd.nextY).toBe(-tankPlayer.per);
      expect(mockCmd.nextX).toBe(0);
    });

    it('should set cmd.nextY to this.per for "s" when direction is already "s"', () => {
      tankPlayer.direction = 's';
      tankPlayer.arc = 90;
      tankPlayer.rotationAP('s', mockCmd);
      expect(mockCmd.nextY).toBe(tankPlayer.per);
      expect(mockCmd.nextX).toBe(0);
    });

    it('should set cmd.nextX to -this.per for "a" when direction is already "a"', () => {
      tankPlayer.direction = 'a';
      tankPlayer.arc = 180;
      tankPlayer.rotationAP('a', mockCmd);
      expect(mockCmd.nextX).toBe(-tankPlayer.per);
      expect(mockCmd.nextY).toBe(0);
    });

    it('should set cmd.nextX to this.per for "d" when direction is already "d"', () => {
      tankPlayer.direction = 'd';
      tankPlayer.arc = 0;
      tankPlayer.rotationAP('d', mockCmd);
      expect(mockCmd.nextX).toBe(tankPlayer.per);
      expect(mockCmd.nextY).toBe(0);
    });

    it('should increment animSheet.orderIndex if moving in the same direction and animSheet exists', () => {
      tankPlayer.animSheet = { orderIndex: 0 }; // Mock animSheet
      tankPlayer.direction = 'd';
      tankPlayer.arc = 0;
      mockCmd.stop = false; // Ensure movement is active

      tankPlayer.rotationAP('d', mockCmd);
      expect(tankPlayer.animSheet.orderIndex).toBe(1);
    });

    it('should NOT increment animSheet.orderIndex if animSheet is null', () => {
      tankPlayer.animSheet = null;
      tankPlayer.direction = 'd';
      tankPlayer.arc = 0;
      mockCmd.stop = false;

      expect(() => tankPlayer.rotationAP('d', mockCmd)).not.toThrow();
      // animSheet is null, so no orderIndex to check or increment
    });

    it('should NOT set cmd.nextX/Y if cmd.stop is true', () => {
      tankPlayer.direction = 'd';
      tankPlayer.arc = 0;
      mockCmd.stop = true; // Movement is stopped

      tankPlayer.rotationAP('d', mockCmd);
      expect(mockCmd.nextX).toBe(0); // Should remain 0 as it was initialized
      expect(mockCmd.nextY).toBe(0); // Should remain 0
    });
  });
});
