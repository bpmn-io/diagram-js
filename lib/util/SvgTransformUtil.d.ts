/**
 * @param gfx
 * @param x
 * @param y
 * @param angle
 * @param amount
 */
export function transform(gfx: SVGElement, x: number, y: number, angle?: number, amount?: number): void;
/**
 * @param gfx
 * @param x
 * @param y
 */
export function translate(gfx: SVGElement, x: number, y: number): void;
/**
 * @param gfx
 * @param angle
 */
export function rotate(gfx: SVGElement, angle: number): void;
/**
 * @param gfx
 * @param amount
 */
export function scale(gfx: SVGElement, amount: number): void;
