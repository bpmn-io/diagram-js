/**
 * A plugin that provides interaction events for diagram elements.
 *
 * It emits the following events:
 *
 *   * element.click
 *   * element.contextmenu
 *   * element.dblclick
 *   * element.hover
 *   * element.mousedown
 *   * element.mousemove
 *   * element.mouseup
 *   * element.out
 *
 * Each event is a tuple { element, gfx, originalEvent }.
 *
 * Canceling the event via Event#preventDefault()
 * prevents the original DOM operation.
 *
 */
export default class InteractionEvents {
    static $inject: string[];
    /**
     * @param eventBus
     * @param elementRegistry
     * @param styles
     */
    constructor(eventBus: EventBus, elementRegistry: ElementRegistry, styles: Styles);
    /**
     * Remove hints on the given graphics.
     *
     * @param gfx
     */
    removeHits: (gfx: SVGElement) => void;
    /**
     * Create default hit for the given element.
     *
     * @param element
     * @param gfx
     *
     * @return created hit
     */
    createDefaultHit: (element: Element, gfx: SVGElement) => SVGElement;
    /**
     * Create hits for the given waypoints.
     *
     * @param gfx
     * @param waypoints
     *
     * @return
     */
    createWaypointsHit: (gfx: SVGElement, waypoints: Point[]) => SVGElement;
    /**
     * Create hits for a box.
     *
     * @param gfx
     * @param type
     * @param attrs
     *
     * @return
     */
    createBoxHit: (gfx: SVGElement, type: string, attrs: any) => SVGElement;
    /**
     * Update default hit of the element.
     *
     * @param element
     * @param gfx
     *
     * @return updated hit
     */
    updateDefaultHit: (element: Element, gfx: SVGElement) => SVGElement;
    fire: (type: string, event: MouseEvent | TouchEvent, element?: Element) => void;
    triggerMouseEvent: (eventName: string, event: MouseEvent | TouchEvent, targetElement: Element) => void;
    mouseHandler: (localEventName: any) => any;
    registerEvent: (node: any, event: any, localEvent: any, ignoredFilter: any) => void;
    unregisterEvent: (node: any, event: any, localEvent: any) => void;
}

type Element = import('../../model/Types').Element;
type ElementRegistry = import('../../core/ElementRegistry').default;
type EventBus = import('../../core/EventBus').default;
type Styles = import('../../draw/Styles').default;
type Point = import('../../util/Types').Point;
