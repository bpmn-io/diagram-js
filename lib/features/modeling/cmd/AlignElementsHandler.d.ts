/**
 * A handler that align elements in a certain way.
 *
 */
export default class AlignElements {
  static $inject: string[];

  /**
   * @param modeling
   * @param canvas
   */
  constructor(modeling: Modeling, canvas: Canvas);

  preExecute(context: any): void;
  postExecute(context: any): void;
}

type Canvas = import('../../../core/Canvas').default;
type Modeling = import('../Modeling').default;
