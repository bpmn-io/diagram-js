import {
  toSVGPoints,
  componentsToPath
} from './RenderUtil';

toSVGPoints([
  { x: 10, y: 100 },
  { x: 100, y: 100 }
]);

componentsToPath([
  [ 'M', 0, 0 ],
  [ 'L', 10, 10 ],
  [ 'H', 50 ]
]);