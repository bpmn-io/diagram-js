var abs = Math.abs,
    round = Math.round;


/**
 * Snap value to a collection of reference values.
 *
 * @param  {Number} value
 * @param  {Array<Number>} values
 * @param  {Number} [tolerance=10]
 *
 * @return {Number} the value we snapped to or null, if none snapped
 */
export function snapTo(value, values, tolerance) {
  tolerance = tolerance === undefined ? 10 : tolerance;

  var idx, snapValue;

  for (idx = 0; idx < values.length; idx++) {
    snapValue = values[idx];

    if (abs(snapValue - value) <= tolerance) {
      return snapValue;
    }
  }
}


export function topLeft(bounds) {
  return {
    x: bounds.x,
    y: bounds.y
  };
}

export function topRight(bounds) {
  return {
    x: bounds.x + bounds.width,
    y: bounds.y
  };
}

export function bottomLeft(bounds) {
  return {
    x: bounds.x,
    y: bounds.y + bounds.height
  };
}

export function bottomRight(bounds) {
  return {
    x: bounds.x + bounds.width,
    y: bounds.y + bounds.height
  };
}

export function mid(bounds, defaultValue) {

  if (!bounds || isNaN(bounds.x) || isNaN(bounds.y)) {
    return defaultValue;
  }

  return {
    x: round(bounds.x + bounds.width / 2),
    y: round(bounds.y + bounds.height / 2)
  };
}


/**
 * Retrieve the snap state of the given event.
 *
 * @param  {Event} event
 * @param  {String} axis
 *
 * @return {Boolean} the snapped state
 *
 */
export function isSnapped(event, axis) {
  var snapped = event.snapped;

  if (!snapped) {
    return false;
  }

  if (typeof axis === 'string') {
    return snapped[axis];
  }

  return snapped.x && snapped.y;
}


/**
 * Set the given event as snapped.
 *
 * This method may change the x and/or y position of the shape
 * from the given event!
 *
 * @param {Event} event
 * @param {String} axis
 * @param {Number|Boolean} value
 *
 * @return {Number} old value
 */
export function setSnapped(event, axis, value) {
  if (typeof axis !== 'string') {
    throw new Error('axis must be in [x, y]');
  }

  if (typeof value !== 'number' && value !== false) {
    throw new Error('value must be Number or false');
  }

  var delta,
      previousValue = event[axis];

  var snapped = event.snapped = (event.snapped || {});


  if (value === false) {
    snapped[axis] = false;
  } else {
    snapped[axis] = true;

    delta = value - previousValue;

    event[axis] += delta;
    event['d' + axis] += delta;
  }

  return previousValue;
}

/**
 * Get children of a shape.
 *
 * @param {djs.model.Shape} parent
 *
 * @returns {Array<djs.model.Shape|djs.model.Connection>}
 */
export function getChildren(parent) {
  return parent.children || [];
}