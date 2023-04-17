import { Point } from '../util/Types';

export type ModelTypeBase = 'base';
export type ModelTypeConnection = 'connection';
export type ModelTypeLabel = 'label';
export type ModelTypeRoot = 'root';
export type ModelTypeShape = 'shape';

export type ModelType = ModelTypeConnection | ModelTypeLabel | ModelTypeRoot | ModelTypeShape;

export interface ModelBaseAttrs {
  businessObject?: any;
  id?: string;
  label?: Label;
  parent?: Base;
  incoming?: Connection[];
  outgoing?: Connection[];
  [key: string]: any;
}

export interface ModelAttrsShape extends ModelBaseAttrs {
  isFrame?: boolean;
  children?: Base[];
  host?: Shape;
  attachers?: Shape[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface ModelAttrsRoot extends ModelAttrsShape {}

export interface ModelAttrsLabel extends ModelAttrsShape {
  labelTarget?: Base;
}

export interface ModelAttrsConnection extends ModelBaseAttrs {
  source?: Base;
  target?: Base;
  waypoints?: Point[];
}

export type ModelAttrs = ModelAttrsConnection | ModelAttrsLabel | ModelAttrsRoot | ModelAttrsShape;

export interface Base {
  businessObject: any;
  id: string;
  label: Label;
  parent: Base;
  incoming: Connection[];
  outgoing: Connection[];
}

export interface Shape extends Base {
  isFrame: boolean;
  children: Base[];
  host: Shape;
  attachers: Shape[];
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Root extends Shape {}

export interface Label extends Shape {
  labelTarget: Base;
}

export interface Connection extends Base {
  source: Base;
  target: Base;
  waypoints: Point[];
}

export type Parent = Shape | Root;

/**
 * Creates a connection model element.
 *
 * @example
 *
 * import * as Model from 'diagram-js/lib/model';
 *
 * const connection = Model.create('connection', {
 *   waypoints: [
 *     { x: 100, y: 100 },
 *     { x: 200, y: 100 }
 *   ]
 * });
 *
 * @param type The type of model element to be created which is 'connection'.
 * @param attrs Attributes to create the connection model element with.
 *
 * @return The created connection model element.
 */
export function create(type: ModelTypeConnection, attrs: ModelAttrsConnection): Connection;

/**
 * Creates a label model element.
 *
 * @example
 *
 * import * as Model from 'diagram-js/lib/model';
 *
 * const label = Model.create('label', {
 *   x: 100,
 *   y: 100,
 *   width: 100,
 *   height: 100,
 *   labelTarget: shape
 * });
 *
 * @param type The type of model element to be created which is 'label'.
 * @param attrs Attributes to create the label model element with.
 *
 * @return The created label model element.
 */
export function create(type: ModelTypeLabel, attrs: ModelAttrsLabel): Label;

/**
 * Creates a root model element.
 *
 * @example
 *
 * import * as Model from 'diagram-js/lib/model';
 *
 * const root = Model.create('root', {
 *   x: 100,
 *   y: 100,
 *   width: 100,
 *   height: 100
 * });
 *
 * @param type The type of model element to be created which is 'root'.
 * @param attrs Attributes to create the root model element with.
 *
 * @return The created root model element.
 */
export function create(type: ModelTypeRoot, attrs: ModelAttrsRoot): Root;

/**
 * Creates a shape model element.
 *
 * @example
 *
 * import * as Model from 'diagram-js/lib/model';
 *
 * const shape = Model.create('shape', {
 *   x: 100,
 *   y: 100,
 *   width: 100,
 *   height: 100
 * });
 *
 * @param type The type of model element to be created which is 'shape'.
 * @param attrs Attributes to create the shape model element with.
 *
 * @return The created shape model element.
 */
export function create(type: ModelTypeShape, attrs: ModelAttrsShape): Shape;