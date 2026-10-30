import { expect } from 'chai';

import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import {
  createCanvasEvent as canvasEvent
} from '../../../util/MockEvents.js';

import { filter } from 'min-dash';

import resizeModule from 'lib/features/resize';
import modelingModule from 'lib/features/modeling';
import rulesModule from './rules/index.js';
import selectModule from 'lib/features/selection';

import { getReferencePoint } from 'lib/features/resize/Resize';

import { getBBox } from 'lib/util/Elements';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import { transform as svgTransform } from 'tiny-svg';


describe('features/resize - ResizeElements', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      resizeModule,
      rulesModule,
      modelingModule,
      selectModule
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


  describe('handles', function() {

    function getResizeHandles() {
      return inject(function(resizeHandles) {
        return domQueryAll('.djs-resizer', resizeHandles._getResizersParent());
      })();
    }


    it('should add on multi selection', inject(function(selection) {

      // when
      selection.select([ shape1, shape2 ]);

      // then
      var resizeHandles = getResizeHandles();

      expect(resizeHandles).to.have.length(8);
      expect(domQuery('.djs-resizer-shape1')).not.to.exist;
      expect(domQuery('.djs-resizer-shape2')).not.to.exist;
    }));


    it('should remove on deselect', inject(function(selection) {

      // given
      selection.select([ shape1, shape2 ]);

      // when
      selection.select(null);

      // then
      expect(getResizeHandles()).to.have.length(0);
    }));


    it('should NOT add if no element can be resized', inject(
      function(canvas, selection) {

        // given
        var fixedShape1 = canvas.addShape({
          id: 'fixed1',
          x: 100, y: 300, width: 100, height: 100
        });

        var fixedShape2 = canvas.addShape({
          id: 'fixed2',
          x: 300, y: 300, width: 100, height: 100
        });

        // when
        selection.select([ fixedShape1, fixedShape2 ]);

        // then
        expect(getResizeHandles()).to.have.length(0);
      }
    ));


    it('should add for directions allowed for any element', inject(
      function(canvas, selection, resizeHandles) {

        // given
        var restrictedShape1 = canvas.addShape({
          id: 'restricted1',
          resizable: true,
          resizableDirections: [ 'n' ],
          x: 100, y: 300, width: 100, height: 100
        });

        var restrictedShape2 = canvas.addShape({
          id: 'restricted2',
          resizable: true,
          resizableDirections: [ 'se' ],
          x: 300, y: 300, width: 100, height: 100
        });

        // when
        selection.select([ restrictedShape1, restrictedShape2 ]);

        // then
        var parent = resizeHandles._getResizersParent();

        expect(domQueryAll('.djs-resizer', parent)).to.have.length(2);
        expect(domQuery('.djs-resizer-n', parent)).to.exist;
        expect(domQuery('.djs-resizer-se', parent)).to.exist;
      }
    ));


    it('should add on selection bounds', inject(
      function(canvas, selection, resizeHandles) {

        // given
        var fixedShape = canvas.addShape({
          id: 'fixed',
          x: 600, y: 300, width: 50, height: 50
        });

        // when
        selection.select([ shape1, fixedShape ]);

        // then
        var resizer = domQuery('.djs-resizer-e', resizeHandles._getResizersParent());

        var matrix = svgTransform(resizer).matrix;

        expect({ x: matrix.e, y: matrix.f }).to.eql({ x: 650, y: 225 });
      }
    ));


    it('should NOT add if rules forbid', inject(function(eventBus, selection) {

      // given
      eventBus.on('commandStack.elements.resize.canExecute', function() {
        return false;
      });

      // when
      selection.select([ shape1, shape2 ]);

      // then
      expect(getResizeHandles()).to.have.length(0);
    }));


    it('should keep multi selection handles on shape change', inject(
      function(eventBus, selection) {

        // given
        selection.select([ shape1, shape2 ]);

        // when
        eventBus.fire('element.changed', { element: shape1 });

        // then
        expect(getResizeHandles()).to.have.length(8);
        expect(domQuery('.djs-resizer-shape1')).not.to.exist;
      }
    ));

  });


  describe('modeling', function() {

    function resizeElements(elements, direction, delta) {
      return inject(function(dragging, resizeElements) {
        var point = getReferencePoint(getBBox(elements), direction);

        resizeElements.activate(canvasEvent(point), elements, direction);

        dragging.move(canvasEvent({
          x: point.x + delta.x,
          y: point.y + delta.y
        }));

        dragging.end();
      })();
    }


    it('should scale e', function() {

      // when
      resizeElements([ shape1, shape2, shape3 ], 'e', { x: 300, y: 0 });

      // then
      expect(shape1).to.have.bounds({ x: 100, y: 100, width: 200, height: 100 });
      expect(shape2).to.have.bounds({ x: 300, y: 100, width: 200, height: 100 });
      expect(shape3).to.have.bounds({ x: 500, y: 100, width: 200, height: 100 });
    });


    it('should scale w', function() {

      // when
      resizeElements([ shape1, shape2, shape3 ], 'w', { x: -300, y: 0 });

      // then
      expect(shape1).to.have.bounds({ x: -200, y: 100, width: 200, height: 100 });
      expect(shape2).to.have.bounds({ x: 0, y: 100, width: 200, height: 100 });
      expect(shape3).to.have.bounds({ x: 200, y: 100, width: 200, height: 100 });
    });


    it('should scale s', function() {

      // when
      resizeElements([ shape1, shape2, shape3 ], 's', { x: 0, y: 100 });

      // then
      expect(shape1).to.have.bounds({ x: 100, y: 100, width: 100, height: 200 });
      expect(shape2).to.have.bounds({ x: 200, y: 100, width: 100, height: 200 });
      expect(shape3).to.have.bounds({ x: 300, y: 100, width: 100, height: 200 });
    });


    it('should scale nw', function() {

      // when
      resizeElements([ shape1, shape3 ], 'nw', { x: -300, y: -100 });

      // then
      expect(shape1).to.have.bounds({ x: -200, y: 0, width: 200, height: 200 });
      expect(shape3).to.have.bounds({ x: 200, y: 0, width: 200, height: 200 });
    });


    it('should keep adjacent shapes adjacent', function() {

      // when
      resizeElements([ shape1, shape2, shape3 ], 'e', { x: 100, y: 0 });

      // then
      expect(shape1.x + shape1.width).to.eql(shape2.x);
      expect(shape2.x + shape2.width).to.eql(shape3.x);
      expect(shape3.x + shape3.width).to.eql(500);
    });


    it('should NOT move shape that cannot be resized', inject(function(canvas) {

      // given
      var fixedShape = canvas.addShape({
        id: 'fixed',
        x: 100, y: 300, width: 50, height: 50
      });

      // when
      resizeElements([ shape1, fixedShape ], 'e', { x: 100, y: 0 });

      // then
      expect(shape1).to.have.bounds({ x: 100, y: 100, width: 200, height: 100 });
      expect(fixedShape).to.have.bounds({ x: 100, y: 300, width: 50, height: 50 });
    }));


    it('should push shape that cannot be resized in direction', inject(function(canvas) {

      // given
      var restrictedShape = canvas.addShape({
        id: 'restricted',
        resizable: true,
        resizableDirections: [ 'n' ],
        x: 300, y: 300, width: 100, height: 100
      });

      // when
      resizeElements([ shape1, restrictedShape ], 'e', { x: 300, y: 0 });

      // then
      expect(shape1).to.have.bounds({ x: 100, y: 100, width: 400, height: 100 });
      expect(restrictedShape).to.have.bounds({ x: 600, y: 300, width: 100, height: 100 });
    }));


    it('should push shape that cannot be resized <w>', inject(function(canvas) {

      // given
      var fixedShape = canvas.addShape({
        id: 'fixed',
        x: 100, y: 300, width: 50, height: 50
      });

      // when
      resizeElements([ shape3, fixedShape ], 'w', { x: -100, y: 0 });

      // then
      expect(shape3).to.have.bounds({ x: 200, y: 100, width: 200, height: 100 });
      expect(fixedShape).to.have.bounds({ x: 0, y: 300, width: 50, height: 50 });
    }));


    it('should push shape by nearest dragged edge', inject(function(canvas) {

      // given
      var fixedShape = canvas.addShape({
        id: 'fixed',
        x: 220, y: 300, width: 50, height: 50
      });

      // when
      resizeElements([ shape1, shape3, fixedShape ], 'e', { x: 300, y: 0 });

      // then
      expect(fixedShape).to.have.bounds({ x: 320, y: 300, width: 50, height: 50 });
    }));


    it('should NOT push shape inside resized shape', inject(function(canvas) {

      // given
      var fixedShape = canvas.addShape({
        id: 'fixed',
        x: 260, y: 120, width: 20, height: 20
      });

      // when
      resizeElements([ shape1, shape2, fixedShape ], 'e', { x: 200, y: 0 });

      // then
      expect(fixedShape).to.have.bounds({ x: 260, y: 120, width: 20, height: 20 });
    }));


    it('should keep minimum dimensions', function() {

      // when
      resizeElements([ shape1, shape2, shape3 ], 'e', { x: -400, y: 0 });

      // then
      expect(shape1.width).to.eql(10);
      expect(shape2.width).to.eql(10);
      expect(shape3.width).to.eql(10);
    });


    it('should keep custom minimum dimensions', inject(function(eventBus) {

      // given
      eventBus.on('elements.resize.start', 1500, function(event) {
        event.context.minDimensions[ shape2.id ] = { width: 50, height: 50 };
      });

      // when
      resizeElements([ shape1, shape2, shape3 ], 'e', { x: -240, y: 0 });

      // then
      expect(shape1).to.have.bounds({ x: 100, y: 100, width: 20, height: 100 });
      expect(shape2).to.have.bounds({ x: 120, y: 100, width: 50, height: 100 });
      expect(shape3).to.have.bounds({ x: 140, y: 100, width: 20, height: 100 });
    }));


    it('should NOT move children', inject(function(canvas, elementFactory) {

      // given
      var parent = canvas.addShape(elementFactory.createShape({
        id: 'parent',
        resizable: 'always',
        x: 100, y: 300, width: 300, height: 200
      }));

      var child = canvas.addShape(elementFactory.createShape({
        id: 'child',
        x: 300, y: 350, width: 50, height: 50
      }), parent);

      // when
      resizeElements([ shape1, parent ], 'w', { x: -100, y: 0 });

      // then
      expect(child).to.have.bounds({ x: 300, y: 350, width: 50, height: 50 });
    }));


    it('should keep containing children when moved', inject(function(canvas, elementFactory) {

      // given
      var parent = canvas.addShape(elementFactory.createShape({
        id: 'parent',
        resizable: 'always',
        x: 300, y: 300, width: 300, height: 200
      }));

      var child = canvas.addShape(elementFactory.createShape({
        id: 'child',
        x: 400, y: 350, width: 50, height: 50
      }), parent);

      // when
      resizeElements([ shape1, parent ], 'e', { x: 500, y: 0 });

      // then
      expect(parent).to.have.bounds({ x: 380, y: 300, width: 720, height: 200 });
      expect(child).to.have.bounds({ x: 400, y: 350, width: 50, height: 50 });
    }));


    it('should keep containing children', inject(function(canvas, elementFactory) {

      // given
      var parent = canvas.addShape(elementFactory.createShape({
        id: 'parent',
        resizable: 'always',
        x: 100, y: 300, width: 300, height: 200
      }));

      canvas.addShape(elementFactory.createShape({
        id: 'child',
        x: 300, y: 350, width: 50, height: 50
      }), parent);

      // when
      resizeElements([ shape1, parent ], 'e', { x: -250, y: 0 });

      // then
      expect(parent).to.have.bounds({ x: 100, y: 300, width: 270, height: 200 });
    }));


    it('should keep containing selected children that cannot be resized', inject(
      function(canvas, elementFactory) {

        // given
        var parent = canvas.addShape(elementFactory.createShape({
          id: 'parent',
          resizable: 'always',
          x: 100, y: 300, width: 300, height: 200
        }));

        var child = canvas.addShape(elementFactory.createShape({
          id: 'child',
          x: 300, y: 350, width: 50, height: 50
        }), parent);

        // when
        resizeElements([ shape1, parent, child ], 'e', { x: -250, y: 0 });

        // then
        expect(parent).to.have.bounds({ x: 100, y: 300, width: 270, height: 200 });
        expect(child).to.have.bounds({ x: 300, y: 350, width: 50, height: 50 });
      }
    ));


    it('should ignore connections', inject(function(canvas) {

      // given
      var connection = canvas.addConnection({
        id: 'connection',
        waypoints: [ { x: 150, y: 150 }, { x: 350, y: 150 } ],
        source: shape1,
        target: shape3
      });

      // when
      resizeElements([ shape1, shape3, connection ], 'e', { x: 300, y: 0 });

      // then
      expect(shape1).to.have.bounds({ x: 100, y: 100, width: 200, height: 100 });
      expect(shape3).to.have.bounds({ x: 500, y: 100, width: 200, height: 100 });
    }));


    it('should filter elements via rules', inject(function(eventBus) {

      // given
      eventBus.on('commandStack.elements.resize.canExecute', function(event) {
        return filter(event.context.elements, function(element) {
          return element !== shape2;
        });
      });

      // when
      resizeElements([ shape1, shape2, shape3 ], 'e', { x: 300, y: 0 });

      // then
      expect(shape1).to.have.bounds({ x: 100, y: 100, width: 200, height: 100 });
      expect(shape2).to.have.bounds({ x: 200, y: 100, width: 100, height: 100 });
      expect(shape3).to.have.bounds({ x: 500, y: 100, width: 200, height: 100 });
    }));


    it('should undo in a single step', inject(function(commandStack) {

      // given
      resizeElements([ shape1, shape2, shape3 ], 'e', { x: 300, y: 0 });

      // when
      commandStack.undo();

      // then
      expect(shape1).to.have.bounds({ x: 100, y: 100, width: 100, height: 100 });
      expect(shape2).to.have.bounds({ x: 200, y: 100, width: 100, height: 100 });
      expect(shape3).to.have.bounds({ x: 300, y: 100, width: 100, height: 100 });
    }));


    it('should NOT execute if bounds have not changed', inject(function(commandStack) {

      // when
      resizeElements([ shape1, shape2, shape3 ], 'e', { x: 0, y: 0 });

      // then
      expect(commandStack.canUndo()).to.be.false;
    }));

  });

});
