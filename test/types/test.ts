import {
  Base,
  Connection,
  Label,
  Root,
  Shape
} from "../../lib/model/index";

import Diagram from '../../lib/Diagram';

import CoreModule from '../../lib/core';
import ModelingModule from '../../lib/features/modeling';

import CommandHandler from "../../lib/command/CommandHandler";
import CommandInterceptor from "../../lib/command/CommandInterceptor";
import CommandStack from "../../lib/command/CommandStack";

import Canvas from "../../lib/core/Canvas";
import ElementFactory from "../../lib/core/ElementFactory";
import ElementRegistry from "../../lib/core/ElementRegistry";
import EventBus from "../../lib/core/EventBus";
import GraphicsFactory from "../../lib/core/GraphicsFactory";

import Modeling from "../../lib/features/modeling/Modeling";

import Overlays, { OverlayAttrs } from "../../lib/features/overlays/Overlays";

class CreateShapeHandler implements CommandHandler {
  private _canvas: Canvas;

  static $inject = [ 'canvas', 'rules' ];

  constructor(canvas: Canvas) {
    this._canvas = canvas;
  }

  execute(context: any): Base[] {
    const {
      parent,
      shape
    } = context;

    this._canvas.addShape(shape, parent);

    return [
      parent,
      shape
    ];
  }

  revert(context: any): Base[] {
    const {
      parent,
      shape
    } = context;

    this._canvas.removeShape(shape);

    return [
      parent,
      shape
    ];
  }

  canExecute(context: any): boolean {
    return true;
  }

  preExecute(context: any): void {}

  postExecute(context: any): void {}
}

class CreateShapeBehavior extends CommandInterceptor {
  static $inject = [ 'eventBus', 'modeling' ];

  constructor(eventBus: EventBus, modeling: Modeling) {
    super(eventBus);

    this.canExecute([ 'shape.create' ], (context) => {}, true);

    this.canExecute([ 'shape.create' ], 2000, (context) => {}, true);

    this.preExecute([ 'shape.create' ], (context) => {}, true);

    this.preExecute([ 'shape.create' ], 2000, (context) => {}, true);

    this.preExecuted([ 'shape.create' ], (context) => {}, true);

    this.preExecuted([ 'shape.create' ], 2000, (context) => {}, true);

    this.execute([ 'shape.create' ], (context) => {}, true);

    this.execute([ 'shape.create' ], (context) => [], true);

    this.execute([ 'shape.create' ], 2000, (context) => {}, true);

    this.executed([ 'shape.create' ], (context) => {}, true);

    this.executed([ 'shape.create' ], (context) => [], true);

    this.executed([ 'shape.create' ], 2000, (context) => {}, true);

    this.postExecute([ 'shape.create' ], (context) => {}, true);

    this.postExecute([ 'shape.create' ], 2000, (context) => {}, true);

    this.postExecuted([ 'shape.create' ], (context) => {
      const { shape } = context;

      modeling.moveShape(shape, { x: 100, y: 100 });
    }, true);

    this.postExecuted([ 'shape.create' ], 2000, (context) => {}, true);

    this.revert([ 'shape.create' ], (context) => {}, true);

    this.revert([ 'shape.create' ], (context) => [], true);

    this.revert([ 'shape.create' ], 2000, (context) => {}, true);

    this.reverted([ 'shape.create' ], (context) => {}, true);

    this.reverted([ 'shape.create' ], (context) => [], true);

    this.reverted([ 'shape.create' ], 2000, (context) => {}, true);
  }
}

const diagram = new Diagram({
  modules: [
    CoreModule,
    ModelingModule,
    {
      __init__: [ 'createShapeBehavior' ],
      createShapeBehavior: [ 'type', CreateShapeBehavior ]
    }
  ]
});

diagram.clear();

diagram.destroy();

diagram.invoke((eventBus: EventBus) => eventBus.fire('foo'));

const commandStack = diagram.get<CommandStack>('commandStack');

commandStack.registerHandler('shape.create', CreateShapeHandler);

commandStack.canExecute('shape.create', { foo: 'bar' });

commandStack.canUndo();

commandStack.canRedo();

commandStack.clear();

commandStack.execute('shape.create', { foo: 'bar' });

commandStack.redo();

commandStack.undo();

const elementFactory = diagram.get<ElementFactory>('elementFactory');

const connection = elementFactory.create<Connection>('connection', {
  id: 'connection',
  source: new Base({ id: 'shape1' }),
  target: new Base({ id: 'shape2' }),
  waypoints: []
});

const label = elementFactory.create<Label>('label', {
  id: 'label'
});

const root = elementFactory.create<Root>('root', {
  id: 'root'
});

