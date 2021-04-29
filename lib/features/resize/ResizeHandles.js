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
} from '../../util/Mouse';

import {
  transform
} from '../../util/SvgTransformUtil';

import { getReferencePoint } from './Resize';

var HANDLE_OFFSET = -6,
    HANDLE_SIZE = 4,
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
 */
export default function ResizeHandles(eventBus, canvas, selection, resize) {

  this._resize = resize;
  this._canvas = canvas;

  var self = this;

  eventBus.on('selection.changed', function(e) {
    var newSelection = e.newSelection;

    // remove old selection markers
    self.removeResizers();

    // add new selection markers ONLY if single selection
    if (newSelection.length === 1) {
      forEach(newSelection, bind(self.addResizer, self));
    }
  });

  eventBus.on('shape.changed', function(e) {
    var shape = e.element;

    if (selection.isSelected(shape)) {
      self.removeResizers();

      self.addResizer(shape);
    }
  });
}


ResizeHandles.prototype.makeDraggable = function(element, gfx, direction) {
  var resize = this._resize;

  function startResize(event) {

    // only trigger on left mouse button
    if (isPrimaryButton(event)) {
      resize.activate(event, element, direction);
    }
  }

  domEvent.bind(gfx, 'mousedown', startResize);
  domEvent.bind(gfx, 'touchstart', startResize);
};


ResizeHandles.prototype._createResizer = function(element, x, y, direction) {
  var resizersParent = this._getResizersParent();

  var offset = getHandleOffset(direction);

  var group = svgCreate('g');

  svgClasses(group).add(CLS_RESIZER);
  svgClasses(group).add(CLS_RESIZER + '-' + element.id);
  svgClasses(group).add(CLS_RESIZER + '-' + direction);

  svgAppend(resizersParent, group);

  var visual = svgCreate('rect');

  svgAttr(visual, {
    x: -HANDLE_SIZE / 2 + offset.x,
    y: -HANDLE_SIZE / 2 + offset.y,
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
 * @param {djs.model.Shape} shape
 */
ResizeHandles.prototype.addResizer = function(shape) {
  var self = this;

  var resize = this._resize;

  if (!resize.canResize({ shape: shape })) {
    return;
  }

  forEach(directions, function(direction) {
    self.createResizer(shape, direction);
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
  'resize'
];

// helpers //////////

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