'use strict';

/**
 * A helper that creates Space in a defined Area by moving Shapes out of the way.
 */
function CreateSpace(eventBus, dragging, elementRegistry, modeling) {

  eventBus.on('create-space.start', function(event) {
    //TODO: show space that will be created interactively
  });

  eventBus.on('create-space.end', function(event) {
    //TODO: check if x or y delta is bigger and create space in a horizontal or vertical fashion appropriately
    //TODO: also move all waypoints

    // don't do anything if delta is zero
    if (event.dx !== 0){
      //get point of drag origin
      var originx = event.x - event.dx;
      //get all shapes that are a direct child of root and on the side of originx in which the delta points
      var elements = elementRegistry.filter(function(element) {
        if(element.x && element.parent.id === 'root' && ( (event.dx > 0 && element.x > originx) || (event.dx < 0 && element.x < originx) ) )
          return element;
      });
      //move all found shapes
      modeling.moveShapes(elements, { x: event.dx});
    }
  });

  this.start = function(event, canvas, direction) {
    dragging.activate(event, 'create-space', {
      autoActivate: true
    });
  };

}

CreateSpace.$inject = [ 'eventBus', 'dragging', 'elementRegistry', 'modeling' ];

module.exports = CreateSpace;
