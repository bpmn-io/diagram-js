import {
  forEach,
  isArray
} from 'min-dash';

/**
 * @typedef {import('didi').Injector} Injector
 *
 * @typedef {import('../../core/EventBus').default} EventBus
 */

var NOT_REGISTERED_ERROR = 'is not a registered action',
    IS_REGISTERED_ERROR = 'is already registered';


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
 * @param {EventBus} eventBus
 * @param {Injector} injector
 */
export default function EditorActions(eventBus, injector) {

  // initialize actions
  this._actions = {};

  var self = this;

  eventBus.on('diagram.init', function() {

    // all diagram modules got loaded; check which ones
    // are available and register the respective default actions
    self._registerDefaultActions(injector);

    // ask interested parties to register available editor
    // actions on diagram initialization
    eventBus.fire('editorActions.init', {
      editorActions: self
    });
  });

}

EditorActions.$inject = [
  'eventBus',
  'injector'
];

/**
 * Register default actions.
 *
 * @param {Injector} injector
 */
EditorActions.prototype._registerDefaultActions = function(injector) {

  // (1) retrieve optional components to integrate with

  var commandStack = injector.get('commandStack', false);
  var modeling = injector.get('modeling', false);
  var selection = injector.get('selection', false);
  var zoomScroll = injector.get('zoomScroll', false);
  var copyPaste = injector.get('copyPaste', false);
  var canvas = injector.get('canvas', false);
  var rules = injector.get('rules', false);
  var keyboardMove = injector.get('keyboardMove', false);
  var keyboardMoveSelection = injector.get('keyboardMoveSelection', false);

  // (2) check components and register actions

  if (commandStack) {
    this.register('undo', function() {
      commandStack.undo();
    });

    this.register('redo', function() {
      commandStack.redo();
    });
  }

  if (copyPaste && selection) {
    this.register('copy', function() {
      var selectedElements = selection.get();

      if (selectedElements.length) {
        return copyPaste.copy(selectedElements);
      }
    });
  }

  if (copyPaste) {
    this.register('paste', function() {
      copyPaste.paste();
    });
  }

  if (zoomScroll) {
    this.register('stepZoom', function(opts) {
      zoomScroll.stepZoom(opts.value);
    });
  }

  if (canvas) {
    this.register('zoom', function(opts) {
      canvas.zoom(opts.value);
    });
  }

  if (modeling && selection && rules) {
    this.register('removeSelection', function() {

      var selectedElements = selection.get();

      if (!selectedElements.length) {
        return;
      }

      var allowed = rules.allowed('elements.delete', { elements: selectedElements }),
          removableElements;

      if (allowed === false) {
        return;
      }
      else if (isArray(allowed)) {
        removableElements = allowed;
      }
      else {
        removableElements = selectedElements;
      }

      if (removableElements.length) {
        modeling.removeElements(removableElements.slice());
      }
    });
  }

  if (keyboardMove) {
    this.register('moveCanvas', function(opts) {
      keyboardMove.moveCanvas(opts);
    });
  }

  if (keyboardMoveSelection) {
    this.register('moveSelection', function(opts) {
      keyboardMoveSelection.moveSelection(opts.direction, opts.accelerated);
    });
  }

};


/**
 * Triggers a registered action
 *
 * @param {string} action
 * @param {Object} opts
 *
 * @return {unknown} Returns what the registered listener returns
 */
EditorActions.prototype.trigger = function(action, opts) {
  if (!this._actions[action]) {
    throw error(action, NOT_REGISTERED_ERROR);
  }

  return this._actions[action](opts);
};


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
 * @param {Object} actions
 */
EditorActions.prototype.register = function(actions, listener) {
  var self = this;

  if (typeof actions === 'string') {
    return this._registerAction(actions, listener);
  }

  forEach(actions, function(listener, action) {
    self._registerAction(action, listener);
  });
};

/**
 * Registers a listener to an action key
 *
 * @param {string} action
 * @param {Function} listener
 */
EditorActions.prototype._registerAction = function(action, listener) {
  if (this.isRegistered(action)) {
    throw error(action, IS_REGISTERED_ERROR);
  }

  this._actions[action] = listener;
};

/**
 * Unregister an existing action
 *
 * @param {string} action
 */
EditorActions.prototype.unregister = function(action) {
  if (!this.isRegistered(action)) {
    throw error(action, NOT_REGISTERED_ERROR);
  }

  this._actions[action] = undefined;
};

/**
 * Returns the identifiers of all currently registered editor actions
 *
 * @return {string[]}
 */
EditorActions.prototype.getActions = function() {
  return Object.keys(this._actions);
};

/**
 * Checks wether the given action is registered
 *
 * @param {string} action
 *
 * @return {boolean}
 */
EditorActions.prototype.isRegistered = function(action) {
  return !!this._actions[action];
};


function error(action, message) {
  return new Error(action + ' ' + message);
}
