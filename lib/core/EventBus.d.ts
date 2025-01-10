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
 *
 */
export default class EventBus<EventMap = null> {
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
   *
   * @param events to subscribe to
   * @param callback
   * @param that callback context
   */
  on<EventName extends keyof EventMap>(
    events: EventName,
    callback: EventBusEventCallback<EventMap[EventName]>,
    that?: any
  ): void;

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
   *
   * @param events to subscribe to
   * @param priority listen priority
   * @param callback
   * @param that callback context
   */
  on<EventName extends keyof EventMap>(
    events: EventName,
    priority: number,
    callback: EventBusEventCallback<EventMap[EventName]>,
    that?: any
  ): void;

  /**
   *
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
   *
   * @param events to subscribe to
   * @param callback
   * @param that callback context
   */
  on<T>(events: string|string[], callback: EventBusEventCallback<T>, that?: any): void;

  /**
   *
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
   *
   * @param events to subscribe to
   * @param priority listen priority
   * @param callback
   * @param that callback context
   */
  on<T>(
    events: string|string[],
    priority: number,
    callback: EventBusEventCallback<T>,
    that?: any
  ): void;

  /**
   * Register an event listener that is called only once.
   *
   *
   * @param events to subscribe to
   * @param callback
   * @param that callback context
   */
  once<EventName extends keyof EventMap>(
    events: EventName,
    callback: EventBusEventCallback<EventMap[EventName]>,
    that?: any
  ): void;

  /**
   * Register an event listener that is called only once.
   *
   *
   * @param events to subscribe to
   * @param priority listen priority
   * @param callback
   * @param that callback context
   */
  once<EventName extends keyof EventMap>(
    events: EventName,
    priority: number,
    callback: EventBusEventCallback<EventMap[EventName]>,
    that?: any
  ): void;

  /**
   *
   * Register an event listener that is called only once.
   *
   *
   * @param events to subscribe to
   * @param callback
   * @param that callback context
   */
  once<T>(events: string|string[], callback: EventBusEventCallback<T>, that?: any): void;

  /**
   *
   * Register an event listener that is called only once.
   *
   *
   * @param events to subscribe to
   * @param priority the listen priority
   * @param callback
   * @param that callback context
   */
  once<T>(
    events: string|string[],
    priority: number,
    callback: EventBusEventCallback<T>,
    that?: any
  ): void;

  /**
   * Removes event listeners by event and callback.
   *
   * If no callback is given, all listeners for a given event name are being removed.
   *
   * @param events
   * @param callback
   */
  off(events: string | string[], callback?: any): void;

  /**
   * Create an event recognized be the event bus.
   *
   * @param data Event data.
   *
   * @return An event that will be recognized by the event bus.
   */
  createEvent(data: any): Event;

  /**
   * Fires an event.
   *
   * @example
   *
   * ```javascript
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
   * ```
   *
   *
   * @return The return value. Will be set to `false` if the default was prevented.
   */
  fire(...args: any[]): any;

  /**
   * Fires an event.
   *
   * @example
   *
   * ```javascript
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
   * ```
   *
   * @param data event or event data
   *
   * @return The return value. Will be set to `false` if the default was prevented.
   */
  fire(data: any): any;

  /**
   * Fires an event.
   *
   * @example
   *
   * ```javascript
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
   * ```
   *
   * @param type event type
   *
   * @return The return value. Will be set to `false` if the default was prevented.
   */
  fire(type: string): any;

  /**
   * Fires an event.
   *
   * @example
   *
   * ```javascript
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
   * ```
   *
   * @param type event type
   * @param data event or event data
   *
   * @return The return value. Will be set to `false` if the default was prevented.
   */
  fire(type: string, data: any): any;

  /**
   * Handle an error by firing an event.
   *
   * @param error The error to be handled.
   *
   * @return Whether the error was handled.
   */
  handleError(error: Error): boolean;
}
export type Event = {
    stopPropagation(): void;
    preventDefault(): void;
    cancelBubble: boolean;
    defaultPrevented: boolean;
    returnValue: any;
};
export type EventBusEventCallback<E> = (event: E & Event, ...any: any[]) => any;
export type EventBusListener = {
    priority: number;
    next: EventBusListener | null;
    callback: EventBusEventCallback<any>;
};
