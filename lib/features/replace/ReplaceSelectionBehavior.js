/**
 * @typedef {import('../../core/EventBus.js').default} EventBus
 * @typedef {import('../selection/Selection.js').default} Selection
 *
 * @typedef {import('didi').Injector} Injector
 */

/**
 * Behavior that preserves selection across element replacement.
 *
 * @param {EventBus} eventBus
 * @param {Injector} injector
 */
export default function ReplaceSelectionBehavior(eventBus, injector) {

  /**
   * @type {Selection}
   */
  var selection = injector.get('selection', false);

  // unless specified otherwise, deduce selection
  // status from previous element selected state
  eventBus.on('replace.start', function(event) {

    const {
      element,
      hints
    } = event;

    if ('select' in hints) {
      return;
    }

    hints.select = selection.isSelected(element);
  });

  // preserve selection on element replacement
  // old element selected -> replacement selected
  eventBus.on('replace.end', function(event) {

    const {
      newElement,
      hints
    } = event;

    if (hints.select) {
      selection.select(newElement, true);
    }
  });

}

ReplaceSelectionBehavior.$inject = [ 'eventBus', 'injector' ];