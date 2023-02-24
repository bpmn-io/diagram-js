import {
  forEach,
  isFunction,
  isArray,
  isNumber,
  isObject
} from 'min-dash';

/**
 * @typedef {import('../core/EventBus').default} EventBus
 * @typedef {import(./CommandInterceptor).HandlerFunction} HandlerFunction
 * @typedef {import(./CommandInterceptor).ComposeHandlerFunction} ComposeHandlerFunction
 */

var DEFAULT_PRIORITY = 1000;

/**
 * A utility that can be used to plug into the command execution for
 * extension and/or validation.
 *
 * @class
 * @constructor
 *
 * @param {EventBus} eventBus
 *
 * @example
 *
 * import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';
 *
 * class CommandLogger extends CommandInterceptor {
 *   constructor(eventBus) {
 *     super(eventBus);
 *
 *   this.preExecute('shape.create', (event) => {
 *     console.log('commandStack.shape-create.preExecute', event);
 *   });
 * }
 */
export default function CommandInterceptor(eventBus) {

  /**
   * @type {EventBus}
   */
  this._eventBus = eventBus;
}

CommandInterceptor.$inject = [ 'eventBus' ];

function unwrapEvent(fn, that) {
  return function(event) {
    return fn.call(that || null, event.context, event.command, event);
  };
}

/**
   * Intercept a command during one of the phases.
   *
   * @param {string|string[]} [events] One or more commands to intercept.
   * @param {string} [hook] Phase during which to intercept command.
   * @param {number} [priority] Priority with which command will be intercepted.
   * @param {ComposeHandlerFunction|HandlerFunction} handlerFn Callback.
   * @param {boolean} [unwrap] Whether the event should be unwrapped.
   * @param {*} [that] `this` value the callback will be called with.
   */
CommandInterceptor.prototype.on = function(events, hook, priority, handlerFn, unwrap, that) {

  if (isFunction(hook) || isNumber(hook)) {
    that = unwrap;
    unwrap = handlerFn;
    handlerFn = priority;
    priority = hook;
    hook = null;
  }

  if (isFunction(priority)) {
    that = unwrap;
    unwrap = handlerFn;
    handlerFn = priority;
    priority = DEFAULT_PRIORITY;
  }

  if (isObject(unwrap)) {
    that = unwrap;
    unwrap = false;
  }

  if (!isFunction(handlerFn)) {
    throw new Error('handlerFn must be a function');
  }

  if (!isArray(events)) {
    events = [ events ];
  }

  var eventBus = this._eventBus;

  forEach(events, function(event) {

    // concat commandStack(.event)?(.hook)?
    var fullEvent = [ 'commandStack', event, hook ].filter(function(e) { return e; }).join('.');

    eventBus.on(fullEvent, priority, unwrap ? unwrapEvent(handlerFn, that) : handlerFn, that);
  });
};


var hooks = [
  'canExecute',
  'preExecute',
  'preExecuted',
  'execute',
  'executed',
  'postExecute',
  'postExecuted',
  'revert',
  'reverted'
];

/*
 * Add prototype methods for each phase of command execution (e.g. execute,
 * revert).
 */
forEach(hooks, function(hook) {

  /**
   * Add prototype method for a specific phase of command execution.
   *
   * @param {string|string[]} [events] One or more commands to intercept.
   * @param {number} [priority] Priority with which command will be intercepted.
   * @param {ComposeHandlerFunction|HandlerFunction} handlerFn Callback.
   * @param {boolean} [unwrap] Whether the event should be unwrapped.
   * @param {*} [that] `this` value the callback will be called with.
   */
  CommandInterceptor.prototype[hook] = function(events, priority, handlerFn, unwrap, that) {

    if (isFunction(events) || isNumber(events)) {
      that = unwrap;
      unwrap = handlerFn;
      handlerFn = priority;
      priority = events;
      events = null;
    }

    this.on(events, hook, priority, handlerFn, unwrap, that);
  };
});
