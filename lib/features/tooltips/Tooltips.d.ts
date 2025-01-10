/**
 * A service that allows users to render tool tips on the diagram.
 *
 * The tooltip service will take care of updating the tooltip positioning
 * during navigation + zooming.
 *
 * @example
 *
 * ```javascript
 *
 * // add a pink badge on the top left of the shape
 * tooltips.add({
 *   position: {
 *     x: 50,
 *     y: 100
 *   },
 *   html: '<div style="width: 10px; background: fuchsia; color: white;">0</div>'
 * });
 *
 * // or with optional life span
 * tooltips.add({
 *   position: {
 *     top: -5,
 *     left: -5
 *   },
 *   html: '<div style="width: 10px; background: fuchsia; color: white;">0</div>',
 *   ttl: 2000
 * });
 *
 * // remove a tool tip
 * var id = tooltips.add(...);
 *
 * tooltips.remove(id);
 * ```
 *
 */
export default class Tooltips {
  static $inject: string[];

  /**
   * @param eventBus
   * @param canvas
   */
  constructor(eventBus: EventBus, canvas: Canvas);

  /**
   * Adds an HTML tooltip to the diagram.
   *
   * @param tooltip
   *
   * @return ID of the tooltip.
   */
  add(tooltip: Tooltip): string;

  /**
   * @param action
   * @param event
   */
  trigger(action: string, event: Event): void;

  /**
   * Get tooltip with given ID.
   *
   * @param id
   *
   * @return
   */
  get(id: Tooltip | string): Tooltip | undefined;

  /**
   * @param tooltip
   */
  clearTimeout(tooltip: Tooltip): void;

  /**
   * @param tooltip
   */
  setTimeout(tooltip: Tooltip): void;

  /**
   * Remove tooltip with given ID.
   *
   * @param id
   */
  remove(id: string | Tooltip): void;

  show(): void;
  hide(): void;
}

type Canvas = import('../../core/Canvas').default;
type EventBus = import('../../core/EventBus').default;
type RectTRBL = import('../../util/Types').RectTRBL;

export type Tooltip = {
    html: string | HTMLElement;
    position: RectTRBL;
    show?: {
        minZoom?: number;
        maxZoom?: number;
    };
    timeout?: number;
};

import Ids from '../../util/IdGenerator';
