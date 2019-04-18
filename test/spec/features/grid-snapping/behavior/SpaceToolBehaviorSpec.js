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


  it('should snap make space', inject(function(spaceTool, dragging) {

    // when
    spaceTool.activateMakeSpace(canvasEvent({ x: 90, y: 100 }));

    dragging.move(canvasEvent({ x: 110, y: 100 }));

    dragging.end();

    // then
    expect(shape.x).to.eql(120);
    expect(shape.y).to.eql(100);
  }));

});