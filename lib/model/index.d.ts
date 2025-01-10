/**
 * Creates a label.
 *
 * @example
 *
 * ```javascript
 * import * as Model from 'diagram-js/lib/model';
 *
 * const label = Model.create('label', {
 *   x: 100,
 *   y: 100,
 *   width: 100,
 *   height: 100,
 *   labelTarget: shape
 * });
 * ```
 *
 * @param type
 * @param attrs
 *
 * @return
 */
export function create(type: 'label', attrs?: Object): Label;

/**
 * Creates a shape.
 *
 *
 * @example
 *
 * ```javascript
 * import * as Model from 'diagram-js/lib/model';
 *
 * const shape = Model.create('shape', {
 *   x: 100,
 *   y: 100,
 *   width: 100,
 *   height: 100
 * });
 * ```
 *
 * @param type
 * @param attrs
 *
 * @return
 */
export function create(type: 'shape', attrs?: any): Shape;

/**
 * Creates a connection.
 *
 *
 * @example
 *
 * ```javascript
 * import * as Model from 'diagram-js/lib/model';
 *
 * const connection = Model.create('connection', {
 *   waypoints: [
 *     { x: 100, y: 100 },
 *     { x: 200, y: 100 }
 *   ]
 * });
 * ```
 *
 * @param type
 * @param attrs
 *
 * @return
 */
export function create(type: 'connection', attrs?: any): Connection;

/**
 * Creates a root element.
 *
 *
 * @example
 *
 * ```javascript
 * import * as Model from 'diagram-js/lib/model';
 *
 * const root = Model.create('root', {
 *   x: 100,
 *   y: 100,
 *   width: 100,
 *   height: 100
 * });
 * ```
 *
 * @param type
 * @param attrs
 *
 * @return
 */
export function create(type: 'root', attrs?: any): Root;

/**
 * Checks whether an object is a model instance.
 *
 * @param obj
 *
 * @return
 */
export function isModelElement(obj: any): boolean;

type Element = import('./Types').Element;
type Shape = import('./Types').Shape;
type Root = import('./Types').Root;
type Label = import('./Types').Label;
type Connection = import('./Types').Connection;
