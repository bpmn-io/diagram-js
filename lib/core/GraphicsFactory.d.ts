/**
 * A factory that creates graphical elements.
 *
 */
export default class GraphicsFactory {
  static $inject: string[];

  /**
   * @param eventBus
   * @param elementRegistry
   */
  constructor(eventBus: EventBus, elementRegistry: ElementRegistry);

  /**
   * Create a graphical element.
   *
   * @param type The type of the element.
   * @param element The element.
   * @param parentIndex The index at which to add the graphical element to its parent's children.
   *
   * @return The graphical element.
   */
  create(type: 'shape' | 'connection' | 'label' | 'root', element: ElementLike, parentIndex?: number): SVGElement;

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
   * @param attrs Optional attributes.
   *
   * @return
   */
  drawShape(visual: SVGElement, element: ShapeLike, attrs?: any): SVGElement;

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
   * @param attrs Optional attributes.
   *
   * @return
   */
  drawConnection(visual: SVGElement, element: ConnectionLike, attrs?: any): SVGElement;

  /**
   * Get the path of a connection.
   *
   * @param connection The connection.
   *
   * @return The path of the connection.
   */
  getConnectionPath(connection: ConnectionLike): string;

  /**
   * Update an elements graphical representation.
   *
   * @param type
   * @param element
   * @param gfx
   */
  update(type: 'shape' | 'connection', element: ElementLike, gfx: SVGElement): void;

  /**
   * Remove a graphical element.
   *
   * @param element The element.
   */
  remove(element: ElementLike): void;
}

type ConnectionLike = import('./Types').ConnectionLike;
type ElementLike = import('./Types').ElementLike;
type ShapeLike = import('./Types').ShapeLike;
type ElementRegistry = import('./ElementRegistry').default;
type EventBus = import('./EventBus').default;
