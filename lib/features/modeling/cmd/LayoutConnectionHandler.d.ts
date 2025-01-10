/**
 * A handler that implements reversible moving of shapes.
 *
 */
export default class LayoutConnectionHandler {
  static $inject: string[];

  /**
   * @param layouter
   * @param canvas
   */
  constructor(layouter: Layouter, canvas: Canvas);

  execute(context: any): any;
  revert(context: any): any;
}

type Canvas = import('../../../core/Canvas').default;
type Layouter = import('../../../layout/BaseLayouter').default;
