/**
 * Adds change support to the diagram, including
 *
 * <ul>
 *   <li>redrawing shapes and connections on change</li>
 * </ul>
 *
 */
export default class ChangeSupport {
    static $inject: string[];
    /**
     * @param eventBus
     * @param canvas
     * @param elementRegistry
     * @param graphicsFactory
     */
    constructor(eventBus: EventBus, canvas: Canvas, elementRegistry: ElementRegistry, graphicsFactory: GraphicsFactory);
}

type Canvas = import('../../core/Canvas').default;
type ElementRegistry = import('../../core/ElementRegistry').default;
type EventBus = import('../../core/EventBus').default;
type GraphicsFactory = import('../../core/GraphicsFactory').default;
