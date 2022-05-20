import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import {
  classes as svgClasses
} from 'tiny-svg';

import { createCanvasEvent as canvasEvent } from '../../../util/MockEvents';

import modelingModule from 'lib/features/modeling';
import rulesModule from './rules';
import connectModule from 'lib/features/connect';
import connectionPreviewModule from 'lib/features/connection-preview';

import { getMid } from 'lib/layout/LayoutUtil';


var testModules = [
  modelingModule,
  connectModule,
  rulesModule
];


describe('features/connect', function() {

  var rootShape, shape1, shape2, shape1Gfx, shape2Gfx, shape1child, shapeFrame;

  function setManualDragging(dragging) {
    dragging.setOptions({ manual: true });
  }

  function setupDiagram(canvas, elementFactory) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    shape1 = elementFactory.createShape({
      id: 's1',
      x: 100, y: 100, width: 300, height: 300
    });

    canvas.addShape(shape1, rootShape);

    shape1Gfx = canvas.getGraphics(shape1);

    shape2 = elementFactory.createShape({
      id: 's2',
      x: 500, y: 100, width: 100, height: 100
    });

    canvas.addShape(shape2, rootShape);

    shape2Gfx = canvas.getGraphics(shape2);

    shape1child = elementFactory.createShape({
      id: 's3',
      x: 150, y: 150, width: 50, height: 50
    });

    canvas.addShape(shape1child, shape1);


    shapeFrame = elementFactory.createShape({
      id: 'frame',
      x: 450, y: 300, width: 100, height: 100,
      isFrame: true
    });

    canvas.addShape(shapeFrame, rootShape);
  }


  beforeEach(bootstrapDiagram({
    modules: testModules
  }));

  beforeEach(inject(setManualDragging));

  beforeEach(inject(setupDiagram));


  describe('behavior', function() {

    it('should connect if allowed', inject(function(connect, dragging) {

      // when
      connect.start(canvasEvent(getMid(shape1)), shape1, true);

      dragging.move(canvasEvent(getMid(shape2)));

      dragging.hover({ element: shape2, gfx: shape2Gfx });

      dragging.end();

      var newConnection = shape1.outgoing[0];

      // then
      expect(newConnection).to.exist;
      expect(newConnection.source).to.equal(shape1);
      expect(newConnection.target).to.equal(shape2);
    }));


    it('should connect reverse if allowed', inject(function(connect, dragging) {

      // when
      connect.start(canvasEvent(getMid(shape2)), shape2, true);

      dragging.move(canvasEvent(getMid(shape1)));

      dragging.hover({ element: shape1, gfx: shape1Gfx });

      dragging.end();

      var newConnection = shape2.outgoing[0];

      // then
      expect(newConnection).to.exist;
      expect(newConnection.source).to.equal(shape2);
      expect(newConnection.target).to.equal(shape1);
    }));


    it('should NOT connect if not allowed', inject(function(connect, rules, dragging) {

      // assume
      var context = {
        source: shape1child,
        target: shape2
      };

      expect(rules.allowed('connection.create', context)).to.be.false;

      // when
      connect.start(canvasEvent({ x: 0, y: 0 }), shape1child);

      dragging.move(canvasEvent({ x: 40, y: 30 }));
      dragging.hover(canvasEvent({ x: 10, y: 10 }, { element: shape2 }));
      dragging.end();

      // then
      expect(shape1child.outgoing.length).to.equal(0);
      expect(shape2.incoming.length).to.equal(0);
    }));


    it('should NOT connect if no target', inject(function(connect, rules, dragging) {

      // when
      connect.start(canvasEvent({ x: 0, y: 0 }), shape1);
      dragging.move(canvasEvent({ x: 40, y: 30 }));
      dragging.hover(canvasEvent({ x: 40, y: 30 }, { element: shape2 }));
      dragging.out(canvasEvent({ x: 40, y: 30 }));
      dragging.end();

      // then
      expect(shape1.outgoing.length).to.equal(0);
      expect(shape2.incoming.length).to.equal(0);
    }));


    it('should connect with start position', inject(function(connect, dragging, modeling) {

      // given
      var connectSpy = sinon.spy(modeling, 'connect');

      // when
      connect.start(canvasEvent({ x: 200, y: 0 }), shape1, { x: 200, y: 0 });

      dragging.move(canvasEvent({ x: 555, y: 153 }));

      dragging.hover(canvasEvent({ x: 555, y: 153 }, { element: shape2 }));
      dragging.end();

      // then
      var expectedHints = {
        connectionStart: { x: 200, y: 0 },
        connectionEnd: { x: 555, y: 153 }
      };

      expect(connectSpy).to.have.been.calledWith(
        shape1, shape2,
        { type: 'test:Connection' },
        expectedHints
      );
    }));


    it('should pass meta-data and hints to modeling', inject(function(connect, dragging, modeling) {

      // given
      var connectSpy = sinon.spy(modeling, 'connect');

      // assume
      // connect rule returns { type: 'test:Connection' }

      // when
      connect.start(canvasEvent({ x: 250, y: 250 }), shape1);

      dragging.move(canvasEvent({ x: 550, y: 150 }));

      dragging.hover(canvasEvent({ x: 550, y: 150 }, { element: shape2 }));
      dragging.end();

      // then
      var expectedHints = {
        connectionStart: { x: 250, y: 250 },
        connectionEnd: { x: 550, y: 150 }
      };

      expect(connectSpy).to.have.been.calledWith(
        shape1, shape2,
        { type: 'test:Connection' },
        expectedHints
      );
    }));


    it('should expose created connection on <connect.end>', inject(
      function(connect, dragging, eventBus) {

        // given
        var connectSpy = sinon.spy(function(event) {
          expect(event.context.connection).to.exist;
        });

        eventBus.on('connect.end', connectSpy);

        // when
        connect.start(canvasEvent({ x: 250, y: 250 }), shape1);

        dragging.move(canvasEvent({ x: 550, y: 150 }));

        dragging.hover(canvasEvent({ x: 550, y: 150 }, { element: shape2 }));
        dragging.end();

        // then
        expect(connectSpy).to.have.been.calledOnce;
      }
    ));

  });


  describe('markers', function() {

    it('should add connect-ok marker', inject(function(connect, dragging, canvas) {

      // when
      connect.start(canvasEvent({ x: 0, y: 0 }), shape1);

      dragging.move(canvasEvent({ x: 40, y: 30 }));

      dragging.hover(canvasEvent({ x: 10, y: 10 }, { element: shape2 }));

      // then
      expect(canvas.hasMarker(shape2, 'connect-ok')).to.be.true;
    }));


    it('should add "connect-not-ok" marker', inject(function(connect, dragging, canvas) {

      // when
      connect.start(canvasEvent({ x: 250, y: 250 }), shape1child);

      dragging.move(canvasEvent({ x: 550, y: 150 }));

      dragging.hover(canvasEvent({ x: 550, y: 150 }, { element: shape2 }));

      // then
      expect(canvas.hasMarker(shape2, 'connect-not-ok')).to.be.true;
    }));


    it('should add "connect-not-ok" marker to frame', inject(
      function(connect, dragging, canvas, elementRegistry) {

        // when
        connect.start(canvasEvent({ x: 250, y: 250 }), shape1);

        dragging.move(canvasEvent({ x: 550, y: 150 }));

        dragging.hover(canvasEvent({ x: 550, y: 150 }, { element: shapeFrame }));

        // then
        var targetGfx = elementRegistry.getGraphics(shapeFrame);

        expect(svgClasses(targetGfx).has('djs-frame')).to.equal(true);
        expect(canvas.hasMarker(shapeFrame, 'connect-not-ok')).to.be.true;
      }
    ));


    it('should remove markers', inject(function(connect, dragging, canvas) {

      // when
      connect.start(canvasEvent({ x: 0, y: 0 }), shape1);

      dragging.move(canvasEvent({ x: 40, y: 30 }));

      dragging.hover(canvasEvent({ x: 10, y: 10 }, { element: shape2 }));

      var hasMarker = canvas.hasMarker(shape2, 'connect-ok');

      dragging.end();

      expect(canvas.hasMarker(shape2, 'connect-ok')).to.be.false;
      expect(canvas.hasMarker(shape2, 'connect-ok')).not.to.eql(hasMarker);
    }));

  });


  describe('connection preview', function() {

    beforeEach(bootstrapDiagram({
      modules: testModules.concat(connectionPreviewModule)
    }));

    beforeEach(inject(setManualDragging));

    beforeEach(inject(setupDiagram));


    it('should display preview when hovering', inject(
      function(connect, dragging) {

        // when
        connect.start(canvasEvent({ x: 0, y: 0 }), shape1);

        dragging.move(canvasEvent({ x: 550, y: 150 }));

        dragging.hover(canvasEvent({ x: 550, y: 150 }, { element: shape2 }));

        dragging.move(canvasEvent({ x: 550, y: 150 }));

        var ctx = dragging.context();

        // then
        expect(ctx.data.context.connectionPreviewGfx.parentNode).to.exist;
      })
    );


    it('should display preview without hover', inject(function(connect, dragging) {

      // when
      connect.start(canvasEvent({ x: 0, y: 0 }), shape1);

      dragging.move(canvasEvent({ x: 50, y: 50 }));

      var ctx = dragging.context();

      // then
      expect(ctx.data.context.connectionPreviewGfx.parentNode).to.exist;
    }));


    it('should display preview if connection is disallowed', inject(function(connect, dragging) {

      // when
      connect.start(canvasEvent({ x: 250, y: 250 }), shape1child);

      dragging.move(canvasEvent({ x: 550, y: 150 }));

      dragging.hover(canvasEvent({ x: 550, y: 150 }, { element: shape2 }));

      var ctx = dragging.context();

      // then
      expect(ctx.data.context.connectionPreviewGfx.parentNode).to.exist;
    }));


    it('should display preview if connection is reversed', inject(function(connect, dragging, eventBus, connectionPreview) {

      // given
      var connectionPreviewSpy = sinon.spy(connectionPreview, 'drawPreview');

      eventBus.on('commandStack.connection.create.canExecute', 9999, function(event) {
        return event.context.source.id !== 's1';
      });

      // when
      connect.start(canvasEvent({ x: 250, y: 250 }), shape1);
      dragging.move(canvasEvent({ x: 250, y: 250 }));

      dragging.hover(canvasEvent({ x: 500, y: 100 }, { element: shape2 }));
      dragging.move(canvasEvent({ x: 500, y: 100 }));

      var ctx = dragging.context();

      // then
      expect(ctx.data.context.connectionPreviewGfx.parentNode).to.exist;
      expect(connectionPreviewSpy.lastCall.args[2].connectionStart.x).to.equal(500);
      expect(connectionPreviewSpy.lastCall.args[2].connectionStart.y).to.equal(100);

      expect(connectionPreviewSpy.lastCall.args[2].connectionEnd.x).to.equal(250);
      expect(connectionPreviewSpy.lastCall.args[2].connectionEnd.y).to.equal(250);
    }));

  });

});
