/**
 * Select element after auto placement.
 *
 * @param {EventBus} eventBus
 * @param {Selection} selection
 */
export default class AutoPlaceSelectionBehavior {
  constructor(eventBus, selection) {

    eventBus.on('autoPlace.end', 500, function(e) {
      selection.select(e.shape);
    });
  }
}

AutoPlaceSelectionBehavior.$inject = [
  'eventBus',
  'selection'
];