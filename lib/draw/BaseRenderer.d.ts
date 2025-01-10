/**
 * The base implementation of shape and connection renderers.
 *
 */
export default class BaseRenderer {
    /**
     * @param eventBus
     * @param renderPriority
     */
    constructor(eventBus: EventBus, renderPriority?: number);
    /**
     * Checks whether an element can be rendered.
     *
     * @param element The element to be rendered.
     *
     * @return Whether the element can be rendered.
     */
    canRender(element: Element): boolean;
    /**
     * Draws a shape.
     *
     * @param visuals The SVG element to draw the shape into.
     * @param shape The shape to be drawn.
     *
     * @return The SVG element of the shape drawn.
     */
    drawShape(visuals: SVGElement, shape: Shape): SVGElement;
    /**
     * Draws a connection.
     *
     * @param visuals The SVG element to draw the connection into.
     * @param connection The connection to be drawn.
     *
     * @return The SVG element of the connection drawn.
     */
    drawConnection(visuals: SVGElement, connection: Connection): SVGElement;
    /**
     * Gets the SVG path of the graphical representation of a shape.
     *
     * @param shape The shape.
     *
     * @return The SVG path of the shape.
     */
    getShapePath(shape: Shape): string;
    /**
     * Gets the SVG path of the graphical representation of a connection.
     *
     * @param connection The connection.
     *
     * @return The SVG path of the connection.
     */
    getConnectionPath(connection: Connection): string;
}

type Element = import('../core/Types').ElementLike;
type Connection = import('../core/Types').ConnectionLike;
type Shape = import('../core/Types').ShapeLike;
type EventBus = import('../core/EventBus').default;
