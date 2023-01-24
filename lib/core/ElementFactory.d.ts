import {
  Connection,
  GetModelAttrs,
  GetModelType,
  Label,
  ModelAttrs,
  ModelAttrsConnection,
  ModelAttrsLabel,
  ModelAttrsRoot,
  ModelAttrsShape,
  ModelType,
  Root,
  Shape
} from '../model';

export default class ElementFactory {
  constructor();
  createRoot(attrs?: ModelAttrsRoot): Root;
  createLabel(attrs?: ModelAttrsLabel): Label;
  createShape(attrs?: ModelAttrsShape): Shape;
  createConnection(attrs?: ModelAttrsConnection): Connection;
  create(type: ModelType, attrs?: ModelAttrs): Connection | Label | Root | Shape;
  create<T extends Connection | Label | Root | Shape>(type: GetModelType<T>, attrs?: GetModelAttrs<T>): T;
}