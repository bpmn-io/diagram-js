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
 * @param {DiagramOptions} [options]
 *
 * @return {Injector}
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
 * @param {Injector} [injector] An (optional) injector to bootstrap the diagram with.
 */
export default function Diagram(options, injector) {

  this._injector = injector = injector || createInjector(options);

  // API

  /**
   * Resolves a diagram service.
   *
   * @template T
   *
   * @param {string} name The name of the service to get.
   * @param {boolean} [strict=true] If false, resolve missing services to null.
   *
   * @return {T|null}
   */
  this.get = injector.get;

  /**
   * Executes a function with its dependencies injected.
   *
   * @template T
   *
   * @param {Function} func function to be invoked
   * @param {InjectionContext} [context] context of the invocation
   * @param {LocalsMap} [locals] locals provided
   *
   * @return {T|null}
   */
  this.invoke = injector.invoke;

  // init

  // indicate via event


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
