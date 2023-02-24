import EventBus from '../core/EventBus';

import {
  Base,
  Connection,
  Shape
} from '../model';

/**
 * The base implementation of shape and connection renderers.
 *
 * @param eventBus
 * @param renderPriority
 */
export default class BaseRenderer {
  constructor(eventBus: EventBus, renderPriority?: number);

  /**
   * Checks whether an element can be rendered.
   *
   * @param element The element to be rendered.
   *
   * @returns Whether the element can be rendered.
   */
  canRender(element: Base): boolean;

  /**
   * Draws a shape.
   *
   * @param visuals The SVG element to draw the shape into.
   * @param shape The shape to be drawn.
   *
   * @returns The SVG element with the shape drawn into it.
   */
  drawShape(visuals: SVGElement, shape: Shape): SVGElement;

  /**
   * Draws a connection.
   *
   * @param visuals The SVG element to draw the connection into.
   * @param connection The connection to be drawn.
   *
   * @returns The SVG element with the connection drawn into it.
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