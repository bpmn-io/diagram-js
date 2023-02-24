import {
  Connection,
  Label,
  ModelAttrsConnection,
  ModelAttrsLabel,
  ModelAttrsRoot,
  ModelAttrsShape,
  ModelTypeConnection,
  ModelTypeLabel,
  ModelTypeRoot,
  ModelTypeShape,
  Root,
  Shape
} from '../model';

/**
 * A factory for model elements.
 */
export default class ElementFactory {
  constructor();

  /**
   * Create a root element.
   *
   * @param attrs The attributes of the root element to be created.
   *
   * @return The created root element.
   */
  createRoot(attrs?: ModelAttrsRoot): Root;

  /**
   * Create a label.
   *
   * @param attrs The attributes of the label to be created.
   *
   * @return The created label.
   */
  createLabel(attrs?: ModelAttrsLabel): Label;

  /**
   * Create a shape.
   *
   * @param attrs The attributes of the shape to be created.
   *
   * @return The created shape.
   */
  createShape(attrs?: ModelAttrsShape): Shape;

  /**
   * Create a connection.
   *
   * @param attrs The attributes of the connection to be created.
   *
   * @return The created connection.
   */
  createConnection(attrs?: ModelAttrsConnection): Connection;

  /**
   * Create a connection model element with the given attributes.
   *
   * @param type The type of the model element which is 'connection'.
   * @param attrs The attributes of the connection model element.
   *
   * @return The created connection model element.
   */
  create(type: ModelTypeConnection, attrs?: ModelAttrsConnection): Connection;

  /**
   * Create a label model element with the given attributes.
   *
   * @param type The type of the model element which is 'label'.
   * @param attrs The attributes of the label model element.
   *
   * @return The created label model element.
   */
  create(type: ModelTypeLabel, attrs?: ModelAttrsLabel): Label;

  /**
   * Create a root model element with the given attributes.
   *
   * @param type The type of the model element which is 'root'.
   * @param attrs The attributes of the root model element.
   *
   * @return The created root model element.
   */
  create(type: ModelTypeRoot, attrs?: ModelAttrsRoot): Root;

  /**
   * Create a shape model element with the given attributes.
   *
   * @param type The type of the model element which is 'shape'.
   * @param attrs The attributes of the shape model element.
   *
   * @return The created shape model element.
   */
  create(type: ModelTypeShape, attrs?: ModelAttrsShape): Shape;
}