/**
 * A popup menu to show a number of actions on the canvas.
 *
 */
export default class PopupMenu {
  static $inject: string[];

  /**
   * @param config
   * @param eventBus
   * @param canvas
   * @param search
   */
  constructor(config: PopupMenuConfig, eventBus: EventBus, canvas: Canvas, search: search);

  /**
   * Open the popup menu at the given position.
   *
   * @param target
   * @param providerId
   * @param position
   * @param options
   */
  open(target: PopupMenuTarget, providerId: string, position: Point, options?: any): void;

  /**
   * Refresh the popup menu entries without changing the target or position.
   */
  refresh(): void;

  close(): void;
  reset(): void;

  /**
   * Check whether there are no popup menu providers or provided entries for the
   * given target.
   *
   * @param target
   * @param providerId
   *
   * @return
   */
  isEmpty(target: PopupMenuTarget, providerId: string): boolean;

  /**
   * Register a popup menu provider with the given priority. See
   * {@link PopupMenuProvider} for examples.
   *
   * @param id
   * @param priority
   * @param provider
   */
  registerProvider(id: string, priority: number, provider: PopupMenuProvider): void;

  /**
   *
   * Register a popup menu provider with default priority. See
   * {@link PopupMenuProvider} for examples.
   *
   * @param id
   * @param provider
   */
  registerProvider(id: string, provider: PopupMenuProvider): void;

  /**
   * Check if the popup menu is open.
   *
   * @return
   */
  isOpen(): boolean;

  /**
   * Trigger an action associated with an entry.
   *
   * @param event
   * @param entry
   * @param action
   *
   * @return
   */
  trigger(event: Event, entry: PopupMenuEntry, action?: string): any;
}

type Canvas = import('../../core/Canvas').default;
type EventBus = import('../../core/EventBus').default;
export type search = typeof import("../search/search").default;
type Point = import('../../util/Types').Point;
type PopupMenuEntries = import('./PopupMenuProvider').PopupMenuEntries;
type PopupMenuEntry = import('./PopupMenuProvider').PopupMenuEntry;
type PopupMenuHeaderEntries = import('./PopupMenuProvider').PopupMenuHeaderEntries;
type PopupMenuHeaderEntry = import('./PopupMenuProvider').PopupMenuHeaderEntry;
type PopupMenuProvider = import('./PopupMenuProvider').default;
type Element = import('../../model/Types').Element;

export type PopupMenuConfig = {
    scale?: {
        min?: number;
        max?: number;
    } | boolean;
};

/**
 * ;
 */
export type PopupMenuTarget = Element | Element[];
