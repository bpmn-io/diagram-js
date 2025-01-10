/**
 * A utility that allows you to schedule async tasks.
 *
 *
 */
export default class Scheduler {
  static $inject: string[];

  /**
   * @param eventBus
   */
  constructor(eventBus: any);

  /**
   * Schedule execution of a task in the next tick.
   *
   * Call with an id to ensure only the latest call will be executed.
   *
   * @param taskFn function to be executed
   * @param id identifying the task to ensure uniqueness
   *
   * @return Promise<T> result of the executed task
   */
  schedule<T>(taskFn: (...args: any[]) => T, id?: string): Promise<any>;

  /**
   * Cancel a previously scheduled task.
   *
   * @param id
   */
  cancel(id: string): void;
}
export type ScheduledTask = {
    promise: Promise<unknown>;
    executionId: number;
};
