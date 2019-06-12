export var SPACING = 10;

export function quantize(value, quantum, fn) {
  if (!fn) {
    fn = 'round';
  }

  return Math[ fn ](value / quantum) * quantum;
}