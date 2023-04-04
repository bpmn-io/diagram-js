import { Injector } from 'didi';

import CoreModule from './core';

/**
 * @typedef {import('didi').InjectionContext} InjectionContext
 * @typedef {import('didi').LocalsMap} LocalsMap
 * @typedef {import('didi').ModuleDeclaration} ModuleDeclaration
 *
 * @typedef {import('./Diagram').DiagramOptions} DiagramOptions
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
 * @param {DiagramOptions} [options]
 * @param {ModuleDeclaration[]} [options.modules] External modules to instantiate with the diagram.
 * @param {Injector} [injector] An (optional) injector to bootstrap the diagram with.
 */
export default function Diagram(options, injector) {

  /** @private */
  this.injector = injector = injector || createInjector(options);

  // API

  /**
   * Resolves a diagram service.
   *
   * @method Diagram#get
   *
   * @param {string} name The name of the service to get.
   * @param {boolean} [strict=true] If false, resolve missing services to null.
   */
  this.get = injector.get;

  /**
   * Executes a function with its dependencies injected.
   *
   * @method Diagram#invoke
   *
   * @param {Function} fn The function to be executed.
   * @param {InjectionContext} [context] The context.
   * @param {LocalsMap} [locals] The locals.
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
   * eventBus.on('diagram.init', function() {
   *   eventBus.fire('my-custom-event', { foo: 'BAR' });
   * });
   *
   * @type {Object}
   */
  this.get('eventBus').fire('diagram.init');
}


/**
 * Destroys the diagram
 *
 * @method  Diagram#destroy
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
