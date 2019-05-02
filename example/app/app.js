import Diagram from '../..';

import SelectionModule from '../../lib/features/selection';
import ZoomScrollModule from '../../lib/navigation/zoomscroll';
import MoveCanvasModule from '../../lib/navigation/movecanvas';
import ModelingModule from '../../lib/features/modeling';
import MoveModule from '../../lib/features/move';
import OutlineModule from '../../lib/features/outline';
import LassoToolModule from '../../lib/features/lasso-tool';
import PaletteModule from '../../lib/features/palette';
import CreateModule from '../../lib/features/create';
import ContextPadModule from '../../lib/features/context-pad';
import ConnectModule from '../../lib/features/connect';
import RulesModule from '../../lib/features/rules';

import ExampleContextPadProvider from './ExampleContextPadProvider';
import ExamplePaletteProvider from './ExamplePaletteProvider';
import ExampleRuleProvider from './ExampleRuleProvider';

var ExampleModule = {
  __init__: [
    'exampleContextPadProvider',
    'examplePaletteProvider',
    'exampleRuleProvider'
  ],
  exampleContextPadProvider: [ 'type', ExampleContextPadProvider ],
  examplePaletteProvider: [ 'type', ExamplePaletteProvider ],
  exampleRuleProvider: [ 'type', ExampleRuleProvider ]
};

var container = document.querySelector('#container');

var diagram = new Diagram({
  canvas: {
    container: container
  },
  modules: [
    SelectionModule,
    ZoomScrollModule,
    MoveCanvasModule,
    ModelingModule,
    MoveModule,
    OutlineModule,
    LassoToolModule,
    PaletteModule,
    CreateModule,
    ContextPadModule,
    ConnectModule,
    RulesModule,
    ExampleModule
  ]
});

var canvas = diagram.get('canvas'),
    defaultRenderer = diagram.get('defaultRenderer'),
    elementFactory = diagram.get('elementFactory'),
    selection = diagram.get('selection');

// override default styles
defaultRenderer.CONNECTION_STYLE = { fill: 'none', strokeWidth: 5, stroke: '#000' };
defaultRenderer.SHAPE_STYLE = { fill: 'white', stroke: '#000', strokeWidth: 2 };

// add root
var root = elementFactory.createRoot();

canvas.setRootElement(root);

// add shapes
var shape1 = elementFactory.createShape({
  x: 150,
  y: 100,
  width: 100,
  height: 80
});

canvas.addShape(shape1, root);

var shape2 = elementFactory.createShape({
  x: 290,
  y: 220,
  width: 100,
  height: 80
});

canvas.addShape(shape2, root);


var connection1 = elementFactory.createConnection({
  waypoints: [
    { x: 250, y: 180 },
    { x: 290, y: 220 }
  ],
  source: shape1,
  target: shape2
});

canvas.addConnection(connection1, root);


var shape3 = elementFactory.createShape({
  x: 450,
  y: 80,
  width: 100,
  height: 80
});

canvas.addShape(shape3, root);

var shape4 = elementFactory.createShape({
  x: 500,
  y: 200,
  width: 300,
  height: 150,
  isFrame: true
});

canvas.addShape(shape4, root);


selection.select(shape3);