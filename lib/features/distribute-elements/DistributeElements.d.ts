/**
 * Groups and filters elements and then trigger even distribution.
 *
 */
export default class DistributeElements {
  static $inject: string[];

  /**
   * @param modeling
   * @param rules
   */
  constructor(modeling: Modeling, rules: Rules);

  /**
   * Registers filter functions that allow external parties to filter
   * out certain elements.
   *
   * @param filterFn
   */
  registerFilter(filterFn: (distributableElements: Element[], axis: Axis, dimension: Dimension) => Element[]): void;

  /**
   * Distributes the elements with a given orientation
   *
   * @param elements
   * @param orientation
   */
  trigger(elements: Element[], orientation: string): Group[];
}

type Element = import('../../model/Types').Element;
type Axis = import('../../util/Types').Axis;
type Dimension = import('../../util/Types').Dimension;
type Rect = import('../../util/Types').Rect;
type Modeling = import('../modeling/Modeling').default;
type Rules = import('../rules/Rules').default;

export type Range = {
    min: number;
    max: number;
};

export type Group = {
    elements: Element[];
    range: Range;
};
