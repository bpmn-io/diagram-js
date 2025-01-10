export default class AlignElements {
  static $inject: string[];

  /**
   * @param modeling
   * @param rules
   */
  constructor(modeling: Modeling, rules: Rules);

  /**
   * Align elements on relevant axis for given alignment.
   *
   * @param elements
   * @param type
   */
  trigger(elements: Element[], type: Alignment): void;
}

type Element = import('../../model/Types').Element;
type Modeling = import('../modeling/Modeling').default;
type Rules = import('../rules/Rules').default;
type Axis = import('../../util/Types').Axis;
type Dimension = import('../../util/Types').Dimension;
export type Alignment = 'top' | 'right' | 'bottom' | 'left' | 'center' | 'middle';
