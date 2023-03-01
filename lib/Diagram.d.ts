import {
  InjectionContext,
  Injector,
  LocalsMap,
  ModuleDeclaration
} from 'didi';

export type DiagramOptions = {
  modules: ModuleDeclaration[]
}

/**
 * The main diagram-js entry point that bootstraps the diagram with the given
 * configuration.
 *
 * To register extensions with the diagram, pass them as Array<Module> to the constructor.
 *
 * @example
 *
 * <caption>Creating a plug-in that logs whenever a shape is added to the canvas.</caption>
 *
 * // plug-in implemenentation
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
 *
 *
 * // instantiate the diagram with the new plug-in
 *
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
 *
 * @param options
 * @param injector An (optional) injector to bootstrap the diagram with.
 */
export default class Diagram {
  constructor(options?: DiagramOptions, injector?: Injector);

  /**
   * Resolves a diagram service.
   *
   * @method Diagram#get
   *
   * @param name The name of the service to get.
   * @param strict If false, resolve missing services to null.
   */
  get<T>(name: string, strict?: boolean): T;

  /**
   * Executes a function with its dependencies injected.
   *
   * @method Diagram#invoke
   *
   * @param fn The function to be executed.
   * @param context The context.
   * @param locals The locals.
   */
  invoke<T>(fn: (...args: any[]) => T, context?: InjectionContext, locals?: LocalsMap): T;

  /**
   * Destroys the diagram
   */
  destroy(): void;

  /**
   * Clear the diagram, removing all contents.
   */
  clear(): void;
}