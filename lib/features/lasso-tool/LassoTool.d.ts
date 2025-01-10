export default class LassoTool {
  static $inject: string[];

  /**
   * @param eventBus
   * @param canvas
   * @param dragging
   * @param elementRegistry
   * @param selection
   * @param toolManager
   * @param mouse
   */
  constructor(eventBus: EventBus, canvas: Canvas, dragging: Dragging, elementRegistry: ElementRegistry, selection: Selection, toolManager: ToolManager, mouse: Mouse);

  /**
   * Activate lasso.
   *
   * @param event
   * @param autoActivate
   */
  activateLasso(event: MouseEvent, autoActivate?: boolean): void;

  /**
   * Activate selection.
   *
   * @param event
   * @param autoActivate
   */
  activateSelection(event: MouseEvent, autoActivate?: boolean): void;

  /**
   * Select elements within the given bounds.
   *
   * @param elements
   * @param bbox
   * @param previousSelection
   */
  select(elements: Element[], bbox: Rect, previousSelection?: Element[]): void;

  /**
   * Toggle the lasso tool.
   */
  toggle(): void;

  /**
   * Check if the lasso tool is active.
   *
   * @returns
   */
  isActive(): boolean;
}

type Canvas = import('../../core/Canvas').default;
type Dragging = import('../dragging/Dragging').default;
type ElementRegistry = import('../../core/ElementRegistry').default;
type EventBus = import('../../core/EventBus').default;
type Mouse = import('../mouse/Mouse').default;
type Selection = import('../selection/Selection').default;
type ToolManager = import('../tool-manager/ToolManager').default;
type Rect = import('../../util/Types').Rect;
