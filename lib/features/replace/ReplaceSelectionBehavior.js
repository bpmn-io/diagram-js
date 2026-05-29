export default function ReplaceSelectionBehavior(selection, eventBus) {

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

ReplaceSelectionBehavior.$inject = [ 'selection', 'eventBus' ];