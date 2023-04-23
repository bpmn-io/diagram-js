/**
 * @typedef {import('../util/Types').Point} Point
 * @typedef {import('../util/Types').Rect} Rect
 */

/**
 * @param {Rect} bounds
 * @return {Point}
 */
export function center(bounds) {
  return {
    x: bounds.x + (bounds.width / 2),
    y: bounds.y + (bounds.height / 2)
  };
}


/**
 * @param {Point} a
 * @param {Point} b
 * @return {Point}
 */
export function delta(a, b) {
  return {
    x: a.x - b.x,
    y: a.y - b.y
  };
}
