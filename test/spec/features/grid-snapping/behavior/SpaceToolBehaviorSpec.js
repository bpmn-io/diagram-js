import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import gridSnappingModule from 'lib/features/grid-snapping';
import modelingModule from 'lib/features/modeling';
import moveModule from 'lib/features/move';
import spaceToolModule from 'lib/features/space-tool';

import {
  createCanvasEvent as canvasEvent
} from '../../../../util/MockEvents';

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


  it('should snap make space', inject(function(dragging, spaceTool) {

    // when
    spaceTool.activateMakeSpace(canvasEvent({ x: 0, y: 0 }));

    // initialize context
    dragging.move(canvasEvent({ x: 100, y: 0 }));

    dragging.move(canvasEvent({ x: 97, y: 0 }));

    dragging.end();

    // then
    expect(shape.x).to.eql(200);
  }));


  it('should snap x/y and dx/dy', inject(function(dragging, eventBus, spaceTool) {

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

});