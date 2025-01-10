/**
 * A handler that implements reversible attaching/detaching of shapes.
 *
 */
export default class UpdateAttachmentHandler {
  static $inject: string[];

  /**
   * @param modeling
   */
  constructor(modeling: Modeling);

  execute(context: any): any;
  revert(context: any): any;
}

type Modeling = import('../Modeling').default;
