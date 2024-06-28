import IdGenerator from '../../util/IdGenerator';

const Ids = new IdGenerator();


/**
 * @typedef { {
 *   promise: Promise<unknown>,
 *   executionId: number
 * } } ScheduledTask
 */

/**
 * A utility that allows you to schedule async tasks.
 *
 * @class
 * @constructor
 *
 * @param { import('../core/EventBus').default } eventBus
 */
export default function Scheduler(eventBus) {

  /**
   * @type { Record<string, ScheduledTask> }
   */
  this._scheduled = {};

  eventBus.on('diagram.destroy', () => {
    Object.keys(this._scheduled).forEach(id => {
      this.cancel(id);
    });
  });
}

Scheduler.$inject = [ 'eventBus' ];

/**
 * Schedule execution of a task in the next tick.
 *
 * Call with an id to ensure only the latest call will be executed.
 *
 * @template T

 * @param {(...args: any[]) => T} taskFn function to be executed
 * @param {string} [id] identifying the task to ensure uniqueness
 *
 * @return Promise<T> result of the executed task
 */
Scheduler.prototype.schedule = function(taskFn, id = Ids.next()) {

  this.cancel(id);

  const newScheduled = this._schedule(taskFn, id);

  this._scheduled[id] = newScheduled;

  return newScheduled.promise;
};

Scheduler.prototype._schedule = function(taskFn, id) {

  const {
    promise,
    resolve,
    reject
  } = defer();

  const executionId = requestAnimationFrame(() => {
    try {
      resolve(taskFn());
    } catch (error) {
      reject(error);
    }
  });

  return {
    executionId,
    promise
  };
};

/**
 * Cancel a previously scheduled task.
 *
 * @param {string} id
 */
Scheduler.prototype.cancel = function(id) {

  const scheduled = this._scheduled[id];

  if (scheduled) {
    this._cancel(scheduled);

    this._scheduled[id] = null;
  }
};

Scheduler.prototype._cancel = function(scheduled) {
  cancelAnimationFrame(scheduled.executionId);
};

/**
 * @return { {
 *   promise: Promise,
 *   resolve: Function,
 *   reject: Function
 * } }
 */
function defer() {

  let resolve;
  let reject;

  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  return {
    promise,
    resolve,
    reject
  };
}