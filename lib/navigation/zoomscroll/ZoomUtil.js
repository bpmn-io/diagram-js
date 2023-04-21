import {
  log10
} from '../../util/Math';

/**
 * Get step size for given range and number of steps.
 *
 * @param {Object} range
 * @param {number} range.min
 * @param {number} range.max
 * @param {number} steps
 */
export function getStepSize(range, steps) {

  var minLinearRange = log10(range.min),
      maxLinearRange = log10(range.max);

  var absoluteLinearRange = Math.abs(minLinearRange) + Math.abs(maxLinearRange);

  return absoluteLinearRange / steps;
}

/**
 * @param {Object} range
 * @param {number} range.min
 * @param {number} range.max
 * @param {number} scale
 */
export function cap(range, scale) {
  return Math.max(range.min, Math.min(range.max, scale));
}
