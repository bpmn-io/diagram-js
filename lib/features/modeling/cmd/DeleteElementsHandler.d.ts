export default class DeleteElementsHandler {
  static $inject: string[];

  /**
   * @param modeling
   * @param elementRegistry
   */
  constructor(modeling: Modeling, elementRegistry: ElementRegistry);

  postExecute(context: any): void;
}

type ElementRegistry = import('../../../core/ElementRegistry').default;
type Modeling = import('../Modeling').default;
