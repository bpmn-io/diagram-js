'use strict';


var log10 = require('../../util/Math').log10;

/**
 * Get step size for given range and number of steps.
 * 
 * @param {Object} range - Range.
 * @param {number} range.min - Range minimum.
 * @param {number} range.max - Range maximum.
 */
module.exports.getStepSize = function(range, steps) {

  var minLinearRange = log10(range.min),
      maxLinearRange = log10(range.max);

  var absoluteLinearRange = Math.abs(minLinearRange) + Math.abs(maxLinearRange);

  return absoluteLinearRange / steps;
};

module.exports.cap = function(range, scale) {
  return Math.max(range.min, Math.min(range.max, scale));
};
