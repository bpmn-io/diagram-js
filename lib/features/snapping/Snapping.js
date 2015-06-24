'use strict';

var filter = require('lodash/collection/filter'),
    forEach = require('lodash/collection/forEach'),
    assign = require('lodash/object/assign'),
    debounce = require('lodash/function/debounce');

var round = Math.round,
    max = Math.max,
    min = Math.min;

var mid = require('./SnapUtil').mid,
    isSnapped = require('./SnapUtil').isSnapped,
    setSnapped = require('./SnapUtil').setSnapped;

var SnapContext = require('./SnapContext');

/**
 * A general purpose snapping component for diagram elements.
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 */
function Snapping(eventBus, canvas) {

  this._canvas = canvas;

  var self = this;

  eventBus.on([ 'shape.move.start', 'create.start' ], function(event) {
    self.initSnap(event);
  });

  eventBus.on([ 'shape.move.move', 'shape.move.end', 'create.move', 'create.end' ], function(event) {

    if (event.originalEvent && event.originalEvent.ctrlKey) {
      return;
    }

    if (event.snapped) {
      return;
    }

    self.snap(event);
  });

  eventBus.on([ 'shape.move.cleanup', 'create.cleanup' ], function(event) {
    self.hideVisuals();
  });

  // delay hide by 1000 seconds since last match
  this._asyncHideVisuals = debounce(this.hideVisuals, 1000);
}

Snapping.$inject = [ 'eventBus', 'canvas' ];

module.exports = Snapping;


Snapping.prototype.initSnap = function(event) {

  var context = event.context,
      shape = context.shape,
      snapContext = context.snapContext;

  if (!snapContext) {
    snapContext = context.snapContext = new SnapContext();
  }

  var snapMid = mid(shape, event);

  snapContext.setSnapOrigin('mid', {
    x: snapMid.x - event.x,
    y: snapMid.y - event.y
  });

  return snapContext;
};


Snapping.prototype.snap = function(event) {

  var context = event.context,
      snapContext = context.snapContext,
      shape = context.shape,
      target = context.target;

  if (!target) {
    return;
  }

  var self = this;

  var snapping = {};

  forEach([ 'x', 'y' ], function(axis) {

    var axisSnapping;

    // make sure we only snap axis that have not been snapped yet
    if (!isSnapped(event, axis)) {

      // compute snapping
      axisSnapping = self._computeSnapping(event, axis, snapContext, shape, target);

      // apply snapping
      self._applySnapping(event, axisSnapping);
    }

    snapping[axis] = axisSnapping;
  });


  forEach(snapping, function(axisSnapping, axis) {

    // show visuals
    self._showVisuals(event, axis, axisSnapping);
  });
};


Snapping.prototype._computeSnapping = function(event, axis, snapContext, shape, target) {

  var snapLocations = snapContext.getSnapLocations(),
      snapPoints = snapContext.pointsForTarget(target),
      snapping;

  if (!snapPoints.initialized) {
    this.addTargetSnaps(snapPoints, shape, target);

    snapPoints.initialized = true;
  }

  forEach(snapLocations, function(location) {

    var snapOffset = snapContext.getSnapOrigin(location);

    // the point from where to snap right now
    // we compute this based on the current event
    // coordinates + the origin attachment
    var snapReference = {
      x: event.x + snapOffset.x,
      y: event.y + snapOffset.y
    };

    var locationSnapping = snapPoints.snap(snapReference, location, axis, 10);

    // skip if we snapped to any
    // of the snap locations
    if (locationSnapping) {

      snapping = assign({}, locationSnapping, {
        offset: snapOffset,
        delta: snapReference[axis] - locationSnapping[axis]
      });

      return false;
    }
  });

  return snapping;
};

Snapping.prototype._showVisuals = function(event, axis, snapping) {
  this.showSnapLine(event, axis, snapping);
};

Snapping.prototype._applySnapping = function(event, snapping) {

  if (!snapping) {
    return;
  }

  var axis = snapping.axis;

  event[axis] -= snapping.delta;
  event['d' + axis] -= snapping.delta;

  setSnapped(event, axis);
};

