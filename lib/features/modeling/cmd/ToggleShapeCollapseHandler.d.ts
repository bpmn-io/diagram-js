/**
 * A handler that toggles the collapsed state of an element
 * and the visibility of all its children.
 *
 */
export default class ToggleShapeCollapseHandler {
  static $inject: string[];

  /**
   * @param modeling
   */
  constructor(modeling: Modeling);

  execute(context: any): any[];
  revert(context: any): any[];
}

export type Shape = any;
type Modeling = import('../Modeling').default;
