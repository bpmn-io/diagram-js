'use strict';

/**
 * A helper that creates Space in a defined Area by moving Shapes out of the way.
 */
function CreateSpace(eventBus, dragging, elementRegistry, modeling) {

  eventBus.on('create-space.start', function(event) {
    //TODO: show space that will be created interactively
  });

  eventBus.on('create-space.end', function(event) {
    //do a horizontal create-space
    if(Math.abs(event.dx)>=Math.abs(event.dy)){
      // don't do anything if delta is zero
      if (event.dx !== 0){
        //get point of drag origin
        var originx = event.x - event.dx,
        elementsx = elementRegistry.filter(function(element) {
          if(
            element.x && // all shapes but not root
            element.parent.id === 'root' && // top level elements
            ( //on the side of originx in which the delta points
              (event.dx > 0 && element.x > originx) ||
              (event.dx < 0 && element.x < originx)
            )
          )
            return element;
        });
        //move all found shapes
        modeling.moveShapes(elementsx, { x: event.dx, y: 0});
      }
    }else{
      //do a vertical create-space
      // don't do anything if delta is zero
      if (event.dy !== 0){
        //get point of drag origin
        var originy = event.y - event.dy,
        elementsy = elementRegistry.filter(function(element) {
          if(
            element.y && // all shapes but not root
            element.parent.id === 'root' && // top level elements
            ( //on the side of originx in which the delta points
              (event.dy > 0 && element.y > originy) ||
              (event.dy < 0 && element.y < originy)
            )
          )
            return element;
        });
        //move all found shapes
        modeling.moveShapes(elementsy, { x: 0, y: event.dy});
      }
    }
  });

  this.start = function(event, canvas) {
    dragging.activate(event, 'create-space', {
      autoActivate: true
    });
  };

}

CreateSpace.$inject = [ 'eventBus', 'dragging', 'elementRegistry', 'modeling' ];

module.exports = CreateSpace;
