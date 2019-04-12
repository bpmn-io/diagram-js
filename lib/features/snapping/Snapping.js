import {
  filter,
  forEach,
  debounce,
  bind
} from 'min-dash';

import SnapContext from './SnapContext';

import {
  mid,
  isSnapped,
  setSnapped
} from './SnapUtil';

var HIGHER_PRIORITY = 1250;

import {
  append as svgAppend,
  attr as svgAttr,
  classes as svgClasses,
  create as svgCreate
} from 'tiny-svg';

var SNAP_TOLERANCE = 7;


/**
 * A general purpose snapping component for diagram elements.
 *
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 */
export default function Snapping(eventBus, canvas) {

  this._canvas = canvas;

  var self = this;

  eventBus.on([ 'shape.move.start', 'create.start' ], function(event) {
    self.initSnap(event);
  });

  eventBus.on([ 'shape.move.move', 'shape.move.end', 'create.move', 'create.end' ], HIGHER_PRIORITY, function(event) {

    if (event.originalEvent && event.originalEvent.ctrlKey) {
      return;
    }

    if (isSnapped(event)) {
      return;
    }

    self.snap(event);
  });

  eventBus.on([ 'shape.move.cleanup', 'create.cleanup' ], function(event) {
    self.hide();
  });

  // delay hide by 1000 seconds since last match
  this._asyncHide = debounce(bind(this.hide, this), 1000);
}

Snapping.$inject = [ 'eventBus', 'canvas' ];


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
      target = context.target,
      snapLocations = snapContext.getSnapLocations();

  if (!target) {
    return;
  }

  var snapPoints = snapContext.pointsForTarget(target);

  if (!snapPoints.initialized) {
    this.addTargetSnaps(snapPoints, shape, target);

    snapPoints.initialized = true;
  }


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

    // snap on both axis, if not snapped already
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

    // no more need to snap, drop out of interation
    if (snapping.x && snapping.y) {
      return false;
    }
  });


  // show snap visuals

  this.showSnapLine('vertical', snapping.x && snapping.x.value);
  this.showSnapLine('horizontal', snapping.y && snapping.y.value);


  // adjust event { x, y, dx, dy } and mark as snapping
  forEach([ 'x', 'y' ], function(axis) {

    var axisSnapping = snapping[axis];

    if (typeof axisSnapping === 'object') {
      // set as snapped and adjust the x and/or y position of the event
      setSnapped(event, axis, axisSnapping.originValue);
    }
  });
};


Snapping.prototype._createLine = function(orientation) {

  var root = this._canvas.getLayer('snap');

  // var line = root.path('M0,0 L0,0').addClass('djs-snap-line');

  var line = svgCreate('path');
  svgAttr(line, { d: 'M0,0 L0,0' });
  svgClasses(line).add('djs-snap-line');

  svgAppend(root, line);

  return {
    update: function(position) {

      if (typeof position !== 'number') {
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
  forEach(this._snapLines, function(l) {
    l.update();
  });
};

Snapping.prototype.addTargetSnaps = function(snapPoints, shape, target) {

  var siblings = this.getSiblings(shape, target);

  forEach(siblings, function(s) {
    snapPoints.add('mid', mid(s));
  });

};

Snapping.prototype.getSiblings = function(element, target) {

  // snap to all siblings that are not hidden, labels, attached to element or element itself
  return target && filter(target.children, function(e) {
    return !e.hidden && !e.labelTarget && e.host !== element && e !== element;
  });
};
