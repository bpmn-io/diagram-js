import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import {
  createCanvasEvent as canvasEvent
} from '../../../util/MockEvents';

import { pick } from 'min-dash';

import interactionEventsModule from 'lib/features/interaction-events';
import modelingModule from 'lib/features/modeling';
import resizeModule from 'lib/features/resize';
import rulesModule from './rules';
import selectionModule from 'lib/features/selection';


import { getReferencePoint } from 'lib/features/resize/Resize';

import {
  classes as domClasses,
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import { classes as svgClasses } from 'tiny-svg';

function bounds(b) {
  return pick(b, [ 'x', 'y', 'width', 'height' ]);
}


describe('features/resize - Resize', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      interactionEventsModule,
      modelingModule,
      resizeModule,
      rulesModule,
      selectionModule
    ]
  }));


  var shape, gfx, rootShape;

  beforeEach(inject(function(canvas, elementFactory, elementRegistry) {
    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    var s = elementFactory.createShape({
      id: 'c1',
      resizable: true, // checked by our rules
      x: 100, y: 100, width: 100, height: 100
    });

    shape = canvas.addShape(s);
    gfx = elementRegistry.getGraphics(shape);
  }));


  describe('handles', function() {

    it('should add on shape added', function() {

      // then
      expect(domQueryAll('.djs-resizer', gfx).length).to.equal(8);

      expect(getTranslate(domQuery('.djs-resizer-nw', gfx))).to.eql({ x: 0, y: 0 });
      expect(getTranslate(domQuery('.djs-resizer-n', gfx))).to.eql({ x: 50, y: 0 });
      expect(getTranslate(domQuery('.djs-resizer-ne', gfx))).to.eql({ x: 100, y: 0 });
      expect(getTranslate(domQuery('.djs-resizer-e', gfx))).to.eql({ x: 100, y: 50 });
      expect(getTranslate(domQuery('.djs-resizer-se', gfx))).to.eql({ x: 100, y: 100 });
      expect(getTranslate(domQuery('.djs-resizer-s', gfx))).to.eql({ x: 50, y: 100 });
      expect(getTranslate(domQuery('.djs-resizer-sw', gfx))).to.eql({ x: 0, y: 100 });
      expect(getTranslate(domQuery('.djs-resizer-w', gfx))).to.eql({ x: 0, y: 50 });
    });


    it('should update on shape changed', inject(function(modeling) {

      // when
      modeling.resizeShape(shape, {
        x: shape.x,
        y: shape.y,
        width: shape.width + 100,
        height: shape.height + 100
      });

      // then
      expect(domQueryAll('.djs-resizer', gfx).length).to.equal(8);

      expect(getTranslate(domQuery('.djs-resizer-nw', gfx))).to.eql({ x: 0, y: 0 });
      expect(getTranslate(domQuery('.djs-resizer-n', gfx))).to.eql({ x: 100, y: 0 });
      expect(getTranslate(domQuery('.djs-resizer-ne', gfx))).to.eql({ x: 200, y: 0 });
      expect(getTranslate(domQuery('.djs-resizer-e', gfx))).to.eql({ x: 200, y: 100 });
      expect(getTranslate(domQuery('.djs-resizer-se', gfx))).to.eql({ x: 200, y: 200 });
      expect(getTranslate(domQuery('.djs-resizer-s', gfx))).to.eql({ x: 100, y: 200 });
      expect(getTranslate(domQuery('.djs-resizer-sw', gfx))).to.eql({ x: 0, y: 200 });
      expect(getTranslate(domQuery('.djs-resizer-w', gfx))).to.eql({ x: 0, y: 100 });
    }));


    describe('integration', function() {

      it('should be on top on shape added', function() {

        // then
        var nodes = Array.prototype.slice.call(gfx.childNodes);

        nodes.slice(nodes.length - 8).forEach(function(node) {
          expect(domClasses(node).has('djs-resizer')).to.be.true;
        });
      });


      it('should be on top on shape changed', inject(function(modeling) {

        // when
        modeling.resizeShape(shape, {
          x: shape.x,
          y: shape.y,
          width: shape.width + 100,
          height: shape.height + 100
        });

        // then
        var nodes = Array.prototype.slice.call(gfx.childNodes);

        nodes.slice(nodes.length - 8).forEach(function(node) {
          expect(domClasses(node).has('djs-resizer')).to.be.true;
        });
      }));

    });

  });


  describe('modeling', function() {

    it('should resize nw', inject(function(dragging, resize) {

      // when
      resize.activate(canvasEvent(getReferencePoint(shape, 'nw')), shape, 'nw');

      dragging.move(canvasEvent({ x: 0, y: 0 }));

      dragging.end();

      // then
      expect(shape).to.have.bounds({
        x: 0,
        y: 0,
        width: 200,
        height: 200
      });
    }));


    it('should resize ne', inject(function(dragging, resize) {

      // when
      resize.activate(canvasEvent(getReferencePoint(shape, 'ne')), shape, 'ne');

      dragging.move(canvasEvent({ x: 300, y: 0 }));

      dragging.end();

      // then
      expect(shape).to.have.bounds({
        x: 100,
        y: 0,
        width: 200,
        height: 200
      });
    }));


    it('should resize sw', inject(function(dragging, resize) {

      // when
      resize.activate(canvasEvent(getReferencePoint(shape, 'sw')), shape, 'sw');

      dragging.move(canvasEvent({ x: 0, y: 300 }));

      dragging.end();

      // then
      expect(shape).to.have.bounds({
        x: 0,
        y: 100,
        width: 200,
        height: 200
      });
    }));


    it('should resize se', inject(function(dragging, resize) {

      // when
      resize.activate(canvasEvent(getReferencePoint(shape, 'se')), shape, 'se');

      dragging.move(canvasEvent({ x: 300, y: 300 }));

      dragging.end();

      // then
      expect(shape).to.have.bounds({
        x: 100,
        y: 100,
        width: 200,
        height: 200
      });
    }));


    it('should resize n', inject(function(dragging, resize) {

      // when
      resize.activate(canvasEvent(getReferencePoint(shape, 'n')), shape, 'n');

      dragging.move(canvasEvent({ x: 0, y: 0 }));

      dragging.end();

      // then
      expect(shape).to.have.bounds({
        x: 100,
        y: 0,
        width: 100, // width has NOT changed
        height: 200
      });
    }));


    it('should resize w', inject(function(dragging, resize) {

      // when
      resize.activate(canvasEvent(getReferencePoint(shape, 'w')), shape, 'w');

      dragging.move(canvasEvent({ x: 0, y: 0 }));

      dragging.end();

      // then
      expect(shape).to.have.bounds({
        x: 0,
        y: 100,
        width: 200,
        height: 100 // height has NOT changed
      });
    }));


    it('should resize s', inject(function(dragging, resize) {

      // when
      resize.activate(canvasEvent(getReferencePoint(shape, 's')), shape, 's');

      dragging.move(canvasEvent({ x: 0, y: 300 }));

      dragging.end();

      // then
      expect(shape).to.have.bounds({
        x: 100,
        y: 100,
        width: 100, // width has NOT changed
        height: 200
      });
    }));


    it('should resize e', inject(function(dragging, resize) {

      // when
      resize.activate(canvasEvent(getReferencePoint(shape, 'e')), shape, 'e');

      dragging.move(canvasEvent({ x: 300, y: 0 }));

      dragging.end();

      // then
      expect(shape).to.have.bounds({
        x: 100,
        y: 100,
        width: 200,
        height: 100 // height has NOT changed
      });
    }));


    it('should resize to minimum bounds', inject(function(canvas, resize, dragging, elementFactory) {

      // given
      var shape = elementFactory.createShape({
        id: 'shapeA',
        resizable: 'always',
        x: 100, y: 100, width: 100, height: 100
      });

      shape = canvas.addShape(shape);

      // when
      resize.activate(canvasEvent({ x: 0, y: 0 }), shape, 'se');
      dragging.move(canvasEvent({ x: -99, y: -99 }));
      dragging.end();

      // then
      var shapeBounds = pick(shape, ['x', 'y', 'width', 'height']);

      expect(shapeBounds).to.eql({ x: 100, y: 100, width: 10, height: 10 });
    }));


    it('should resize to minimum bounds', inject(function(canvas, resize, dragging, elementFactory) {

      // given
      var shape = elementFactory.createShape({
        id: 'shapeA',
        resizable: 'always',
        x: 100, y: 100, width: 100, height: 100
      });

      shape = canvas.addShape(shape);

      // when
      resize.activate(canvasEvent({ x: 0, y: 0 }), shape, 'se');
      dragging.move(canvasEvent({ x: -99, y: -99 }));
      dragging.end();

      // then
      var shapeBounds = pick(shape, ['x', 'y', 'width', 'height']);

      expect(shapeBounds).to.eql({ x: 100, y: 100, width: 10, height: 10 });
    }));


    it('should not resize due to rules', inject(function(resize, canvas, dragging, elementFactory) {

      // given
      var shape = elementFactory.createShape({
        id: 'shapeA',
        resizable: true,
        x: 100, y: 100, width: 100, height: 100
      });

      shape = canvas.addShape(shape);

      // when
      resize.activate(canvasEvent({ x: 0, y: 0 }), shape, 'se');
      dragging.move(canvasEvent({ x: -60, y: -60 }));
      dragging.end();

      // then
      var shapeBounds = pick(shape, ['x', 'y', 'width', 'height']);

      expect(shapeBounds).to.eql({ x: 100, y: 100, width: 100, height: 100 });
    }));


    it('should round to full pixel values', inject(function(resize, canvas, dragging, elementFactory) {

      // given
      var shape = elementFactory.createShape({
        id: 'shapeA',
        resizable: 'always',
        x: 100, y: 100, width: 100, height: 100
      });

      shape = canvas.addShape(shape);

      // when
      resize.activate(canvasEvent({ x: 0, y: 0 }), shape, 'se');
      dragging.move(canvasEvent({ x: -20.4, y: 9.8 }));
      dragging.end();

      // then
      var shapeBounds = pick(shape, ['x', 'y', 'width', 'height']);

      expect(shapeBounds).to.eql({ x: 100, y: 100, width: 80, height: 110 });
    }));


    it('should NOT resize if bounds have not changed', inject(
      function(canvas, dragging, elementFactory, modeling, resize) {

        // given
        var resizeShapeSpy = sinon.spy(modeling, 'resizeShape');

        var shape = elementFactory.createShape({
          id: 'shapeA',
          resizable: 'always',
          x: 100,
          y: 100,
          width: 100,
          height: 100
        });

        shape = canvas.addShape(shape);

        // when
        resize.activate(canvasEvent({ x: 200, y: 200 }), shape, 'se');

        dragging.move(canvasEvent({ x: 205, y: 205 }));

        dragging.move(canvasEvent({ x: 200, y: 200 }));

        dragging.end();

        // then
        expect(resizeShapeSpy).not.to.have.been.called;

        expect(shape).to.have.bounds({
          x: 100,
          y: 100,
          width: 100,
          height: 100
        });
      }
    ));

  });


  describe('frame', function() {

    it('should show during resize', inject(function(canvas, resize, dragging) {

      // when
      resize.activate(canvasEvent({ x: 0, y: 0 }), shape, 'se');
      dragging.move(canvasEvent({ x: 20, y: 20 }));

      // then
      var frames = domQueryAll('.djs-resize-overlay', canvas.getDefaultLayer());

      expect(frames.length).to.equal(1);
    }));


    it('should update during resize', inject(function(canvas, resize, dragging) {

      // when
      resize.activate(canvasEvent({ x: 0, y: 0 }), shape, 'se');
      dragging.move(canvasEvent({ x: 20, y: 20 }));
      dragging.move(canvasEvent({ x: 100, y: 200 }));

      // then
      var frame = domQuery('.djs-resize-overlay', canvas.getDefaultLayer());

      var bbox = frame.getBBox();

      expect(bounds(bbox)).to.eql({
        x: 100,
        y: 100,
        width: 200,
        height: 300
      });
    }));


    it('should hide after resize', inject(function(canvas, resize, dragging) {

      // when
      resize.activate(canvasEvent({ x: 0, y: 0 }), shape, 'se');
      dragging.move(canvasEvent({ x: 100, y: 200 }));
      dragging.end();

      // then
      var frame = domQuery('.djs-resize-overlay', canvas.getDefaultLayer());

      expect(frame).to.be.null;
    }));

  });


  describe('rule integration', function() {

    it('should add resize handles only if allowed',
      inject(function(canvas, elementFactory, elementRegistry, selection) {

        // given
        var s = elementFactory.createShape({
          id: 'c2',
          resizable: false,
          x: 300, y: 100, width: 100, height: 100
        });

        var nonResizable = canvas.addShape(s);

        // when
        selection.select(nonResizable);

        // then
        var resizeAnchors = domQueryAll('.resize', gfx);

        expect(resizeAnchors.length).to.equal(0);
      })
    );


    describe('live check, rejecting', function() {

      it('should indicate resize not allowed', inject(function(resize, canvas, dragging) {

        // when resize to small
        resize.activate(canvasEvent({ x: 0, y: 0 }), shape, 'se');
        dragging.move(canvasEvent({ x: -60, y: -60 }));

        // then
        // TODO@philipp: fix in phantomjs, classList is undefined in phantomjs
        var frame = domQuery('.djs-resize-overlay', canvas.getDefaultLayer());

        expect(svgClasses(frame).has('resize-not-ok')).to.equal(true);
      }));

    });

  });


  describe('min bounds', function() {

    var parentShape, childShape, childShape2, connection;

    beforeEach(inject(function(elementFactory, canvas, elementRegistry, modeling) {

      parentShape = elementFactory.createShape({
        id: 'parent',
        resizable: true,
        x: 50, y: 50,
        width: 450, height: 450
      });

      canvas.addShape(parentShape);

      childShape = elementFactory.createShape({
        id: 'child',
        resizable: true,
        x: 100, y: 100,
        width: 100, height: 100
      });

      canvas.addShape(childShape, parentShape);

      childShape2 = elementFactory.createShape({
        id: 'child2',
        x: 300, y: 300,
        width: 100, height: 100
      });

      canvas.addShape(childShape2, parentShape);

      connection = elementFactory.createShape({
        id: 'connection',
        waypoints: [
          { x: 150, y: 150 },
          { x: 350, y: 350 }
        ],
        source: childShape,
        target: childShape2
      });

      canvas.addConnection(connection, parentShape);
    }));


    describe('should use minDimensions', function() {

      it('resize from <se>', inject(function(resize, dragging, canvas) {

        // when
        resize.activate(canvasEvent({ x: 500, y: 500 }), parentShape, {
          direction: 'se',
          minDimensions: {
            width: 300,
            height: 150
          }
        });
        dragging.move(canvasEvent({ x: 0, y: 0 }));
        dragging.end();

        var resizedBounds = pick(parentShape, ['x', 'y', 'width', 'height']);

        // then
        // still takes children bbox into account (!)
        expect(resizedBounds).to.eql({
          x: 50, y: 50,
          width: 370, height: 370
        });

      }));


      it('resize from <nw>', inject(function(resize, dragging, canvas) {

        // when
        resize.activate(canvasEvent({ x: 0, y: 0 }), parentShape, {
          direction: 'nw',
          minDimensions: {
            width: 300,
            height: 150
          }
        });
        dragging.move(canvasEvent({ x: 500, y: 500 }));
        dragging.end();


        var resizedBounds = pick(parentShape, ['x', 'y', 'width', 'height']);

        // then
        // still takes children bbox into account (!)
        expect(resizedBounds).to.eql({
          x: 80, y: 80,
          width: 420, height: 420
        });

      }));

    });


    describe('should use minBounds', function() {

      it('resize from <se>', inject(function(resize, dragging, canvas) {

        // when
        resize.activate(canvasEvent({ x: 500, y: 500 }), parentShape, {
          direction: 'se',
          minBounds: {
            x: 250, y: 250,
            width: 50, height: 50
          }
        });
        dragging.move(canvasEvent({ x: 0, y: 0 }));
        dragging.end();

        var resizedBounds = pick(parentShape, ['x', 'y', 'width', 'height']);

        // then
        expect(resizedBounds).to.eql({
          x: 50, y: 50,
          width: 250, height: 250
        });

      }));


      it('resize from <nw>', inject(function(resize, dragging, canvas) {

        // when
        resize.activate(canvasEvent({ x: 0, y: 0 }), parentShape, {
          direction: 'nw',
          minBounds: {
            x: 250, y: 250,
            width: 50, height: 50
          }
        });
        dragging.move(canvasEvent({ x: 500, y: 500 }));
        dragging.end();

        var resizedBounds = pick(parentShape, ['x', 'y', 'width', 'height']);

        // then
        expect(resizedBounds).to.eql({
          x: 250, y: 250,
          width: 250, height: 250
        });

      }));

    });


    describe('should use children boundary box', function() {

      it('resize from <se>', inject(function(resize, dragging, canvas) {

        // when
        resize.activate(canvasEvent({ x: 500, y: 500 }), parentShape, 'se');
        dragging.move(canvasEvent({ x: 0, y: 0 }));
        dragging.end();

        var resizedBounds = pick(parentShape, ['x', 'y', 'width', 'height']);

        // then
        expect(resizedBounds).to.eql({
          x: 50, y: 50,
          width: 370, height: 370
        });

      }));


      it('resize from <nw>', inject(function(resize, dragging, canvas) {

        // when
        resize.activate(canvasEvent({ x: 0, y: 0 }), parentShape, 'nw');
        dragging.move(canvasEvent({ x: 500, y: 500 }));
        dragging.end();

        var resizedBounds = pick(parentShape, ['x', 'y', 'width', 'height']);

        // then
        expect(resizedBounds).to.eql({
          x: 80, y: 80,
          width: 420, height: 420
        });

      }));

    });


    describe('should use childrenBoxPadding', function() {

      it('resize from <se>', inject(function(resize, dragging, canvas) {

        // when
        resize.activate(canvasEvent({ x: 500, y: 500 }), parentShape, {
          direction: 'se',
          childrenBoxPadding: 50
        });

        dragging.move(canvasEvent({ x: 0, y: 0 }));
        dragging.end();

        var resizedBounds = pick(parentShape, ['x', 'y', 'width', 'height']);

        // then
        expect(resizedBounds).to.eql({
          x: 50, y: 50,
          width: 400, height: 400
        });

      }));


      it('resize from <nw>', inject(function(resize, dragging, canvas) {

        // when
        resize.activate(canvasEvent({ x: 0, y: 0 }), parentShape, {
          direction: 'nw',
          childrenBoxPadding: 50
        });
        dragging.move(canvasEvent({ x: 500, y: 500 }));
        dragging.end();

        var resizedBounds = pick(parentShape, ['x', 'y', 'width', 'height']);

        // then
        expect(resizedBounds).to.eql({
          x: 50, y: 50,
          width: 450, height: 450
        });

      }));

    });

  });

});

// helpers //////////

function getTranslate(svg) {
  var matrix = svg.transform.baseVal.getItem(0).matrix;

  return {
    x: matrix.e,
    y: matrix.f
  };
}