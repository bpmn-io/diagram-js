import { Injector } from 'didi';

import CoreModule from './core';

/**
 * @typedef {import('didi').InjectionContext} InjectionContext
 * @typedef {import('didi').LocalsMap} LocalsMap
 * @typedef {import('didi').ModuleDeclaration} ModuleDeclaration
 *
 * @typedef { {
 *   modules?: ModuleDeclaration[];
 * } & Record<string, any> } DiagramOptions
 */

/**
 * @template T
 * @typedef {import('didi').FactoryFunction<T>} FactoryFunction
 */

/**
 * @template T
 * @typedef {import('didi').ArrayFunc<T>} ArrayFunc
 */

/**
 * Bootstrap an injector from a list of modules, instantiating a number of default components
 *
 * @param {ModuleDeclaration[]} modules
 *
 * @return {Injector} a injector to use to access the components
 */
function bootstrap(modules) {
  var injector = new Injector(modules);

  injector.init();

  return injector;
}

/**
 * Creates an injector from passed options.
 *
 * @template ServiceMap
 * @param {DiagramOptions} [options]
 *
 * @return {Injector<ServiceMap>}
 */
function createInjector(options) {

  options = options || {};

  /**
   * @type { ModuleDeclaration }
   */
  var configModule = {
    'config': [ 'value', options ]
  };

  var modules = [ configModule, CoreModule ].concat(options.modules || []);

  return bootstrap(modules);
}


/**
 * The main diagram-js entry point that bootstraps the diagram with the given
 * configuration.
 *
 * To register extensions with the diagram, pass them as Array<Module> to the constructor.
 *
 * @class
 * @constructor
 * @template [ServiceMap=null]
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
 * @param {DiagramOptions} [options]
 * @param {Injector<ServiceMap>} [injector] An (optional) injector to bootstrap the diagram with.
 */
export default function Diagram(options, injector) {

  /**
   * @type {Injector<ServiceMap>}
   */
  this._injector = injector || createInjector(options);

  // init

  /**
   * An event indicating that all plug-ins are loaded.
   *
   * Use this event to fire other events to interested plug-ins
   *
   * @memberOf Diagram
   *
   * @event diagram.init
   *
   * @example
   *
   * ```javascript
   * eventBus.on('diagram.init', function() {
   *   eventBus.fire('my-custom-event', { foo: 'BAR' });
   * });
   * ```
   *
   * @type {Object}
   */
  this.get('eventBus').fire('diagram.init');
}

/**
 * @overlord
 *
 * Resolves a diagram service.
 *
 * @template T
 *
 * @param {string} name The name of the service to get.
 *
 * @return {T}
 */
/**
 * @overlord
 *
 * Resolves a diagram service.
 *
 * @template T
 *
 * @param {string} name The name of the service to get.
 * @param {true} strict If false, resolve missing services to null.
 *
 * @return {T}
 */
/**
 * @overlord
 *
 * Resolves a diagram service.
 *
 * @template T
 *
 * @param {string} name The name of the service to get.
 * @param {boolean} strict If false, resolve missing services to null.
 *
 * @return {T|null}
 */
/**
 * Resolves a diagram service.
 *
 * @template {keyof ServiceMap} Name
 *
 * @param {Name} name The name of the service to get.
 *
 * @return {ServiceMap[Name]}
 */
Diagram.prototype.get = function(name, strict) {
  return this._injector.get(name, strict);
};

/**
 * @overlord
 *
 * Invoke the given function, injecting dependencies. Return the result.
 *
 * @template T
 *
 * @param {FactoryFunction<T>} func
 * @param {InjectionContext} [context]
 * @param {LocalsMap} [locals]
 *
 * @return {T}
 */
/**
 * Invoke the given function, injecting dependencies provided in
 * array notation. Return the result.
 *
 * @template T
 *
 * @param {ArrayFunc<T>} func function to be invoked
 * @param {InjectionContext} [context] context of the invocation
 * @param {LocalsMap} [locals] locals provided
 *
 * @return {T}
 */
Diagram.prototype.invoke = function(func, context, locals) {
  return this._injector.invoke(func, context, locals);
};

/**
 * Destroys the diagram
 */
Diagram.prototype.destroy = function() {
  this.get('eventBus').fire('diagram.destroy');
};

/**
 * Clear the diagram, removing all contents.
 */
Diagram.prototype.clear = function() {
  this.get('eventBus').fire('diagram.clear');
};
