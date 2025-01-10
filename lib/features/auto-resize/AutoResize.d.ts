/**
 * An auto resize component that takes care of expanding a parent element
 * if child elements are created or moved close the parents edge.
 *
 */
export default class AutoResize extends CommandInterceptor {
  /**
   * @param eventBus
   * @param elementRegistry
   * @param modeling
   * @param rules
   */
  constructor(eventBus: EventBus, elementRegistry: ElementRegistry, modeling: Modeling, rules: Rules);

  /**
   * Get the amount to expand the given shape in each direction.
   *
   * @param shape
   *
   * @return
   */
  getOffset(shape: Shape): RectTRBL;

  /**
   * Get the activation threshold for each side for which
   * resize triggers.
   *
   * @param shape
   *
   * @return
   */
  getPadding(shape: Shape): RectTRBL;

  /**
   * Perform the actual resize operation.
   *
   * @param shape
   * @param newBounds
   * @param hints
   */
  resize(shape: Shape, newBounds: Rect, hints?: {
      autoResize?: string;
  }): void;
}

type Element = import('../../model/Types').Element;
type Shape = import('../../model/Types').Shape;
type Direction = import('../../util/Types').Direction;
type Rect = import('../../util/Types').Rect;
type RectTRBL = import('../../util/Types').RectTRBL;
type ElementRegistry = import('../../core/ElementRegistry').default;
type EventBus = import('../../core/EventBus').default;
type Modeling = import('../modeling/Modeling').default;
type Rules = import('../rules/Rules').default;
import CommandInterceptor from '../../command/CommandInterceptor';
