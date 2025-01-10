/**
 * The main diagram-js entry point that bootstraps the diagram with the given
 * configuration.
 *
 * To register extensions with the diagram, pass them as Array<Module> to the constructor.
 *
 *
 * @example Creating a plug-in that logs whenever a shape is added to the canvas.
 *
 * ```javascript
 * // plug-in implementation
 * function MyLoggingPlugin(eventBus) {
 *   eventBus.on('shape.added', function(event) {
 *     console.log('shape ', event.shape, ' was added to the diagram');
 *   });
 * }
 *
 * // export as module
 * export default {
 *   __init__: [ 'myLoggingPlugin' ],
 *     myLoggingPlugin: [ 'type', MyLoggingPlugin ]
 * };
 * ```
 *
 * Use the plug-in in a Diagram instance:
 *
 * ```javascript
 * import MyLoggingModule from 'path-to-my-logging-plugin';
 *
 * var diagram = new Diagram({
 *   modules: [
 *     MyLoggingModule
 *   ]
 * });
 *
 * diagram.invoke([ 'canvas', function(canvas) {
 *   // add shape to drawing canvas
 *   canvas.addShape({ x: 10, y: 10 });
 * });
 *
 * // 'shape ... was added to the diagram' logged to console
 * ```
 *
 */
export default class Diagram<ServiceMap = null> {
  /**
   * @param options
   * @param injector An (optional) injector to bootstrap the diagram with.
   */
  constructor(options?: DiagramOptions, injector?: Injector<ServiceMap>);

  /**
   * Resolves a diagram service.
   *
   *
   * @param name The name of the service to get.
   *
   * @return
   */
  get<Name extends keyof ServiceMap>(name: Name): ServiceMap[Name];

  /**
   *
   * Resolves a diagram service.
   *
   *
   * @param name The name of the service to get.
   * @param strict If false, resolve missing services to null.
   *
   * @return
   */
  get<T>(name: string, strict: boolean): T|null;

  /**
   *
   * Resolves a diagram service.
   *
   *
   * @param name The name of the service to get.
   * @param strict If false, resolve missing services to null.
   *
   * @return
   */
  get<T>(name: string, strict: true): T;

  /**
   *
   * Resolves a diagram service.
   *
   *
   * @param name The name of the service to get.
   *
   * @return
   */
  get<T>(name: string): T;

  /**
   * Invoke the given function, injecting dependencies provided in
   * array notation. Return the result.
   *
   *
   * @param func function to be invoked
   * @param context context of the invocation
   * @param locals locals provided
   *
   * @return
   */
  invoke<T>(func: ArrayFunc<T>, context?: InjectionContext, locals?: LocalsMap): T;

  /**
   *
   * Invoke the given function, injecting dependencies. Return the result.
   *
   *
   * @param func
   * @param context
   * @param locals
   *
   * @return
   */
  invoke<T>(func: FactoryFunction<T>, context?: InjectionContext, locals?: LocalsMap): T;

  /**
   * Destroys the diagram
   */
  destroy(): void;

  /**
   * Clear the diagram, removing all contents.
   */
  clear(): void;
}

type InjectionContext = import('didi').InjectionContext;
type LocalsMap = import('didi').LocalsMap;
type ModuleDeclaration = import('didi').ModuleDeclaration;

export type DiagramOptions = {
    modules?: ModuleDeclaration[];
} & Record<string, any>;

type FactoryFunction<T> = import('didi').FactoryFunction<T>;
type ArrayFunc<T> = import('didi').ArrayFunc<T>;
import { Injector } from 'didi';
