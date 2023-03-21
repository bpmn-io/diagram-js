import Diagram from '../Diagram';

import ElementFactory from './ElementFactory';
import ElementRegistry from './ElementRegistry';
import GraphicsFactory from './GraphicsFactory';

const diagram = new Diagram();

const elementFactory = diagram.get<ElementFactory>('elementFactory'),
      elementRegistry = diagram.get<ElementRegistry>('elementRegistry'),
      graphicsFactory = diagram.get<GraphicsFactory>('graphicsFactory');

const shapeLike = { id: 'shape' };

const shape = elementFactory.createShape(),
      shapeGfx1 = graphicsFactory.create('shape', shape),
      shapeGfx2 = graphicsFactory.create('shape', shape);

elementRegistry.add(shapeLike, shapeGfx1);

elementRegistry.add(shape, shapeGfx1);

elementRegistry.add(shape, shapeGfx1, shapeGfx2);

elementRegistry.remove('shape');

elementRegistry.remove(shapeLike);

elementRegistry.remove(shape);

elementRegistry.find((element, gfx) => {
  console.log(element, gfx);

  return true;
});

elementRegistry.filter((element, gfx) => {
  console.log(element, gfx);

  return true;
});


elementRegistry.filter((element, gfx) => {
  console.log(element, gfx);
});

elementRegistry.forEach((element, gfx) => console.log(element, gfx));

elementRegistry.get('shape');

elementRegistry.getAll();

elementRegistry.getGraphics('shape');

elementRegistry.getGraphics(shapeLike);

elementRegistry.getGraphics(shape);

elementRegistry.updateGraphics('shape', shapeGfx1);

elementRegistry.updateGraphics(shapeLike, shapeGfx1);

elementRegistry.updateGraphics(shape, shapeGfx1);

elementRegistry.updateGraphics(shape, shapeGfx2, true);

elementRegistry.updateId(shapeLike, 'foo');

elementRegistry.updateId(shape, 'foo');