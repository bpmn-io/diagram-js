import Diagram from 'diagram-js';

import SelectionModule from 'diagram-js/lib/features/selection'; // select elements
import ZoomScrollModule from 'diagram-js/lib/navigation/zoomscroll'; // zoom canvas
import MoveCanvasModule from 'diagram-js/lib/navigation/movecanvas'; // scroll canvas
import ModelingModule from 'diagram-js/lib/features/modeling'; // basic modeling (create/move/remove shapes/connections)
import MoveModule from 'diagram-js/lib/features/move'; // move shapes
import OutlineModule from 'diagram-js/lib/features/outline'; // show element outlines
import LassoToolModule from 'diagram-js/lib/features/lasso-tool'; // lasso tool for element selection
import PaletteModule from 'diagram-js/lib/features/palette'; // palette
import CreateModule from 'diagram-js/lib/features/create'; // create elements
import ContextPadModule from 'diagram-js/lib/features/context-pad'; // context pad for elements,
import ConnectModule from 'diagram-js/lib/features/connect'; // connect elements
import RulesModule from 'diagram-js/lib/features/rules'; // rules

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

// get instances from diagram
var canvas = diagram.get('canvas'),
    defaultRenderer = diagram.get('defaultRenderer'),
    elementFactory = diagram.get('elementFactory'),
    styles = diagram.get('styles'),
    selection = diagram.get('selection');

// override default stroke color
defaultRenderer.CONNECTION_STYLE = styles.style([ 'no-fill' ], { strokeWidth: 5, stroke: '#000' });
defaultRenderer.SHAPE_STYLE = styles.style({ fill: 'white', stroke: '#000', strokeWidth: 2 });

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
  ]
});

canvas.addConnection(connection1, root);


var shape3 = elementFactory.createShape({
  x: 450,
  y: 80,
  width: 100,
  height: 80
});

canvas.addShape(shape3, root);


selection.select(shape3);