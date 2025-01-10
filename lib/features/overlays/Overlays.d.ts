/**
 * A service that allows users to attach overlays to diagram elements.
 *
 * The overlay service will take care of overlay positioning during updates.
 *
 * @example
 *
 * ```javascript
 * // add a pink badge on the top left of the shape
 *
 * overlays.add(someShape, {
 *   position: {
 *     top: -5,
 *     left: -5
 *   },
 *   html: '<div style="width: 10px; background: fuchsia; color: white;">0</div>'
 * });
 *
 * // or add via shape id
 *
 * overlays.add('some-element-id', {
 *   position: {
 *     top: -5,
 *     left: -5
 *   }
 *   html: '<div style="width: 10px; background: fuchsia; color: white;">0</div>'
 * });
 *
 * // or add with optional type
 *
 * overlays.add(someShape, 'badge', {
 *   position: {
 *     top: -5,
 *     left: -5
 *   }
 *   html: '<div style="width: 10px; background: fuchsia; color: white;">0</div>'
 * });
 * ```
 *
 * ```javascript
 * // remove an overlay
 *
 * var id = overlays.add(...);
 * overlays.remove(id);
 *
 *
 * You may configure overlay defaults during tool by providing a `config` module
 * with `overlays.defaults` as an entry:
 *
 * {
 *   overlays: {
 *     defaults: {
 *       show: {
 *         minZoom: 0.7,
 *         maxZoom: 5.0
 *       },
 *       scale: {
 *         min: 1
 *       }
 *     }
 * }
 * ```
 *
 */
export default class Overlays {
  static $inject: string[];

  /**
   * @param config
   * @param eventBus
   * @param canvas
   * @param elementRegistry
   */
  constructor(config: OverlaysConfig, eventBus: EventBus, canvas: Canvas, elementRegistry: ElementRegistry);

  /**
   * Returns the overlay with the specified ID or a list of overlays
   * for an element with a given type.
   *
   * @example
   *
   * ```javascript
   * // return the single overlay with the given ID
   * overlays.get('some-id');
   *
   * // return all overlays for the shape
   * overlays.get({ element: someShape });
   *
   * // return all overlays on shape with type 'badge'
   * overlays.get({ element: someShape, type: 'badge' });
   *
   * // shape can also be specified as ID
   * overlays.get({ element: 'element-id', type: 'badge' });
   * ```
   *
   * @param search The filter to be used to find the overlay(s).
   *
   * @return The overlay(s).
   */
  get(search: OverlaysFilter): Overlay | Overlay[];

  /**
   * Adds an HTML overlay to an element.
   *
   * @param element The element to add the overlay to.
   * @param overlay The overlay.
   *
   * @return The overlay's ID that can be used to get or remove it.
   */
  add(element: Element | string, overlay: OverlayAttrs): string;

  /**
   * Adds an HTML overlay to an element.
   *
   * @param element The element to add the overlay to.
   * @param type An optional type that can be used to filter.
   * @param overlay The overlay.
   *
   * @return The overlay's ID that can be used to get or remove it.
   */
  add(element: Element | string, type: string, overlay: OverlayAttrs): string;

  /**
   * Remove an overlay with the given ID or all overlays matching the given filter.
   *
   * @see Overlays#get for filter options.
   *
   * @param filter The filter to be used to find the overlay.
   */
  remove(filter: OverlaysFilter): void;

  /**
   * Checks whether overlays are shown.
   *
   * @return Whether overlays are shown.
   */
  isShown(): boolean;

  /**
   * Show all overlays.
   */
  show(): void;

  /**
   * Hide all overlays.
   */
  hide(): void;

  /**
   * Remove all overlays and their container.
   */
  clear(): void;
}

type Canvas = import('../../core/Canvas').default;
type ElementRegistry = import('../../core/ElementRegistry').default;
type EventBus = import('../../core/EventBus').default;
type Element = import('../../model/Types').Element;

export type OverlaysConfigShow = {
    minZoom?: number;
    maxZoom?: number;
};

export type OverlaysConfigScale = {
    min?: number;
    max?: number;
};

export type Overlay = {
    id: string;
    type: string | null;
    element: Element | string;
} & OverlayAttrs;

export type OverlayAttrs = {
    html: HTMLElement | string;
    position: {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
    };
} & OverlaysConfigDefault;

export type OverlayContainer = {
    html: HTMLElement;
    element: Element;
    overlays: Overlay[];
};

export type OverlaysConfig = {
    defaults?: OverlaysConfigDefault;
};

export type OverlaysConfigDefault = {
    show?: OverlaysConfigShow;
    scale?: OverlaysConfigScale | boolean;
};

export type OverlaysFilter = {
    id?: string;
    element?: Element | string;
    type?: string;
} | string;

import Ids from '../../util/IdGenerator';
