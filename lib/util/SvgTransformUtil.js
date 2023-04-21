import {
  transform as svgTransform,
  createTransform
} from 'tiny-svg';


/**
 * @param {SVGElement} gfx
 * @param {number} x
 * @param {number} y
 * @param {number} [angle]
 * @param {number} [amount]
 */
export function transform(gfx, x, y, angle, amount) {
  var translate = createTransform();
  translate.setTranslate(x, y);

  var rotate = createTransform();
  rotate.setRotate(angle || 0, 0, 0);

  var scale = createTransform();
  scale.setScale(amount || 1, amount || 1);

  svgTransform(gfx, [ translate, rotate, scale ]);
}


/**
 * @param {SVGElement} gfx
 * @param {number} x
 * @param {number} y
 */
export function translate(gfx, x, y) {
  var translate = createTransform();
  translate.setTranslate(x, y);

  svgTransform(gfx, translate);
}


/**
 * @param {SVGElement} gfx
 * @param {number} angle
 */
export function rotate(gfx, angle) {
  var rotate = createTransform();
  rotate.setRotate(angle, 0, 0);

  svgTransform(gfx, rotate);
}


/**
 * @param {SVGElement} gfx
 * @param {number} amount
 */
export function scale(gfx, amount) {
  var scale = createTransform();
  scale.setScale(amount, amount);

  svgTransform(gfx, scale);
}
