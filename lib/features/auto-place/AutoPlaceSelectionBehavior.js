/**
 * @typedef {import('../../core/EventBus.js').default} EventBus
 * @typedef {import('../selection/Selection.js').default} Selection
 *
 * @typedef {import('didi').Injector} Injector
 */

/**
 * Select element after auto placement.
 *
 * @param {EventBus} eventBus
 * @param {Injector} injector
 */
export default function AutoPlaceSelectionBehavior(eventBus, injector) {


  /**
   * @type {Selection}
   */
  var selection = injector.get('selection', false);

  selection && eventBus.on('autoPlace.end', 500, function(e) {
    selection.select(e.shape);
  });

}

AutoPlaceSelectionBehavior.$inject = [
  'eventBus',
  'injector'
];