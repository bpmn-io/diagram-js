/**
 * Add or remove space by moving and resizing elements.
 *
 */
export default class SpaceTool {
  static $inject: string[];

  /**
   * @param canvas
   * @param dragging
   * @param eventBus
   * @param modeling
   * @param rules
   * @param toolManager
   * @param mouse
   */
  constructor(canvas: Canvas, dragging: Dragging, eventBus: EventBus, modeling: Modeling, rules: Rules, toolManager: ToolManager, mouse: Mouse);

  /**
   * Activate space tool selection.
   *
   * @param event
   * @param autoActivate
   * @param reactivate
   */
  activateSelection(event: MouseEvent | TouchEvent, autoActivate: boolean, reactivate: boolean): void;

  /**
   * Activate space tool make space.
   *
   * @param event
   */
  activateMakeSpace(event: MouseEvent | TouchEvent): void;

  /**
   * Make space.
   *
   * @param movingShapes
   * @param resizingShapes
   * @param delta
   * @param direction
   * @param start
   */
  makeSpace(movingShapes: Array<Shape>, resizingShapes: Array<Shape>, delta: Point, direction: Direction, start: number): void;

  /**
   * Initialize make space and return true if that was successful.
   *
   * @param event
   * @param context
   *
   * @return
   */
  init(event: MouseEvent | TouchEvent, context: any): boolean;

  /**
   * Get elements to be moved and resized.
   *
   * @param elements
   * @param axis
   * @param delta
   * @param start
   *
   * @return
   */
  calculateAdjustments(elements: Array<Shape>, axis: Axis, delta: Point, start: number): any;

  toggle(): void;
  isActive(): boolean;
}

type Shape = import('../../core/Types').ShapeLike;
type Canvas = import('../../core/Canvas').default;
type Dragging = import('../dragging/Dragging').default;
type EventBus = import('../../core/EventBus').default;
type Modeling = import('../modeling/Modeling').default;
type Mouse = import('../mouse/Mouse').default;
type Rules = import('../rules/Rules').default;
type ToolManager = import('../tool-manager/ToolManager').default;
type Axis = import('../../util/Types').Axis;
type Direction = import('../../util/Types').Direction;
type Point = import('../../util/Types').Point;