const shape = elementFactory.create<Shape>('shape', {
  id: 'shape',
  x: 100,
  y: 100,
  width: 100,
  height: 100
});

elementFactory.create('connection');

elementFactory.create('label');

elementFactory.create('root');

elementFactory.create('shape');

elementFactory.createConnection();

elementFactory.createLabel();

elementFactory.createRoot();

elementFactory.createShape();

const graphicsFactory = diagram.get<GraphicsFactory>('graphicsFactory');

const shapeGfx = graphicsFactory.create('shape', shape);

graphicsFactory.drawShape(shapeGfx, shape);

graphicsFactory.getShapePath(shape);

graphicsFactory.remove(shape);

graphicsFactory.update('shape', shape, shapeGfx);

graphicsFactory.updateContainments([ shape ]);

const connectionGfx = graphicsFactory.create('connection', connection);

graphicsFactory.drawConnection(connectionGfx, connection);

graphicsFactory.getConnectionPath(connection);

const elementRegistry = diagram.get<ElementRegistry>('elementRegistry');

elementRegistry.add(connection, shapeGfx);

elementRegistry.add(connection, shapeGfx, graphicsFactory.create('shape', shape));

elementRegistry.remove('shape');

elementRegistry.remove(shape);

elementRegistry.find((element, gfx) => true);

elementRegistry.filter((element, gfx) => true);

elementRegistry.forEach((element, gfx) => console.log(element, gfx));

elementRegistry.get('shape');

elementRegistry.getAll();

elementRegistry.getGraphics('shape');

elementRegistry.getGraphics(shape);

elementRegistry.updateGraphics('shape', shapeGfx);

elementRegistry.updateGraphics(shape, shapeGfx);

elementRegistry.updateGraphics(shape, shapeGfx, true);

elementRegistry.updateId(shape, 'foo');

const canvas = diagram.get<Canvas>('canvas');

canvas.addShape(shape, root);

canvas.addShape(shape, root, 1);

canvas.addMarker(shape, 'foobar');

canvas.addRootElement();

canvas.addRootElement(root);

canvas.findRoot(shape);

canvas.getAbsoluteBBox(shape);

canvas.getActiveLayer();

canvas.getDefaultLayer();

canvas.getGraphics(shape);

canvas.getGraphics(shape, true);

canvas.getLayer('foo');

canvas.getLayer('foo', 1);

canvas.getRootElement();

canvas.getRootElements();

canvas.getSize();

canvas.hasMarker(shape, 'foo');

canvas.hideLayer('foo');

canvas.removeMarker(shape, 'foo');

canvas.removeRootElement('root');

canvas.removeRootElement(root);

canvas.removeShape(shape);

canvas.resized();

canvas.scroll({ x: 100, y: 100 });

canvas.scrollToElement('shape');

canvas.scrollToElement(shape);

canvas.scrollToElement(shape, 100);

canvas.setRootElement(root);

canvas.showLayer('foo');

canvas.toggleMarker(shape, 'foo');

canvas.viewbox();

canvas.viewbox({ x: 100, y: 100, width: 100, height: 100 });

canvas.zoom();

canvas.zoom(1);

canvas.zoom(1, true);

const eventBus = diagram.get<EventBus>('eventBus');

const event = eventBus.createEvent({ foo: 'bar' });

eventBus.fire(event);

eventBus.fire({ foo: 'bar'});

eventBus.handleError(new Error());

const callback = () => {};

eventBus.off('foo', callback);

eventBus.off([ 'foo', 'bar' ], callback);

eventBus.on('foo', callback);

eventBus.on([ 'foo', 'bar' ], callback);

eventBus.on('foo', 2000, callback);

eventBus.on('foo', callback, this);

eventBus.once('foo', callback);

eventBus.once([ 'foo', 'bar' ], callback);

eventBus.once('foo', 2000, callback);

eventBus.once('foo', callback, this);

const foo = diagram.invoke((modeling: Modeling, eventBus: EventBus) => {

  return {
    bar: 1
  };
});

foo.bar = 10;

const modeling = diagram.get<Modeling>('modeling');

modeling.alignElements([ shape, connection ], {
  top: 100,
  right: 100,
  left: 100,
  bottom: 100,
  center: 100,
  middle: 100
});

modeling.appendShape(
  shape, elementFactory.createShape(), { x: 100, y: 100 }, root);

modeling.connect(shape, elementFactory.createShape());

modeling.createConnection(shape, elementFactory.createShape(), { id: 'foo' }, root);

modeling.createConnection(shape, elementFactory.createShape(), connection, root);

modeling.createConnection(
  shape, elementFactory.createShape(), connection, root, { foo: 'bar' });

