/**
 * A general purpose event bus.
 *
 * This component is used to communicate across a diagram instance.
 * Other parts of a diagram can use it to listen to and broadcast events.
 *
 *
 * ## Registering for Events
 *
 * The event bus provides the {@link EventBus#on} and {@link EventBus#once}
 * methods to register for events. {@link EventBus#off} can be used to
 * remove event registrations. Listeners receive an instance of {@link Event}
 * as the first argument. It allows them to hook into the event execution.
 *
 * ```javascript
 *
 * // listen for event
 * eventBus.on('foo', function(event) {
 *
 *   // access event type
 *   event.type; // 'foo'
 *
 *   // stop propagation to other listeners
 *   event.stopPropagation();
 *
 *   // prevent event default
 *   event.preventDefault();
 * });
 *
 * // listen for event with custom payload
 * eventBus.on('bar', function(event, payload) {
 *   console.log(payload);
 * });
 *
 * // listen for event returning value
 * eventBus.on('foobar', function(event) {
 *
 *   // stop event propagation + prevent default
 *   return false;
 *
 *   // stop event propagation + return custom result
 *   return {
 *     complex: 'listening result'
 *   };
 * });
 *
 *
 * // listen with custom priority (default=1000, higher is better)
 * eventBus.on('priorityfoo', 1500, function(event) {
 *   console.log('invoked first!');
 * });
 *
 *
 * // listen for event and pass the context (`this`)
 * eventBus.on('foobar', function(event) {
 *   this.foo();
 * }, this);
 * ```
 *
 *
 * ## Emitting Events
 *
 * Events can be emitted via the event bus using {@link EventBus#fire}.
 *
 * ```javascript
 *
 * // false indicates that the default action
 * // was prevented by listeners
 * if (eventBus.fire('foo') === false) {
 *   console.log('default has been prevented!');
 * };
 *
 *
 * // custom args + return value listener
 * eventBus.on('sum', function(event, a, b) {
 *   return a + b;
 * });
 *
 * // you can pass custom arguments + retrieve result values.
 * var sum = eventBus.fire('sum', 1, 2);
 * console.log(sum); // 3
 * ```
 */
declare class EventBus {

  /**
   * Register an event listener for events with the given name.
   *
   * The callback will be invoked with `event, ...additionalArguments`
   * that have been passed to {@link EventBus#fire}.
   *
   * Returning false from a listener will prevent the events default action
   * (if any is specified). To stop an event from being processed further in
   * other listeners execute {@link Event#stopPropagation}.
   *
   * Returning anything but `undefined` from a listener will stop the listener propagation.
   *
   * @param {string|Array<string>} events
   * @param {number} priority the priority (default=1000) in which this listener is called, larger is higher
   * @param {Function} callback
   * @param {Object} [that] Pass context (`this`) to the callback
   */
  on(events: string|string[], priority: number, callback: Function, that?: any): void;

  /**
   * Register an event listener for events with the given name.
   *
   * The callback will be invoked with `event, ...additionalArguments`
   * that have been passed to {@link EventBus#fire}.
   *
   * Returning false from a listener will prevent the events default action
   * (if any is specified). To stop an event from being processed further in
   * other listeners execute {@link Event#stopPropagation}.
   *
   * Returning anything but `undefined` from a listener will stop the listener propagation.
   *
   * @param {string|Array<string>} events
   * @param {Function} callback
   * @param {Object} [that] Pass context (`this`) to the callback
   */
  on(events: string|string[], callback: Function, that?: any): void;

  /**
   * Register an event listener that is executed only once.
   *
   * @param {string} event the event name to register for
   * @param {number} priority the priority in which this listener is called, larger is higher
   * @param {Function} callback the callback to execute
   * @param {Object} [that] Pass context (`this`) to the callback
   */
  once(event: string|string[], priority: number, callback: Function, that?: any) : void;

  /**
   * Register an event listener that is executed only once.
   *
   * @param {string} event the event name to register for
   * @param {Function} callback the callback to execute
   * @param {Object} [that] Pass context (`this`) to the callback
   */
  once(event: string|string[], callback: Function, that?: any) : void;

  /**
   * Removes event listeners by event and callback.
   *
   * If no callback is given, all listeners for a given event name are being removed.
   *
   * @param {string|Array<string>} events
   * @param {Function} [callback]
   */
  off(events: string|string[], callback?:Function) : void;

  /**
   * Create an EventBus event.
   *
   * @param {Object} data
   *
   * @return {Object} event, recognized by the eventBus
   */
  createEvent(data: any) : any;

  /**
   * Fires a named event.
   *
   * @example
   *
   * // fire event by name
   * events.fire('foo');
   *
   * // fire event object with nested type
   * var event = { type: 'foo' };
   * events.fire(event);
   *
   * // fire event with explicit type
   * var event = { x: 10, y: 20 };
   * events.fire('element.moved', event);
   *
   * // pass additional arguments to the event
   * events.on('foo', function(event, bar) {
   *   alert(bar);
   * });
   *
   * events.fire({ type: 'foo' }, 'I am bar!');
   *
   * @param {string} [name] the optional event name
   * @param {Object} [event] the event object
   * @param {...Object} additional arguments to be passed to the callback functions
   *
   * @return {boolean} the events return value, if specified or false if the
   *                   default action was prevented by listeners
   */
  fire(event: { type: 'string' }) : boolean;

  /**
   * Fires a named event.
   *
   * @example
   *
   * // fire event by name
   * events.fire('foo');
   *
   * // fire event object with nested type
   * var event = { type: 'foo' };
   * events.fire(event);
   *
   * // fire event with explicit type
   * var event = { x: 10, y: 20 };
   * events.fire('element.moved', event);
   *
   * // pass additional arguments to the event
   * events.on('foo', function(event, bar) {
   *   alert(bar);
   * });
   *
   * events.fire({ type: 'foo' }, 'I am bar!');
   *
   * @param {string} [name] the optional event name
   * @param {Object} [event] the event object
   * @param {...Object} additional arguments to be passed to the callback functions
   *
   * @return {boolean} the events return value, if specified or false if the
   *                   default action was prevented by listeners
   */
  fire(type: string, data: any);

}

export default EventBus;
