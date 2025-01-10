/**
 * Basic grid snapping that covers connecting, creating, moving, resizing shapes, moving bendpoints
 * and connection segments.
 *
 */
export default class GridSnapping {
  static $inject: string[];

  /**
   * @param elementRegistry
   * @param eventBus
   * @param config
   */
  constructor(elementRegistry: ElementRegistry, eventBus: EventBus, config: any);

  /**
   * Snap an events x or y with optional min, max and offset.
   *
   * @param event
   * @param axis
   */
  snapEvent(event: any, axis: string): void;

  /**
   * Expose grid spacing for third parties (i.e. extensions).
   *
   * @return spacing of grid dots
   */
  getGridSpacing(): number;

  /**
   * Snap value with optional min, max and offset.
   *
   * @param value
   * @param options
   */
  snapValue(value: number, options: {
      min?: number;
      max?: number;
      offset?: number;
  }): number;

  isActive(): any;
  setActive(active: any): void;
  active: any;
  toggleActive(): void;
}

type ElementRegistry = import('../../core/ElementRegistry').default;
type EventBus = import('../../core/EventBus').default;
