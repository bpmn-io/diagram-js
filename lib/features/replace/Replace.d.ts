/**
 * Service that allows replacing of elements.
 *
 */
export default class Replace {
  static $inject: string[];

  /**
   * @param modeling
   * @param eventBus
   */
  constructor(modeling: Modeling, eventBus: any);

  /**
   * Replace an element.
   *
   * @param oldElement The element to be replaced.
   * @param attrs Containing information about the new element, for
   * example the new bounds and type.
   * @param hints Custom hints that will be attached to the context. It
   * can be used to inject data that is needed in the command chain. For example
   * it could be used in eventbus.on('commandStack.shape.replace.postExecute') to
   * change shape attributes after shape creation.
   *
   * @return
   */
  replaceElement(oldElement: Shape, attrs: any, hints: any): Shape;
}

export type EventBus = any;
type Modeling = import('../modeling/Modeling').default;
type Shape = import('../../core/Types').ShapeLike;
