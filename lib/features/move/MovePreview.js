import {
  flatten,
  forEach,
  filter,
  find,
  groupBy,
  map,
  matchPattern,
  size
} from 'min-dash';

import {
  selfAndAllChildren
} from '../../util/Elements';

import {
  append as svgAppend,
  attr as svgAttr,
  clear as svgClear,
  create as svgCreate
} from 'tiny-svg';

import { translate } from '../../util/SvgTransformUtil';

var LOW_PRIORITY = 499;

var MARKER_DRAGGING = 'djs-dragging',
    MARKER_OK = 'drop-ok',
    MARKER_NOT_OK = 'drop-not-ok',
    MARKER_NEW_PARENT = 'new-parent',
    MARKER_ATTACH = 'attach-ok';


/**
 * Provides previews for moving shapes when moving.
 *
 * @param {EventBus} eventBus
 * @param {ElementRegistry} elementRegistry
 * @param {Canvas} canvas
 * @param {Styles} styles
 */
export default function MovePreview(
    eventBus, elementRegistry, canvas,
    styles, previewSupport) {

  function getVisualDragShapes(shapes) {
    var elements = getAllDraggedElements(shapes);

    var filteredElements = removeEdges(elements);

    return filteredElements;
  }

  function getAllDraggedElements(shapes) {
    var allShapes = selfAndAllChildren(shapes, true);

    var allConnections = map(allShapes, function(shape) {
      return (shape.incoming || []).concat(shape.outgoing || []);
    });

    return flatten(allShapes.concat(allConnections));
  }

  /**
   * Sets drop marker on an element.
   */
  function setMarker(element, marker) {

    [ MARKER_ATTACH, MARKER_OK, MARKER_NOT_OK, MARKER_NEW_PARENT ].forEach(function(m) {

      if (m === marker) {
        canvas.addMarker(element, m);
      } else {
        canvas.removeMarker(element, m);
      }
    });
  }

  /**
   * Make an element draggable.
   *
   * @param {Object} context
   * @param {djs.model.Base} element
   * @param {Boolean} addMarker
   */
  function makeDraggable(context, element, addMarker) {

    previewSupport.addDragger(element, context.dragGroup);

    if (addMarker) {
      canvas.addMarker(element, MARKER_DRAGGING);
    }

    if (context.allDraggedElements) {
      context.allDraggedElements.push(element);
    } else {
      context.allDraggedElements = [ element ];
    }
  }

  // assign a low priority to this handler
  // to let others modify the move context before
  // we draw things
  eventBus.on('shape.move.start', LOW_PRIORITY, function(event) {

    var context = event.context,
        dragShapes = context.shapes,
        allDraggedElements = context.allDraggedElements;

    var visuallyDraggedShapes = getVisualDragShapes(dragShapes);

    if (!context.dragGroup) {
      var dragGroup = svgCreate('g');
      svgAttr(dragGroup, styles.cls('djs-drag-group', [ 'no-events' ]));

      var defaultLayer = canvas.getDefaultLayer();

      svgAppend(defaultLayer, dragGroup);

      context.dragGroup = dragGroup;
    }

    // add previews
    visuallyDraggedShapes.forEach(function(shape) {
      previewSupport.addDragger(shape, context.dragGroup);
    });

    // cache all dragged elements / gfx
    // so that we can quickly undo their state changes later
    if (!allDraggedElements) {
      allDraggedElements = getAllDraggedElements(dragShapes);
    } else {
      allDraggedElements = flatten([
        allDraggedElements,
        getAllDraggedElements(dragShapes)
      ]);
    }

    // add dragging marker
    forEach(allDraggedElements, function(e) {
      canvas.addMarker(e, MARKER_DRAGGING);
    });

    context.allDraggedElements = allDraggedElements;

    // determine, if any of the dragged elements have different parents
    context.differentParents = haveDifferentParents(dragShapes);
  });

  // update previews
  eventBus.on('shape.move.move', LOW_PRIORITY, function(event) {

    var context = event.context,
        dragGroup = context.dragGroup,
        target = context.target,
        parent = context.shape.parent,
        canExecute = context.canExecute;

    if (target) {
      if (canExecute === 'attach') {
        setMarker(target, MARKER_ATTACH);
      } else if (context.canExecute && target && target.id !== parent.id) {
        setMarker(target, MARKER_NEW_PARENT);
      } else {
        setMarker(target, context.canExecute ? MARKER_OK : MARKER_NOT_OK);
      }
    }

    translate(dragGroup, event.dx, event.dy);
  });

  eventBus.on([ 'shape.move.out', 'shape.move.cleanup' ], function(event) {
    var context = event.context,
        target = context.target;

    if (target) {
      setMarker(target, null);
    }
  });

  // remove previews
  eventBus.on('shape.move.cleanup', function(event) {

    var context = event.context,
        allDraggedElements = context.allDraggedElements,
        dragGroup = context.dragGroup;


    // remove dragging marker
    forEach(allDraggedElements, function(e) {
      canvas.removeMarker(e, MARKER_DRAGGING);
    });

    if (dragGroup) {
      svgClear(dragGroup);
    }
  });


  // API //////////////////////

  /**
   * Make an element draggable.
   *
   * @param {Object} context
   * @param {djs.model.Base} element
   * @param {Boolean} addMarker
   */
  this.makeDraggable = makeDraggable;
}

MovePreview.$inject = [
  'eventBus',
  'elementRegistry',
  'canvas',
  'styles',
  'previewSupport'
];


// helpers //////////////////////

/**
 * returns elements minus all connections
 * where source or target is not elements
 */
function removeEdges(elements) {

  var filteredElements = filter(elements, function(element) {

    if (!isConnection(element)) {
      return true;
    } else {

      return (
        find(elements, matchPattern({ id: element.source.id })) &&
        find(elements, matchPattern({ id: element.target.id }))
      );
    }
  });

  return filteredElements;
}

function haveDifferentParents(elements) {
  return size(groupBy(elements, function(e) { return e.parent && e.parent.id; })) !== 1;
}

/**
 * Checks if an element is a connection.
 */
function isConnection(element) {
  return element.waypoints;
}
