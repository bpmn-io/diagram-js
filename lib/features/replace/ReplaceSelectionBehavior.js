export default function ReplaceSelectionBehavior(selection, eventBus) {

  eventBus.on('replace.end', 500, function(event) {
    const {
      newElement,
      hints = {}
    } = event;

    if (hints.select === false) {
      return;
    }

    selection.select(newElement);
  });

}

ReplaceSelectionBehavior.$inject = [ 'selection', 'eventBus' ];