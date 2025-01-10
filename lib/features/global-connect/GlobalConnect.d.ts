export default class GlobalConnect {
  static $inject: string[];

  /**
   * @param eventBus
   * @param dragging
   * @param connect
   * @param canvas
   * @param toolManager
   * @param rules
   * @param mouse
   */
  constructor(eventBus: EventBus, dragging: Dragging, connect: Connect, canvas: Canvas, toolManager: ToolManager, rules: Rules, mouse: Mouse);

  /**
   * Initiates tool activity.
   */
  start(event: any, autoActivate: any): void;

  toggle(): void;
  isActive(): boolean;

  /**
   * Check if source element can initiate connection.
   *
   * @param startTarget
   * @return
   */
  canStartConnect(startTarget: Element): boolean;
}

type Canvas = import('../../core/Canvas').default;
type Connect = import('../connect/Connect').default;
type Dragging = import('../dragging/Dragging').default;
type EventBus = import('../../core/EventBus').default;
type Mouse = import('../mouse/Mouse').default;
type Rules = import('../rules/Rules').default;
type ToolManager = import('../tool-manager/ToolManager').default;
type Element = import('../../model/Types').Element;
