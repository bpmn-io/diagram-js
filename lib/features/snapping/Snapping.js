import {
  bind,
  debounce,
  forEach,
  isNumber,
  isObject
} from 'min-dash';

import {
  isSnapped,
  setSnapped
} from './SnapUtil';

import {
  append as svgAppend,
  attr as svgAttr,
  classes as svgClasses,
  create as svgCreate
} from 'tiny-svg';

var SNAP_TOLERANCE = 7;

export var SNAP_LINE_HIDE_DELAY = 1000;


/**
 * Generic snapping feature.
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 */
export default function Snapping(canvas) {
  this._canvas = canvas;

  // delay hide by 1000 seconds since last snap
  this._asyncHide = debounce(bind(this.hide, this), SNAP_LINE_HIDE_DELAY);
}

Snapping.$inject = [ 'canvas' ];

/**
 * Snap an event to given snap points.
 *
 * @param {Event} event
 * @param {SnapPoints} snapPoints
 */
Snapping.prototype.snap = function(event, snapPoints) {
  var context = event.context,
      snapContext = context.snapContext,
      snapLocations = snapContext.getSnapLocations();

  var snapping = {
    x: isSnapped(event, 'x'),
    y: isSnapped(event, 'y')
  };

  forEach(snapLocations, function(location) {
    var snapOrigin = snapContext.getSnapOrigin(location);

    var snapCurrent = {
      x: event.x + snapOrigin.x,
      y: event.y + snapOrigin.y
    };

    // snap both axis if not snapped already
    forEach([ 'x', 'y' ], function(axis) {
      var locationSnapping;

      if (!snapping[axis]) {
        locationSnapping = snapPoints.snap(snapCurrent, location, axis, SNAP_TOLERANCE);

        if (locationSnapping !== undefined) {
          snapping[axis] = {
            value: locationSnapping,
            originValue: locationSnapping - snapOrigin[axis]
          };
        }
      }
    });

    // no need to continue snapping
    if (snapping.x && snapping.y) {
      return false;
    }
  });

  // show snap lines
  this.showSnapLine('vertical', snapping.x && snapping.x.value);
  this.showSnapLine('horizontal', snapping.y && snapping.y.value);

  // snap event
  forEach([ 'x', 'y' ], function(axis) {
    var axisSnapping = snapping[axis];

    if (isObject(axisSnapping)) {
      setSnapped(event, axis, axisSnapping.originValue);
    }
  });
};

Snapping.prototype._createLine = function(orientation) {
  var root = this._canvas.getLayer('snap');

  var line = svgCreate('path');

  svgAttr(line, { d: 'M0,0 L0,0' });

  svgClasses(line).add('djs-snap-line');

  svgAppend(root, line);

  return {
    update: function(position) {

      if (!isNumber(position)) {
        svgAttr(line, { display: 'none' });
      } else {
        if (orientation === 'horizontal') {
          svgAttr(line, {
            d: 'M-100000,' + position + ' L+100000,' + position,
            display: ''
          });
        } else {
          svgAttr(line, {
            d: 'M ' + position + ',-100000 L ' + position + ', +100000',
            display: ''
          });
        }
      }
    }
  };
};

Snapping.prototype._createSnapLines = function() {
  this._snapLines = {
    horizontal: this._createLine('horizontal'),
    vertical: this._createLine('vertical')
  };
};

Snapping.prototype.showSnapLine = function(orientation, position) {

  var line = this.getSnapLine(orientation);

  if (line) {
    line.update(position);
  }

  this._asyncHide();
};

Snapping.prototype.getSnapLine = function(orientation) {
  if (!this._snapLines) {
    this._createSnapLines();
  }

  return this._snapLines[orientation];
};

Snapping.prototype.hide = function() {
  forEach(this._snapLines, function(snapLine) {
    snapLine.update();
  });
};
