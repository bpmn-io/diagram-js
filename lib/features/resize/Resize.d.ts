export function getReferencePoint(shape: any, direction: any): {
    x: number;
    y: number;
};

/**
 * A component that provides resizing of shapes on the canvas.
 *
 * The following components are part of shape resize:
 *
 *  * adding resize handles,
 *  * creating a visual during resize
 *  * checking resize rules
 *  * committing a change once finished
 *
 *
 * ## Customizing
 *
 * It's possible to customize the resizing behaviour by intercepting 'resize.start'
 * and providing the following parameters through the 'context':
 *
 *   * minDimensions ({ width, height }): minimum shape dimensions
 *
 *   * childrenBoxPadding ({ left, top, bottom, right } || number):
 *     gap between the minimum bounding box and the container
 *
 * f.ex:
 *
 * ```javascript
 * eventBus.on('resize.start', 1500, function(event) {
 *   var context = event.context,
 *
 *  context.minDimensions = { width: 140, height: 120 };
 *
 *  // Passing general padding
 *  context.childrenBoxPadding = 30;
 *
 *  // Passing padding to a specific side
 *  context.childrenBoxPadding.left = 20;
 * });
 * ```
 *
 */
export default class Resize {
  static $inject: string[];

  /**
   * @param eventBus
   * @param rules
   * @param modeling
   * @param dragging
   */
  constructor(eventBus: EventBus, rules: Rules, modeling: Modeling, dragging: Dragging);

  canResize(context: any): boolean;

  /**
   * Activate a resize operation.
   *
   * You may specify additional contextual information and must specify a
   * resize direction during activation of the resize event.
   *
   * @param event
   * @param shape
   * @param contextOrDirection
   */
  activate(event: MouseEvent | TouchEvent, shape: Shape, contextOrDirection: any | Direction): void;

  computeMinResizeBox(context: any): import("../../util/Types").Rect;
}

type Shape = import('../../core/Types').ShapeLike;
type Direction = import('../../util/Types').Direction;
type Point = import('../../util/Types').Point;
type EventBus = import('../../core/EventBus').default;
type Dragging = import('../dragging/Dragging').default;
type Modeling = import('../modeling/Modeling').default;
type Rules = import('../rules/Rules').default;
