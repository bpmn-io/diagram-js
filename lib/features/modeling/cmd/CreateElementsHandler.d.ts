export default class CreateElementsHandler {
  static $inject: string[];

  /**
   * @param modeling
   */
  constructor(modeling: Modeling);

  preExecute(context: any): void;
}

type Modeling = import('../Modeling').default;
