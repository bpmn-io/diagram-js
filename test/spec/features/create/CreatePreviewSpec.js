import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import {
  createCanvasEvent as canvasEvent
} from '../../../util/MockEvents';

import modelingModule from 'lib/features/modeling';
import moveModule from 'lib/features/move';
import dragModule from 'lib/features/dragging';
import createModule from 'lib/features/create';
import attachSupportModule from 'lib/features/attach-support';
import rulesModule from './rules';

import { queryAll as domQueryAll } from 'min-dom';

var testModules = [
  createModule,
  rulesModule,
  attachSupportModule,
  modelingModule,
  moveModule,
  dragModule
];


describe('features/create - CreatePreviewSpec', function() {

  var rootShape,
      newElements;

  function setManualDragging(dragging) {
    dragging.setOptions({ manual: true });
  }

  function setupDiagram(elementFactory, canvas) {
    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    newElements = [];

    var newShape = elementFactory.createShape({
      id: 'newShape',
      x: 0,
      y: 0,
      width: 50,
      height: 50
    });

    newElements.push(newShape);

    var newShape2 = elementFactory.createShape({
      id: 'newShape2',
      x: 100,
      y: -25,
      width: 100,
      height: 100
    });

    newElements.push(newShape2);

    newElements.push(elementFactory.createShape({
      id: 'newShape3',
      parent: newShape2,
      x: 125,
      y: 0,
      width: 50,
      height: 50
    }));

    newElements.push(elementFactory.createConnection({
      id: 'newConnection',
      source: newShape,
      target: newShape2,
      waypoints: [
        { x: 50, y: 25 },
        { x: 100, y: 25 }
      ]
    }));
  }


  beforeEach(bootstrapDiagram({
    modules: testModules
  }));

  beforeEach(inject(setManualDragging));

  beforeEach(inject(setupDiagram));


  describe('basics', function() {

    it('should add preview', inject(function(create, dragging) {

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), newElements);

      dragging.move(canvasEvent({ x: 100, y: 100 }));

      // then
      var context = dragging.context(),
          dragGroup = context.data.context.dragGroup;

      expect(dragGroup).to.be.exist;
      expect(domQueryAll('.djs-visual', dragGroup)).to.have.length(4);
    }));


    it('should remove preview', inject(function(create, dragging, elementRegistry) {

      // given
      var rootGfx = elementRegistry.getGraphics(rootShape);

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), newElements);

      dragging.hover({ element: rootShape, gfx: rootGfx });

      dragging.move(canvasEvent({ x: 100, y: 100 }));

      var context = dragging.context(),
          dragGroup = context.data.context.dragGroup;

      dragging.end();

      // then
      expect(dragGroup.parentNode).not.to.exist;
    }));

  });

});