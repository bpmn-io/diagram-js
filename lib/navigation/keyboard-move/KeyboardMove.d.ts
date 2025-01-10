/**
 * A feature that allows users to move the canvas using the keyboard.
 *
 */
export default class KeyboardMove {
  static $inject: string[];

  /**
   * @param config
   * @param keyboard
   * @param canvas
   */
  constructor(config: {
      moveSpeed?: number;
      moveSpeedAccelerated?: number;
  }, keyboard: Keyboard, canvas: Canvas);

  /**
   * @param options
   */
  moveCanvas: (options: {
      direction: 'up' | 'down' | 'left' | 'right';
      speed: number;
  }) => void;
}

type Canvas = import('../../core/Canvas').default;
type Keyboard = import('../../features/keyboard/Keyboard').default;
