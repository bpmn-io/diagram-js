import { values } from 'min-dash';

import {
  getEnclosedElements
} from '../../util/Elements';

import {
  hasSecondaryModifier
} from '../../util/Mouse';

import {
  append as svgAppend,
  attr as svgAttr,
  classes as svgClasses,
  create as svgCreate,
  remove as svgRemove
} from 'tiny-svg';

/**
 * @typedef {import('../../core/Canvas').default} Canvas
 * @typedef {import('../dragging/Dragging').default} Dragging
 * @typedef {import('../../core/ElementRegistry').default} ElementRegistry
 * @typedef {import('../../core/EventBus').default} EventBus
 * @typedef {import('../mouse/Mouse').default} Mouse
 * @typedef {import('../selection/Selection').default} Selection
 * @typedef {import('../tool-manager/ToolManager').default} ToolManager
 *
 * @typedef {import('../../util/Types').Rect} Rect
 * @typedef {import('../../model/Types').Element} Element
 *
 * @typedef { {
 *   add?: boolean,
 *   bbox?: Rect,
 *   marked?: Set<Element>,
 *   lastMarked?: Set<Element>,
 *   initialMarked?: Set<Element>,
 *   frame?: SVGElement
 * } } LassoContext
 */

var LASSO_TOOL_CURSOR = 'crosshair';

var MARKER_SELECTED = 'selected';
var LASSO_ACTIVE_CLS = 'djs-dragging-active-lasso';

/**
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 * @param {Dragging} dragging
 * @param {ElementRegistry} elementRegistry
 * @param {Selection} selection
 * @param {ToolManager} toolManager
 * @param {Mouse} mouse
 */
export default function LassoTool(
    eventBus, canvas, dragging,
    elementRegistry, selection, toolManager,
    mouse) {

  this._selection = selection;
  this._dragging = dragging;
  this._mouse = mouse;

  var self = this;

  // lasso visuals implementation

  /**
  * A helper that realizes the selection box visual
  */
  var visuals = {

    /**
     * @param {LassoContext} context
     */
    create: function(context) {
      var container = canvas.getActiveLayer();
      var frame = context.frame = svgCreate('rect');

      svgAttr(frame, {
        class: 'djs-lasso-overlay',
        width:  1,
        height: 1,
        x: 0,
        y: 0
      });

      svgAppend(container, frame);

      toggleLassoMarkerClass(true);

      this.update(context);
    },

    /**
     * @param {LassoContext} context
     */
    update: function(context) {
      var frame = context.frame,
          bbox = context.bbox;

      if (frame && bbox) {
        svgAttr(frame, {
          x: bbox.x,
          y: bbox.y,
          width: bbox.width,
          height: bbox.height
        });
      }

      var currentlyMarked = context.marked,
          lastMarked = context.lastMarked;

      if (currentlyMarked && lastMarked) {
        for (const e of lastMarked) {
          if (!currentlyMarked.has(e)) {
            canvas.removeMarker(e, MARKER_SELECTED);
          }
        }

        for (const e of currentlyMarked) {
          if (!lastMarked.has(e)) {
            canvas.addMarker(e, MARKER_SELECTED);
          }
        }
      }
    },

    /**
     * @param {LassoContext} context
     */
    remove: function(context) {

      this.update(context);

      if (context.frame) {
        svgRemove(context.frame);
      }

      toggleLassoMarkerClass(false);
    }
  };

  function toggleLassoMarkerClass(enabled) {
    svgClasses(canvas.getContainer()).toggle(LASSO_ACTIVE_CLS, enabled);
  }

  /**
   * @param {Rect} bbox
   *
   * @return {Set<Element>}
   */
  function getAllEnclosedElements(bbox) {

    var allElements = elementRegistry.getAll();

    return new Set(
      values(getEnclosedElements(allElements, bbox))
    );
  }

  toolManager.registerTool('lasso', {
    tool: 'lasso.selection',
    dragging: 'lasso'
  });

  eventBus.on('lasso.selection.end', function(event) {
    var target = event.originalEvent.target;

    // only reactive on diagram click
    // on some occasions, event.hover is not set and we have to check if the target is an svg
    if (!event.hover && !(target instanceof SVGElement)) {
      return;
    }

    eventBus.once('lasso.selection.ended', function() {
      self.activateLasso(event.originalEvent, true);
    });
  });

  // lasso interaction implementation

  eventBus.on('lasso.end', 0, function(event) {

    /**
     * @type {LassoContext}
     */
    var context = event.context;

    self._select(Array.from(context.marked));
  });

  eventBus.on('lasso.start', function(event) {

    /**
     * @type {LassoContext}
     */
    var context = event.context;

    context.bbox = toBBox(event);
    context.add = hasSecondaryModifier(event);
    context.lastMarked = new Set(selection.get());

    if (context.add) {
      context.marked = context.lastMarked;
    } else {
      context.marked = new Set();
    }

    context.initialMarked = context.marked;

    visuals.create(context);
  });

  eventBus.on('lasso.move', function(event) {

    /**
     * @type {LassoContext}
     */
    var context = event.context;

    var bbox = context.bbox = toBBox(event);

    var enclosedElements = getAllEnclosedElements(bbox);

    var marked = context.initialMarked.union(enclosedElements);

    context.lastMarked = context.marked;
    context.marked = marked;

    visuals.update(context);
  });

  eventBus.on('lasso.cleanup', function(event) {

    /**
     * @type {LassoContext}
     */
    var context = event.context;

    context.lastMarked = context.marked;
    context.marked = new Set(selection.get());

    visuals.remove(event.context);
  });


  // event integration

  eventBus.on('element.mousedown', 1500, function(event) {

    if (!hasSecondaryModifier(event)) {
      return;
    }

    self.activateLasso(event.originalEvent);

    // we've handled the event
    return true;
  });
}

