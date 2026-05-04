/**
 * @typedef {import('../../core/EventBus').default} EventBus
 * @typedef {import('../../core/Canvas').default} Canvas
 */

/**
 * A service that allows to temporarily lock user interactions
 * while still allowing programmatic changes via modeling APIs.
 *
 * Pan/zoom (navigation) remains enabled even while locked.
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 */
export default function InteractionLock(eventBus, canvas) {
  this._eventBus = eventBus;
  this._canvas = canvas;
  this._locked = false;
}

InteractionLock.$inject = [ 'eventBus', 'canvas' ];

/**
 * Lock user interactions.
 */
InteractionLock.prototype.lock = function() {
  if (this._locked) {
    return;
  }

  this._locked = true;

  var container = this._canvas.getContainer();
  container.classList.add('djs-interaction-locked');

  this._eventBus.fire('interactionLock.changed', { locked: true });
};

/**
 * Unlock user interactions.
 */
InteractionLock.prototype.unlock = function() {
  if (!this._locked) {
    return;
  }

  this._locked = false;

  var container = this._canvas.getContainer();
  container.classList.remove('djs-interaction-locked');

  this._eventBus.fire('interactionLock.changed', { locked: false });
};

/**
 * Check whether interactions are currently locked.
 *
 * @return {boolean}
 */
InteractionLock.prototype.isLocked = function() {
  return this._locked;
};
