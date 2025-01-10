/**
 * An interface that provides access to modeling actions by decoupling
 * the one who requests the action to be triggered and the trigger itself.
 *
 * It's possible to add new actions by registering them with ´registerAction´
 * and likewise unregister existing ones with ´unregisterAction´.
 *
 *
 * ## Life-Cycle and configuration
 *
 * The editor actions will wait for diagram initialization before
 * registering default actions _and_ firing an `editorActions.init` event.
 *
 * Interested parties may listen to the `editorActions.init` event with
 * low priority to check, which actions got registered. Other components
 * may use the event to register their own actions via `registerAction`.
 *
 */
export default class EditorActions {
  static $inject: string[];

  /**
   * @param eventBus
   * @param injector
   */
  constructor(eventBus: EventBus, injector: Injector);

  /**
   * Triggers a registered action
   *
   * @param action
   * @param opts
   *
   * @return Returns what the registered listener returns
   */
  trigger(action: string, opts: any): unknown;

  /**
   * Registers a collections of actions.
   * The key of the object will be the name of the action.
   *
   * @example
   *
   * ```javascript
   * var actions = {
   *   spaceTool: function() {
   *     spaceTool.activateSelection();
   *   },
   *   lassoTool: function() {
   *     lassoTool.activateSelection();
   *   }
   * ];
   *
   * editorActions.register(actions);
   *
   * editorActions.isRegistered('spaceTool'); // true
   * ```
   *
   * @param actions
   */
  register(actions: any): void;

  /**
   * Unregister an existing action
   *
   * @param action
   */
  unregister(action: string): void;

  /**
   * Returns the identifiers of all currently registered editor actions
   *
   * @return
   */
  getActions(): string[];

  /**
   * Checks wether the given action is registered
   *
   * @param action
   *
   * @return
   */
  isRegistered(action: string): boolean;
}

type Injector = import('didi').Injector;
type EventBus = import('../../core/EventBus').default;
