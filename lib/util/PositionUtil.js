export function center(bounds) {
  return {
    x: bounds.x + (bounds.width / 2),
    y: bounds.y + (bounds.height / 2)
  };
}


export function delta(a, b) {
  return {
    x: a.x - b.x,
    y: a.y - b.y
  };
}