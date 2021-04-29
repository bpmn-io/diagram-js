import { forEach } from 'min-dash';

import {
  append as svgAppend,
  attr as svgAttr,
  classes as svgClasses,
  create as svgCreate,
  remove as svgRemove
} from 'tiny-svg';

import {
  event as domEvent,
  queryAll as domQueryAll
} from 'min-dom';

import {
  isPrimaryButton
} from '../../util/Mouse';

import {
  transform
} from '../../util/SvgTransformUtil';

var HANDLE_OFFSET = -6,
    HANDLE_SIZE = 4,
    HANDLE_HIT_SIZE = 20;

var CLS_RESIZER = 'djs-resizer';

var directions = [ 'n', 'w', 's', 'e', 'nw', 'ne', 'se', 'sw' ];

var VERY_LOW_PRIORITY = 250;


/**
 * This component is responsible for adding resize handles.
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 * @param {Selection} selection
 * @param {Resize} resize
 */
export default function ResizeHandles(eventBus, canvas, selection, resize, elementRegistry) {

  this._resize = resize;
  this._canvas = canvas;
  this._elementRegistry = elementRegistry;

  var self = this;

  eventBus.on([ 'shape.added' ], VERY_LOW_PRIORITY, function(event) {
    var element = event.element;

    self.addResizers(element);
  });

  eventBus.on('shape.changed', VERY_LOW_PRIORITY, function(event) {
    var element = event.element;

    self.removeResizers(element);

    self.addResizers(element);
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
  var gfx = this._elementRegistry.getGraphics(element);

  var offset = getHandleOffset(direction);

  var group = svgCreate('g');

  svgClasses(group).add(CLS_RESIZER);
  svgClasses(group).add(CLS_RESIZER + '-' + element.id);
  svgClasses(group).add(CLS_RESIZER + '-' + direction);

  svgAppend(gfx, group);

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
  var position = getResizerPosition(element, direction);

  var resizer = this._createResizer(element, position.x, position.y, direction);

  this.makeDraggable(element, resizer, direction);
};

// resize handles implementation ///////////////////////////////

/**
 * Add resizers for a given element.
 *
 * @param {djs.model.Shape} shape
 */
ResizeHandles.prototype.addResizers = function(shape) {
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
 * Remove resizers for a given element.
 *
 * @param {djs.model.Shape} shape
 */
ResizeHandles.prototype.removeResizers = function(shape) {
  var gfx = this._elementRegistry.getGraphics(shape),
      resizers = domQueryAll('.' + CLS_RESIZER, gfx);

  if (resizers) {
    resizers.forEach(function(resizer) {
      svgRemove(resizer);
    });
  }
};

ResizeHandles.$inject = [
  'eventBus',
  'canvas',
  'selection',
  'resize',
  'elementRegistry'
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

function getResizerPosition(shape, direction) {
  var resizerPosition = {
    x: shape.width / 2,
    y: shape.height / 2
  };

  if (direction.indexOf('n') !== -1) {
    resizerPosition.y = 0;
  } else if (direction.indexOf('s') !== -1) {
    resizerPosition.y = shape.height;
  }

  if (direction.indexOf('e') !== -1) {
    resizerPosition.x = shape.width;
  } else if (direction.indexOf('w') !== -1) {
    resizerPosition.x = 0;
  }

  return resizerPosition;
}