function createDistanceRulerPath(event, snapping) {

  var shape = snapping.context.shape,
      reference = snapping.context.reference;

  var shapeMid = {
    x: event.x + snapping.offset.x,
    y: event.y + snapping.offset.y
  };

  var shapeTopLeft = {
    x: shapeMid.x - round(shape.width / 2),
    y: shapeMid.y - round(shape.height / 2)
  };

  var shapeBottomRight = {
    x: shapeMid.x + round(shape.width / 2),
    y: shapeMid.y + round(shape.height / 2)
  };

  var referenceMid = mid(reference);

  var referenceBottomRight = {
    x: reference.x + reference.width,
    y: reference.y + reference.height
  };

  var referenceTopLeft = reference;

  var axis = snapping.axis,
      invertedAxis = axis === 'x' ? 'y' : 'x';

  var pad = 4, markerWidth = 5;

  var guideStart, guideEnd, marker, base, dottedGuide;

  var path;

  base = max(shapeTopLeft[invertedAxis] - pad,
           min(shapeBottomRight[invertedAxis] + pad, round((shapeMid[invertedAxis] + referenceMid[invertedAxis]) / 2)));

  guideStart = {};
  guideEnd = {};
  marker = { x: 0, y: 0 };

  marker[invertedAxis] = markerWidth;

  // shape is top or left of reference
  if (shapeMid[axis] < referenceMid[axis]) {
    guideStart[axis] = referenceTopLeft[axis] - pad;
    guideStart[invertedAxis] = base;

    guideEnd[axis] = shapeBottomRight[axis] + pad;
    guideEnd[invertedAxis] = base;
  }
  // shape is bottom or right of reference
  else {
    guideStart[axis] = referenceBottomRight[axis] + pad;
    guideStart[invertedAxis] = base;

    guideEnd[axis] = shapeTopLeft[axis] - pad;
    guideEnd[invertedAxis] = base;
  }

  if (guideStart[invertedAxis] > referenceBottomRight[invertedAxis]) {
    dottedGuide = {};
    dottedGuide[invertedAxis] = referenceTopLeft[invertedAxis];
    dottedGuide[axis] = guideStart[axis];
  }

  if (guideStart[invertedAxis] < referenceTopLeft[invertedAxis]) {
    dottedGuide = {};
    dottedGuide[invertedAxis] = referenceBottomRight[invertedAxis];
    dottedGuide[axis] = guideStart[axis];
  }

  function createDots(start, end) {

    var stepWidth = 8;

    var dx = (end.x - start.x);
    var dy = (end.y - start.y);

    var steps = (dx || dy) / stepWidth;
    var sign = steps > 0 ? 1 : -1;

    var i = Math.abs(steps);

    var results = [ 'M', start.x, start.y ];

    while (i >= 0) {

      results.push('l');
      results.push(dx ? 2 * sign : 0);
      results.push(dy ? 2 * sign : 0);

      results.push('m');
      results.push(dx ? 6 * sign : 0);
      results.push(dy ? 6 * sign : 0);

      i--;
    }

    return results.concat([ 'M', end.x, end.y ]);
  }

  var start = dottedGuide ? createDots(dottedGuide, guideStart) : [ 'M', guideStart.x, guideStart.y ];

  path = start.concat([
    'm', -marker.x, -marker.y,
    'l', marker.x * 2, marker.y * 2,
    'm', -marker.x, -marker.y,
    'L', guideEnd.x, guideEnd.y,
    'm', -marker.x, -marker.y,
    'l', marker.x * 2, marker.y * 2,
    'm', -marker.x, -marker.y
  ]);

  return path.join(' ').replace(/([\d]+) /, '$1,');
}


Snapping.prototype._createLine = function(axis) {

  var root = this._canvas.getLayer('snap');

  var defaultPath = 'M0,0 L0,0';

  var line = root.path(defaultPath).addClass('djs-snap-line');

  return {
    update: function(event, snapping) {

      var value,
          path = defaultPath,
          display = '',
          stroke = '';

      if (snapping) {
        if (snapping.type === 'distance') {
          display = '';
          path = createDistanceRulerPath(event, snapping);
          stroke='red';
        } else {
          value = snapping[axis];

          if (value === undefined) {
            display = 'none';
          } else {
            if (axis === 'y') {
              path = 'M-100000,' + value + ' L+100000,' + value;
            } else {
              path = 'M ' + value + ',-100000 L ' + value + ', +100000';
            }
          }
        }
      } else {
        display = 'none';
      }

      line.attr({ display: display, path: path, stroke: stroke });
    }
  };
};


Snapping.prototype._createSnapLines = function() {

  this._snapLines = {
    y: this._createLine('y'),
    x: this._createLine('x')
  };
};

Snapping.prototype.showSnapLine = function(event, axis, snapping) {

  var line = this.getSnapLine(axis);

  if (line) {
    line.update(event, snapping);
  }

  this._asyncHideVisuals();
};

Snapping.prototype.getSnapLine = function(axis) {
  if (!this._snapLines) {
    this._createSnapLines();
  }

  return this._snapLines[axis];
};

Snapping.prototype.hideVisuals = function() {
  forEach(this._snapLines, function(l) {
    l.update();
  });
};


/**
 * Adds distance snapping between the shape and the reference
 */
Snapping.prototype.addDefaultDistanceSnaps = function(snapContext, shape, reference, axisDistance, location) {

  var connectedMid = mid(reference);

  var offset = {
    x: axisDistance.x && round(axisDistance.x + (reference.width / 2) + (shape.width / 2)),
    y: axisDistance.y && round(axisDistance.y + (reference.height / 2) + (shape.height / 2))
  };

  var context = {
    shape: shape,
    reference: reference,
    offset: offset
  };

  if (axisDistance.x) {

    snapContext.addDefaultSnap(location, {
      x: connectedMid.x - offset.x,
      context: context,
      type: 'distance'
    });

    snapContext.addDefaultSnap(location, {
      x: connectedMid.x + offset.x,
      context: context,
      type: 'distance'
    });

  }

  if (axisDistance.y) {

    snapContext.addDefaultSnap(location, {
      y: connectedMid.y + offset.y,
      context: context,
      type: 'distance'
    });

    snapContext.addDefaultSnap(location, {
      y: connectedMid.y - offset.y,
      context: context,
      type: 'distance'
    });
  }

};

Snapping.prototype.addTargetSnaps = function(snapPoints, shape, target) {

  var siblings = this.getSiblings(shape, target);

  forEach(siblings, function(s) {
    snapPoints.add('mid', mid(s));
  });

};

Snapping.prototype.getSiblings = function(element, target) {

  // snap to all non connection siblings
  return target && filter(target.children, function(e) {
    return !e.hidden && !e.labelTarget && !e.waypoints && e.host !== element && e !== element;
  });
};