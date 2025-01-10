/**
 * A handler that distributes elements evenly.
 *
 */
export default class DistributeElements {
  static $inject: string[];

  /**
   * @param modeling
   */
  constructor(modeling: Modeling);

  preExecute(context: any): void;
  postExecute(context: any): void;
}

type Modeling = import('../Modeling').default;
