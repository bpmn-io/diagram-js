import ElementRegistry from './ElementRegistry';
import EventBus from './EventBus';

import {
  ConnectionLike,
  ElementLike,
  ShapeLike
} from '.';

import {
  ModelType,
  ModelTypeConnection,
  ModelTypeShape
} from '../model';

/**
 * A factory that creates graphical elements.
 *
 * @param eventBus
 * @param elementRegistry
 */
export default class GraphicsFactory {
  constructor(eventBus: EventBus, elementRegistry: ElementRegistry);

  /**
   * Create a graphical element.
   *
   * @param type The type of the element.
   * @param element The element.
   * @param parentIndex The index at which to add the graphical element to its parent's children.
   *
   * @return The created graphical element.
   */
  create(type: ModelType, element: ElementLike, parentIndex?: number): SVGElement;

  /**
   * Update the containments of the given elements.
   *
   * @param elements The elements.
   */
  updateContainments(elements: ElementLike[]): void;

  /**
   * Draw a shape.
   *
   * @param visual The graphical element.
   * @param element The shape.
   */
  drawShape(visual: SVGElement, element: ShapeLike): SVGElement;

  /**
   * Get the path of a shape.
   *
   * @param element The shape.
   *
   * @return The path of the shape.
   */
  getShapePath(element: ShapeLike): string;

  /**
   * Draw a connection.
   *
   * @param visual The graphical element.
   * @param element The connection.
   */
  drawConnection(visual: SVGElement, element: ConnectionLike): SVGElement;

  /**
   * Get the path of a connection.
   *
   * @param element The connection.
   *
   * @return The path of the connection.
   */
  getConnectionPath(connection: ConnectionLike): string;

  /**
   * Update an elements graphical representation.
   *
   * @param type The type of the element.
   * @param element The element.
   * @param gfx The graphical representation.
   */
  update(type: ModelTypeShape | ModelTypeConnection, element: ElementLike, gfx: SVGElement): void;

  /**
   * Remove a graphical element.
   *
   * @param element The element.
   */
  remove(element: ElementLike): void;
}