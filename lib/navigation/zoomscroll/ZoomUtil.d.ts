/**
 * Get step size for given range and number of steps.
 *
 * @param range
 * @param steps
 */
export function getStepSize(range: {
    min: number;
    max: number;
}, steps: number): number;
/**
 * @param range
 * @param scale
 */
export function cap(range: {
    min: number;
    max: number;
}, scale: number): number;
