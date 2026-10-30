import {
  bind,
  forEach
} from 'min-dash';

import {
  append as svgAppend,
  attr as svgAttr,
  classes as svgClasses,
  clear as svgClear,
  create as svgCreate
} from 'tiny-svg';

import {
  event as domEvent
} from 'min-dom';

import {
  isPrimaryButton
} from '../../util/Mouse.js';

import {
  transform
} from '../../util/SvgTransformUtil.js';

import { getReferencePoint } from './Resize.js';

import { isConnection } from '../../util/ModelUtil.js';

import { getBBox } from '../../util/Elements.js';

/**
 * @typedef {import('../../model/Types.js').Element} Element
 *
 * @typedef {import('../../core/Canvas.js').default} Canvas
 * @typedef {import('../../core/EventBus.js').default} EventBus
 * @typedef {import('./Resize.js').default} Resize
 * @typedef {import('./ResizeElements.js').default} ResizeElements
 * @typedef {import('../selection/Selection.js').default} Selection
 */

var HANDLE_OFFSET = -6,
    HANDLE_SIZE = 8,
    HANDLE_HIT_SIZE = 20;

var CLS_RESIZER = 'djs-resizer';

var directions = [ 'n', 'w', 's', 'e', 'nw', 'ne', 'se', 'sw' ];


/**
 * This component is responsible for adding resize handles.
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 * @param {Selection} selection
 * @param {Resize} resize
 * @param {ResizeElements} resizeElements
 */
export default function ResizeHandles(eventBus, canvas, selection, resize, resizeElements) {

  this._resize = resize;
  this._resizeElements = resizeElements;
  this._canvas = canvas;

  var self = this;

  function updateResizers(elements) {

    // remove old selection markers
    self.removeResizers();

    if (elements.length === 1) {
      forEach(elements, bind(self.addResizer, self));
    } else if (elements.length > 1) {
      self.addMultiResizer(elements);
    }
  }

  eventBus.on('selection.changed', function(e) {
    updateResizers(e.newSelection);
  });

  eventBus.on('shape.changed', function(e) {
    var shape = e.element;

    if (selection.isSelected(shape)) {
      updateResizers(selection.get());
    }
  });
}


ResizeHandles.prototype.makeDraggable = function(element, gfx, direction) {
  var resize = this._resize;

  bindStart(gfx, function(event) {
    resize.activate(event, element, direction);
  });
};


ResizeHandles.prototype._createResizer = function(element, x, y, direction) {
  var resizersParent = this._getResizersParent();

  var offset = getHandleOffset(direction);

  var group = svgCreate('g');

  svgClasses(group).add(CLS_RESIZER);

  if (element) {
    svgClasses(group).add(CLS_RESIZER + '-' + element.id);
  }

  svgClasses(group).add(CLS_RESIZER + '-' + direction);

  svgAppend(resizersParent, group);

  var visual = svgCreate('rect');

  svgAttr(visual, {
    x: -HANDLE_SIZE / 2 + offset.x,
    y: -HANDLE_SIZE / 2 + offset.y,
    rx: 2,
    width: HANDLE_SIZE,
    height: HANDLE_SIZE
  });

  svgClasses(visual).add(CLS_RESIZER + '-visual');

  svgAppend(group, visual);

  var hit = svgCreate('rect');

  svgAttr(hit, {
    x: -HANDLE_HIT_SIZE / 2 + offset.x,
    y: -HANDLE_HIT_SIZE / 2 + offset.y,
    width: HANDLE_HIT_SIZE,
    height: HANDLE_HIT_SIZE
  });

  svgClasses(hit).add(CLS_RESIZER + '-hit');

  svgAppend(group, hit);

  transform(group, x, y);

  return group;
};

ResizeHandles.prototype.createResizer = function(element, direction) {
  var point = getReferencePoint(element, direction);

  var resizer = this._createResizer(element, point.x, point.y, direction);

  this.makeDraggable(element, resizer, direction);
};

// resize handles implementation ///////////////////////////////

/**
 * Add resizers for a given element.
 *
 * @param {Element} element
 */
ResizeHandles.prototype.addResizer = function(element) {
  var self = this;

  if (isConnection(element)) {
    return;
  }

  forEach(directions, function(direction) {
    if (self._resize.canResize({ shape: element, direction: direction })) {
      self.createResizer(element, direction);
    }
  });
};

/**
 * Add resizers resizing the given elements together.
 *
 * @param {Element[]} elements
 */
ResizeHandles.prototype.addMultiResizer = function(elements) {
  var self = this,
      resizeElements = this._resizeElements;

  var bounds = getBBox(elements);

  forEach(directions, function(direction) {
    if (!resizeElements.getResizableElements(elements, direction).length) {
      return;
    }

    var point = getReferencePoint(bounds, direction);

    var resizer = self._createResizer(null, point.x, point.y, direction);

    bindStart(resizer, function(event) {
      resizeElements.activate(event, elements, direction);
    });
  });
};

/**
 * Remove all resizers
 */
ResizeHandles.prototype.removeResizers = function() {
  var resizersParent = this._getResizersParent();

  svgClear(resizersParent);
};

ResizeHandles.prototype._getResizersParent = function() {
  return this._canvas.getLayer('resizers');
};

ResizeHandles.$inject = [
  'eventBus',
  'canvas',
  'selection',
  'resize',
  'resizeElements'
];

// helpers //////////

function bindStart(gfx, start) {

  function startResize(event) {

    // only trigger on left mouse button
    if (isPrimaryButton(event)) {
      start(event);
    }
  }

  domEvent.bind(gfx, 'mousedown', startResize);
  domEvent.bind(gfx, 'touchstart', startResize);
}

function getHandleOffset(direction) {
  var offset = {
    x: 0,
    y: 0
  };

  if (direction.indexOf('e') !== -1) {
    offset.x = -HANDLE_OFFSET;
  } else if (direction.indexOf('w') !== -1) {
    offset.x = HANDLE_OFFSET;
  }

  if (direction.indexOf('s') !== -1) {
    offset.y = -HANDLE_OFFSET;
  } else if (direction.indexOf('n') !== -1) {
    offset.y = HANDLE_OFFSET;
  }

  return offset;
}