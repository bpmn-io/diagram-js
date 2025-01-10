/**
 * Enables to move selection with keyboard arrows.
 * Use with Shift for modified speed (default=1, with Shift=10).
 * Pressed Cmd/Ctrl turns the feature off.
 *
 */
export default class KeyboardMoveSelection {
  static $inject: string[];

  /**
   * @param config
   * @param keyboard
   * @param modeling
   * @param rules
   * @param selection
   */
  constructor(config: {
      moveSpeed?: number;
      moveSpeedAccelerated?: number;
  }, keyboard: Keyboard, modeling: Modeling, rules: Rules, selection: Selection);

  /**
   * Move selected elements in the given direction,
   * optionally specifying accelerated movement.
   *
   * @param direction
   * @param accelerated
   */
  moveSelection: (direction: string, accelerated?: boolean) => void;
}

type Keyboard = import('../keyboard/Keyboard').default;
type Modeling = import('../modeling/Modeling').default;
type Rules = import('../rules/Rules').default;
type Selection = import('../selection/Selection').default;