LassoTool.$inject = [
  'eventBus',
  'canvas',
  'dragging',
  'elementRegistry',
  'selection',
  'toolManager',
  'mouse'
];

/**
 * Activate lasso.
 *
 * @param {MouseEvent} event
 * @param {boolean} [autoActivate=false]
 */
LassoTool.prototype.activateLasso = function(event, autoActivate) {

  this._dragging.init(event, 'lasso', {
    autoActivate: autoActivate,
    cursor: LASSO_TOOL_CURSOR,
    data: {
      context: {}
    },
    keepSelection: true
  });
};

/**
 * Activate selection.
 *
 * @param {MouseEvent} event
 * @param {boolean} [autoActivate=false]
 */
LassoTool.prototype.activateSelection = function(event, autoActivate) {

  this._dragging.init(event, 'lasso.selection', {
    trapClick: false,
    autoActivate: autoActivate,
    cursor: LASSO_TOOL_CURSOR,
    data: {
      context: {}
    },
    keepSelection: true
  });
};

/**
 * Select elements.
 *
 * @param {Element[]} elements
 */
LassoTool.prototype._select = function(elements) {
  this._selection.select(elements);
};

/**
 * Select elements within the given bounds.
 *
 * @param {Element[]} elements
 * @param {Rect} bbox
 * @param {Element[]} [previousSelection]
 */
LassoTool.prototype.select = function(elements, bbox, previousSelection = []) {
  var selectedElements = values(getEnclosedElements(elements, bbox));

  this._select([
    ...previousSelection,
    ...selectedElements
  ]);
};

/**
 * Toggle the lasso tool.
 */
LassoTool.prototype.toggle = function() {
  if (this.isActive()) {
    return this._dragging.cancel();
  }

  var mouseEvent = this._mouse.getLastMoveEvent();

  this.activateSelection(mouseEvent, !!mouseEvent);
};

/**
 * Check if the lasso tool is active.
 *
 * @returns {boolean}
 */
LassoTool.prototype.isActive = function() {
  var context = this._dragging.context();

  return context && /^lasso/.test(context.prefix);
};


/**
 * @param {Event} event
 *
 * @return {Rect}
 */
function toBBox(event) {

  var start = {

    x: event.x - event.dx,
    y: event.y - event.dy
  };

  var end = {
    x: event.x,
    y: event.y
  };

  var bbox;

  if ((start.x <= end.x && start.y < end.y) ||
      (start.x < end.x && start.y <= end.y)) {

    bbox = {
      x: start.x,
      y: start.y,
      width:  end.x - start.x,
      height: end.y - start.y
    };
  } else if ((start.x >= end.x && start.y < end.y) ||
             (start.x > end.x && start.y <= end.y)) {

    bbox = {
      x: end.x,
      y: start.y,
      width:  start.x - end.x,
      height: end.y - start.y
    };
  } else if ((start.x <= end.x && start.y > end.y) ||
             (start.x < end.x && start.y >= end.y)) {

    bbox = {
      x: start.x,
      y: end.y,
      width:  end.x - start.x,
      height: start.y - end.y
    };
  } else if ((start.x >= end.x && start.y > end.y) ||
             (start.x > end.x && start.y >= end.y)) {

    bbox = {
      x: end.x,
      y: end.y,
      width:  start.x - end.x,
      height: start.y - end.y
    };
  } else {

    bbox = {
      x: end.x,
      y: end.y,
      width:  0,
      height: 0
    };
  }
  return bbox;
}