modeling.createElements([
  shape,
  elementFactory.createShape()
], { x: 100, y: 100 }, root);

modeling.createElements([
  shape,
  elementFactory.createShape()
], { x: 100, y: 100 }, root, 1);

modeling.createElements([
  shape,
  elementFactory.createShape()
], { x: 100, y: 100 }, root, 1, { foo: 'bar' });

modeling.createLabel(shape, { x: 100, y: 100 }, label);

modeling.createLabel(shape, { x: 100, y: 100 }, label, root);

modeling.createShape({ id: 'foo' }, { x: 100, y: 100 }, root);

modeling.createShape(shape, { x: 100, y: 100 }, root);

modeling.createShape(shape, { x: 100, y: 100 }, root, { foo: 'bar' });

modeling.createSpace([ shape ], [], { x: 100, y: 100 }, 'e', 100);

modeling.distributeElements([
  {
    elements: [ shape ],
    range: {
      min: 100,
      max: 200
    }
  }
]);

modeling.getHandlers();

modeling.layoutConnection(connection);

modeling.layoutConnection(connection, { foo: 'bar' });

modeling.moveConnection(connection, { x: 100, y: 100 });

modeling.moveConnection(connection, { x: 100, y: 100 }, root);

modeling.moveConnection(connection, { x: 100, y: 100 }, root, { foo: 'bar' });

modeling.moveElements([ shape ], { x: 100, y: 100 });

modeling.moveElements([ shape ], { x: 100, y: 100 }, root);

modeling.moveElements([ shape ], { x: 100, y: 100 }, root, { foo: 'bar' });

modeling.moveShape(shape, { x: 100, y: 100 });

modeling.moveShape(shape, { x: 100, y: 100 }, root);

modeling.moveShape(shape, { x: 100, y: 100 }, root, { foo: 'bar' });

modeling.reconnect(
  connection, shape, elementFactory.createShape(), { x: 100, y: 100 });

modeling.reconnect(
  connection, shape, elementFactory.createShape(), { x: 100, y: 100 }, { foo: 'bar' });

modeling.reconnect(connection, shape, elementFactory.createShape(), [
  { x: 100, y: 100 },
  { x: 200, y: 100 }
]);

modeling.reconnectEnd(connection, shape, { x: 100, y: 100 });

modeling.reconnectEnd(connection, shape, { x: 100, y: 100 }, { foo: 'bar' });

modeling.reconnectEnd(connection, shape, [
  { x: 100, y: 100 },
  { x: 200, y: 100 }
]);

modeling.reconnectEnd(connection, shape, [
  { x: 100, y: 100 },
  { x: 200, y: 100 }
], { foo: 'bar' });

modeling.reconnectStart(connection, shape, { x: 100, y: 100 });

modeling.reconnectStart(connection, shape, { x: 100, y: 100 }, { foo: 'bar' });

modeling.reconnectStart(connection, shape, [
  { x: 100, y: 100 },
  { x: 200, y: 100 }
]);

modeling.reconnectStart(connection, shape, [
  { x: 100, y: 100 },
  { x: 200, y: 100 }
], { foo: 'bar' });

modeling.registerHandlers(commandStack);

modeling.removeConnection(connection);

modeling.removeConnection(connection, { foo: 'bar' });

modeling.removeElements([ shape ]);

modeling.removeShape(shape);

modeling.removeShape(shape, { foo: 'bar' });

modeling.replaceShape(shape, { id: 'foo' });

modeling.replaceShape(shape, elementFactory.createShape());

modeling.replaceShape(shape, elementFactory.createShape(), { foo: 'bar' });

modeling.toggleCollapse(shape);

modeling.toggleCollapse(shape, { foo: 'bar' });

modeling.updateAttachment(shape, elementFactory.createShape());

modeling.updateWaypoints(connection, [
  { x: 100, y: 100 },
  { x: 200, y: 100 }
]);

modeling.updateWaypoints(connection, [
  { x: 100, y: 100 },
  { x: 200, y: 100 }
], { foo: 'bar' });

const overlays = diagram.get<Overlays>('overlays');

const overlay: OverlayAttrs = {
  html: '<h1>Foo</h1>',
  position: {
    top: 0,
    right: 0
  },
  show: {
    minZoom: 1
  },
  scale: true
};

overlays.add('shape', overlay);

overlays.add('shape', 'foo', overlay);

overlays.get({ id: 'shape' });

overlays.get({ element: shape });

overlays.get({ type: 'foo' });

overlays.get('foo');

overlays.remove({ id: 'shape' });

overlays.remove({ element: shape });

overlays.remove({ type: 'foo' });

overlays.remove('foo');

overlays.hide();

overlays.show();

overlays.isShown();