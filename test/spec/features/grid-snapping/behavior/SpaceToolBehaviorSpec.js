import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper.js';

import gridSnappingModule from 'diagram-js/lib/features/grid-snapping/index.js';
import modelingModule from 'diagram-js/lib/features/modeling/index.js';
import moveModule from 'diagram-js/lib/features/move/index.js';
import spaceToolModule from 'diagram-js/lib/features/space-tool/index.js';

import {
  createCanvasEvent as canvasEvent
} from '../../../../util/MockEvents.js';

var spy = sinon.spy;


describe('features/grid-snapping - space tool', function() {

  var shape;

  beforeEach(bootstrapDiagram({
    modules: [
      gridSnappingModule,
      modelingModule,
      moveModule,
      spaceToolModule
    ]
  }));

  beforeEach(inject(function(canvas, elementFactory) {

    shape = elementFactory.createShape({
      id: 'shape',
      x: 100, y: 100,
      width: 100, height: 100
    });

    canvas.addShape(shape);
  }));


  describe('should snap make space', function() {

    it('horizontal', inject(function(dragging, spaceTool) {

      // when
      spaceTool.activateMakeSpace(canvasEvent({ x: 0, y: 0 }));

      // initialize context
      dragging.move(canvasEvent({ x: 100, y: 0 }));

      dragging.move(canvasEvent({ x: 97, y: 0 }));

      dragging.end();

      // then
      expect(shape.x).to.eql(200);
    }));


    it('vertical', inject(function(dragging, spaceTool) {

      // when
      spaceTool.activateMakeSpace(canvasEvent({ x: 0, y: 0 }));

      // initialize context
      dragging.move(canvasEvent({ x: 0, y: 100 }));

      dragging.move(canvasEvent({ x: 0, y: 103 }));

      dragging.end();

      // then
      expect(shape.y).to.eql(200);
    }));

  });


  describe('should snap x/y and dx/dy', function() {

    it('horizontal', inject(function(dragging, eventBus, spaceTool) {

      // given
      var spaceToolMoveSpy = spy(function(event) {

        // then
        expect(event.x).to.equal(100); // 97 snapped to 100
      });

      // when
      spaceTool.activateMakeSpace(canvasEvent({ x: 0, y: 0 }));

      // initialize context
      dragging.move(canvasEvent({ x: 100, y: 0 }));

      eventBus.on('spaceTool.move', spaceToolMoveSpy);

      dragging.move(canvasEvent({ x: 97, y: 0 }));

      // then
      expect(spaceToolMoveSpy).to.have.been.called;
    }));


    it('vertical', inject(function(dragging, eventBus, spaceTool) {

      // given
      var spaceToolMoveSpy = spy(function(event) {

        // then
        expect(event.y).to.equal(100); // 103 snapped to 100
      });

      // when
      spaceTool.activateMakeSpace(canvasEvent({ x: 0, y: 0 }));

      // initialize context
      dragging.move(canvasEvent({ x: 0, y: 100 }));

      eventBus.on('spaceTool.move', spaceToolMoveSpy);

      dragging.move(canvasEvent({ x: 0, y: 103 }));

      // then
      expect(spaceToolMoveSpy).to.have.been.called;
    }));

  });

});