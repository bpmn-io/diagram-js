import { expect } from 'chai';

import {
  bootstrapDiagram,
  getDiagramJS,
  inject
} from 'test/TestHelper';

import gridSnappingModule from 'lib/features/grid-snapping';
import modelingModule from 'lib/features/modeling';
import resizeModule from 'lib/features/resize';
import resizeRulesModule from '../../resize/rules/index.js';

import { getReferencePoint } from 'lib/features/resize/Resize';

import { getBBox } from 'lib/util/Elements';

import {
  createCanvasEvent as canvasEvent
} from '../../../../util/MockEvents.js';


describe('features/grid-snapping - resize elements', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      gridSnappingModule,
      modelingModule,
      resizeModule,
      resizeRulesModule
    ]
  }));


  var shape1, shape2, shape3;

  beforeEach(inject(function(canvas, elementFactory) {
    var rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    shape1 = canvas.addShape({
      id: 'shape1',
      resizable: 'always',
      x: 100, y: 100, width: 100, height: 100
    });

    shape2 = canvas.addShape({
      id: 'shape2',
      resizable: 'always',
      x: 200, y: 100, width: 100, height: 100
    });

    shape3 = canvas.addShape({
      id: 'shape3',
      resizable: 'always',
      x: 300, y: 100, width: 100, height: 100
    });
  }));


  function resizeElements(elements, direction, delta, data) {
    getDiagramJS().invoke(function(dragging, resizeElements) {
      var point = getReferencePoint(getBBox(elements), direction);

      resizeElements.activate(canvasEvent(point, data), elements, direction);

      dragging.move(canvasEvent({
        x: point.x + delta.x,
        y: point.y + delta.y
      }, data));

      dragging.end();
    });
  }


  it('should snap moved edges', function() {

    // when
    resizeElements([ shape1, shape2, shape3 ], 'e', { x: 70, y: 0 });

    // then
    expect(shape1).to.have.bounds({ x: 100, y: 100, width: 120, height: 100 });
    expect(shape2).to.have.bounds({ x: 220, y: 100, width: 130, height: 100 });
    expect(shape3).to.have.bounds({ x: 350, y: 100, width: 120, height: 100 });
  });


  it('should NOT snap unchanged edges', inject(function(canvas) {

    // given
    var offGridShape = canvas.addShape({
      id: 'offGridShape',
      resizable: 'always',
      x: 300, y: 303, width: 100, height: 97
    });

    // when
    resizeElements([ shape1, offGridShape ], 'e', { x: 70, y: 0 });

    // then
    expect(offGridShape).to.have.bounds({ x: 350, y: 303, width: 120, height: 97 });
  }));


  it('should move shapes that cannot be resized by grid spacing', inject(function(canvas) {

    // given
    var fixedShape = canvas.addShape({
      id: 'fixed',
      x: 100, y: 300, width: 50, height: 50
    });

    // when
    resizeElements([ shape1, fixedShape ], 'e', { x: 73, y: 0 });

    // then
    expect(shape1).to.have.bounds({ x: 100, y: 100, width: 170, height: 100 });
    expect(fixedShape).to.have.bounds({ x: 120, y: 300, width: 50, height: 50 });
  }));


  it('should keep minimum dimensions', function() {

    // when
    resizeElements([ shape1, shape2, shape3 ], 'e', { x: -295, y: 0 });

    // then
    expect(shape1.width).to.eql(10);
    expect(shape2.width).to.eql(10);
    expect(shape3.width).to.eql(10);
  });


  it('should NOT snap (cmd)', function() {

    // when
    resizeElements([ shape1, shape2, shape3 ], 'e', { x: 70, y: 0 }, { ctrlKey: true });

    // then
    expect(shape1).to.have.bounds({ x: 100, y: 100, width: 123, height: 100 });
    expect(shape2).to.have.bounds({ x: 223, y: 100, width: 124, height: 100 });
    expect(shape3).to.have.bounds({ x: 347, y: 100, width: 123, height: 100 });
  });


  it('should NOT snap (inactive)', inject(function(gridSnapping) {

    // given
    gridSnapping.setActive(false);

    // when
    resizeElements([ shape1, shape2, shape3 ], 'e', { x: 70, y: 0 });

    // then
    expect(shape1).to.have.bounds({ x: 100, y: 100, width: 123, height: 100 });
  }));

});
