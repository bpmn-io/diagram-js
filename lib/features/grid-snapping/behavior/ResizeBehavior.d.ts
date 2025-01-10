/**
 * Integrates resizing with grid snapping.
 *
 */
export default class ResizeBehavior extends CommandInterceptor {
  /**
   * @param eventBus
   * @param gridSnapping
   */
  constructor(eventBus: EventBus, gridSnapping: GridSnapping);

  /**
   * Snap width and height in relation to center.
   *
   * @param shape
   * @param newBounds
   *
   * @return Snapped bounds.
   */
  snapSimple(shape: Shape, newBounds: Rect): Rect;

  /**
   * Snap x, y, width and height according to given directions.
   *
   * @param newBounds
   * @param directions - Directions as {n|w|s|e}.
   *
   * @return Snapped bounds.
   */
  snapComplex(newBounds: Rect, directions: string): Rect;

  /**
   * Snap in one or both directions horizontally.
   *
   * @param newBounds
   * @param directions - Directions as {n|w|s|e}.
   *
   * @return Snapped bounds.
   */
  snapHorizontally(newBounds: Rect, directions: string): Rect;

  /**
   * Snap in one or both directions vertically.
   *
   * @param newBounds
   * @param directions - Directions as {n|w|s|e}.
   *
   * @return Snapped bounds.
   */
  snapVertically(newBounds: Rect, directions: string): Rect;
}

type Shape = import('../../../model/Types').Shape;
type Rect = import('../../../util/Types').Rect;
type EventBus = import('../../../core/EventBus').default;
type GridSnapping = import('../../grid-snapping/GridSnapping').default;
import CommandInterceptor from '../../../command/CommandInterceptor';
