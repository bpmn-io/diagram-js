/**
 * A factory for model elements.
 *
 */
export default class ElementFactory<T extends import("../model/Types").Connection = import("../model/Types").Connection, U extends import("../model/Types").Label = import("../model/Types").Label, V extends import("../model/Types").Root = import("../model/Types").Root, W extends import("../model/Types").Shape = import("../model/Types").Shape> {
  /**
   * Create a root element.
   *
   * @param attrs
   *
   * @return The created root element.
   */
  createRoot(attrs?: Partial<Root>): V;

  /**
   * Create a label.
   *
   * @param attrs
   *
   * @return The created label.
   */
  createLabel(attrs?: Partial<Label>): U;

  /**
   * Create a shape.
   *
   * @param attrs
   *
   * @return The created shape.
   */
  createShape(attrs?: Partial<Shape>): W;

  /**
   * Create a connection.
   *
   * @param attrs
   *
   * @return The created connection.
   */
  createConnection(attrs?: Partial<Connection>): T;

  /**
   * Create a label.
   *
   * @param type
   * @param attrs
   * @return
   */
  create(type: 'label', attrs?: Partial<Label>): U;

  /**
   * Create a connection.
   *
   * @param type
   * @param attrs
   * @return
   */
  create(type: 'connection', attrs?: Partial<Connection>): T;

  /**
   * Create a shape.
   *
   * @param type
   * @param attrs
   * @return
   */
  create(type: 'shape', attrs?: Partial<Shape>): W;

  /**
   * Create a root element.
   *
   * @param type
   * @param attrs
   * @return
   */
  create(type: 'root', attrs?: Partial<Root>): V;
}

type Element = import('../model/Types').Element;
type Connection = import('../model/Types').Connection;
type Label = import('../model/Types').Label;
type Root = import('../model/Types').Root;
type Shape = import('../model/Types').Shape;
