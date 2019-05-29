/* global sinon */

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
import connectionPreviewModule from 'lib/features/connection-preview';
import rulesModule from './rules';

import {
  classes as svgClasses
} from 'tiny-svg';


var testModules = [
  createModule,
  rulesModule,
  attachSupportModule,
  modelingModule,
  moveModule,
  dragModule
];


describe('features/create - Create', function() {

  var rootShape,
      parentShape,
      hostShape,
      childShape,
      frameShape,
      newShape;

  function setManualDragging(dragging) {
    dragging.setOptions({ manual: true });
  }

  function setupDiagram(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    parentShape = elementFactory.createShape({
      id: 'parent',
      x: 100, y: 100, width: 200, height: 200
    });

    canvas.addShape(parentShape, rootShape);


    hostShape = elementFactory.createShape({
      id: 'hostShape',
      x: 400, y: 200,
      width: 100, height: 100
    });

    canvas.addShape(hostShape, rootShape);


    childShape = elementFactory.createShape({
      id: 'childShape',
      x: 150, y: 350, width: 100, height: 100
    });

    canvas.addShape(childShape, rootShape);


    frameShape = elementFactory.createShape({
      id: 'frameShape',
      x: 400, y: 50, width: 100, height: 100,
      isFrame: true
    });

    canvas.addShape(frameShape, rootShape);


    newShape = elementFactory.createShape({
      id: 'newShape',
      x: 0, y: 0, width: 50, height: 50
    });
  }


  beforeEach(bootstrapDiagram({
    modules: testModules
  }));

  beforeEach(inject(setManualDragging));

  beforeEach(inject(setupDiagram));


  describe('basics', function() {

    it('should create', inject(function(create, elementRegistry, elementFactory, dragging) {

      // given
      var parentGfx = elementRegistry.getGraphics('parentShape');

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), newShape);

      dragging.move(canvasEvent({ x: 125, y: 125 }));
      dragging.hover({ element: parentShape, gfx: parentGfx });
      dragging.move(canvasEvent({ x: 175, y: 175 }));

      dragging.end();

      var createdShape = elementRegistry.get('newShape');

      // then
      expect(createdShape).to.exist;
      expect(createdShape).to.eql(newShape);

      expect(createdShape.parent).to.equal(parentShape);
    }));


    it('should append', inject(function(create, elementRegistry, elementFactory, dragging) {

      // given
      var parentGfx = elementRegistry.getGraphics('parentShape');

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), newShape, childShape);

      dragging.move(canvasEvent({ x: 175, y: 175 }));
      dragging.hover({ element: parentShape, gfx: parentGfx });
      dragging.move(canvasEvent({ x: 400, y: 200 }));

      dragging.end();

      var createdShape = elementRegistry.get('newShape');

      // then
      expect(createdShape).to.exist;
      expect(createdShape).to.eql(newShape);

      expect(createdShape.incoming).to.have.length(1);
      expect(createdShape.incoming).to.eql(childShape.outgoing);
    }));


    it('should attach', inject(function(create, elementRegistry, elementFactory, dragging) {

      // given
      var hostShapeGfx = elementRegistry.getGraphics('hostShape');

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), newShape);

      dragging.move(canvasEvent({ x: 150, y: 350 }));
      dragging.hover({ element: hostShape, gfx: hostShapeGfx });
      dragging.move(canvasEvent({ x: 200, y: 350 }));

      dragging.end();

      // then
      expect(newShape.host).to.equal(hostShape);
      expect(hostShape.attachers).to.include(newShape);
    }));


    it('should append + attach', inject(function(create, elementRegistry, elementFactory, dragging) {

      // given
      var hostShapeGfx = elementRegistry.getGraphics('hostShape');

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), newShape, parentShape);

      dragging.move(canvasEvent({ x: 150, y: 350 }));
      dragging.hover({ element: hostShape, gfx: hostShapeGfx });
      dragging.move(canvasEvent({ x: 200, y: 350 }));

      dragging.end();

      // then
      expect(newShape.host).to.equal(hostShape);
      expect(hostShape.attachers).to.include(newShape);

      // both source and new target are connected
      expect(newShape.incoming).to.eql(parentShape.outgoing);
      expect(newShape.incoming).to.have.length(1);
    }));
  });


  describe('visuals', function() {

    it('should add visuals', inject(function(create, elementRegistry, dragging) {

      // when
      create.start(canvasEvent({ x: 50, y: 50 }), newShape);

      dragging.move(canvasEvent({ x: 50, y: 50 }));

      var ctx = dragging.context();

      // then
      expect(svgClasses(ctx.data.context.visual).has('djs-drag-group')).to.be.true;
    }));


    it('should remove visuals', inject(function(create, elementRegistry, dragging, eventBus) {
      var parentGfx = elementRegistry.getGraphics('parentShape');

      // when
      create.start(canvasEvent({ x: 50, y: 50 }), newShape);

      dragging.move(canvasEvent({ x: 100, y: 100 }));
      dragging.hover({ element: parentShape, gfx: parentGfx });
      dragging.move(canvasEvent({ x: 150, y: 150 }));

      var ctx = dragging.context();

      dragging.end();

      // then
      expect(ctx.data.context.visual.parentNode).not.to.exist;
    }));

  });


  describe('rules', function() {

    it('should not allow shape create', inject(function(canvas, create, elementRegistry, dragging) {
      // given
      var targetGfx = elementRegistry.getGraphics('rootShape');

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), newShape);

      dragging.move(canvasEvent({ x: 50, y: 25 }));
      dragging.hover({ element: rootShape, gfx: targetGfx });
      dragging.move(canvasEvent({ x: 50, y: 50 }));

      dragging.end();

      expect(elementRegistry.getGraphics('attacher')).not.to.exist;
    }));


    it('should add "new-parent" marker', inject(function(canvas, create, elementRegistry, dragging) {
      // given
      var targetGfx = elementRegistry.getGraphics('parentShape');

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), newShape);

      dragging.move(canvasEvent({ x: 200, y: 50 }));
      dragging.hover({ element: parentShape, gfx: targetGfx });
      dragging.move(canvasEvent({ x: 200, y: 225 }));

      expect(canvas.hasMarker(parentShape, 'new-parent')).to.be.true;
    }));


    it('should add "drop-not-ok" marker', inject(function(canvas, create, elementRegistry, dragging) {
      // given
      var targetGfx = elementRegistry.getGraphics('childShape');

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), newShape);

      dragging.move(canvasEvent({ x: 50, y: 25 }));
      dragging.hover({ element: childShape, gfx: targetGfx });
      dragging.move(canvasEvent({ x: 50, y: 50 }));

      expect(canvas.hasMarker(childShape, 'drop-not-ok')).to.be.true;
    }));


    it('should add "drop-not-ok" marker to frame', inject(function(canvas, create, elementRegistry, dragging) {
      // given
      var targetGfx = elementRegistry.getGraphics('frameShape');

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), newShape);

      dragging.move(canvasEvent({ x: 50, y: 25 }));
      dragging.hover({ element: frameShape, gfx: targetGfx });
      dragging.move(canvasEvent({ x: 50, y: 50 }));

      expect(svgClasses(targetGfx).has('djs-frame')).to.be.true;
      expect(canvas.hasMarker(frameShape, 'drop-not-ok')).to.be.true;
    }));


    it('should add "attach-ok" marker', inject(function(canvas, create, elementRegistry, dragging) {
      // given
      var hostGfx = elementRegistry.getGraphics('hostShape');

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), newShape);

      dragging.move(canvasEvent({ x: 150, y: 350 }));
      dragging.hover({ element: hostShape, gfx: hostGfx });
      dragging.move(canvasEvent({ x: 200, y: 350 }));

      expect(canvas.hasMarker(hostShape, 'attach-ok')).to.be.true;
    }));


    it('should remove markers', inject(function(canvas, create, elementRegistry, dragging) {
      // given
      var targetGfx = elementRegistry.getGraphics('parentShape');

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), newShape);

      dragging.move(canvasEvent({ x: 200, y: 50 }));
      dragging.hover({ element: parentShape, gfx: targetGfx });
      dragging.move(canvasEvent({ x: 200, y: 225 }));

      var hasMarker = canvas.hasMarker(parentShape, 'new-parent');

      dragging.end();

      expect(canvas.hasMarker(parentShape, 'new-parent')).to.be.false;
      expect(canvas.hasMarker(parentShape, 'new-parent')).not.to.eql(hasMarker);
    }));


    describe('connection preview', function() {

      beforeEach(bootstrapDiagram({
        modules: testModules.concat(connectionPreviewModule)
      }));

      beforeEach(inject(setManualDragging));

      beforeEach(inject(setupDiagram));


      it('should display connection preview', inject(function(create, elementRegistry, dragging) {

        // given
        var parentGfx = elementRegistry.getGraphics('parentShape');

        // when
        create.start(canvasEvent({ x: 0, y: 0 }), newShape, childShape);

        dragging.move(canvasEvent({ x: 175, y: 175 }));
        dragging.hover({ element: parentShape, gfx: parentGfx });
        dragging.move(canvasEvent({ x: 400, y: 200 }));

        var ctx = dragging.context();

        // then
        expect(ctx.data.context.connectionPreviewGfx).to.exist;
        expect(svgClasses(ctx.data.context.connectionPreviewGfx).has('djs-dragger')).to.be.true;
      }));


      it('should not display preview if connection is disallowed',
        inject(function(create, elementRegistry, dragging, createRules) {

          // given
          createRules.addRule('connection.create', 8000, function() {
            return false;
          });

          var parentGfx = elementRegistry.getGraphics('parentShape');

          // when
          create.start(canvasEvent({ x: 0, y: 0 }), newShape, childShape);

          dragging.move(canvasEvent({ x: 175, y: 175 }));
          dragging.hover({ element: parentShape, gfx: parentGfx });
          dragging.move(canvasEvent({ x: 400, y: 200 }));

          var ctx = dragging.context();

          // then
          expect(ctx.data.context.connectionPreviewGfx.childNodes).to.be.have.lengthOf(0);
        })
      );


      it('should remove connection preview on dragging end', inject(function(create, elementRegistry, dragging) {

        // given
        var parentGfx = elementRegistry.getGraphics('parentShape');

        // when
        create.start(canvasEvent({ x: 0, y: 0 }), newShape, childShape);

        dragging.move(canvasEvent({ x: 175, y: 175 }));
        dragging.hover({ element: parentShape, gfx: parentGfx });
        dragging.move(canvasEvent({ x: 400, y: 200 }));

        var ctx = dragging.context();

        dragging.end();

        // then
        expect(ctx.data.context.connectionPreviewGfx.parentNode).not.to.exist;
      }));


      it('should remove connection preview on dragging cancel', inject(function(create, elementRegistry, dragging) {

        // given
        var parentGfx = elementRegistry.getGraphics('parentShape');

        // when
        create.start(canvasEvent({ x: 0, y: 0 }), newShape, childShape);

        dragging.move(canvasEvent({ x: 175, y: 175 }));
        dragging.hover({ element: parentShape, gfx: parentGfx });
        dragging.move(canvasEvent({ x: 400, y: 200 }));

        var ctx = dragging.context();

        dragging.cancel();

        // then
        expect(ctx.data.context.connectionPreviewGfx.parentNode).not.to.exist;
      }));
    });
  });


  describe('hints', function() {

    afterEach(sinon.restore);


    it('should provide hints object in create.start event handler', inject(
      function(create, eventBus) {

        // given
        var spy = sinon.spy(function(event) {
          expect(event.context.hints).to.exist;
        });

        eventBus.once('create.start', spy);

        // when
        create.start(canvasEvent({ x: 0, y: 0 }), newShape);

        // then
        expect(spy).to.have.been.called;
      }
    ));


    it('should provide hints object in create.end event handler', inject(
      function(create, eventBus, dragging) {

        // given
        var spy = sinon.spy(function(event) {
          expect(event.context.hints).to.exist;
        });

        eventBus.once('create.end', spy);

        // when
        create.start(canvasEvent({ x: 0, y: 0 }), newShape);

        dragging.move(canvasEvent({ x: 50, y: 50 }));
        dragging.hover({ element: parentShape });
        dragging.move(canvasEvent({ x: 100, y: 100 }));
        dragging.end();

        // then
        expect(spy).to.have.been.called;
      }
    ));


    it('should pass hints to commandStack.shape.create event context', inject(
      function(create, eventBus, dragging) {

        // given
        var spy = sinon.spy(function(event) {
          expect(event.context.hints.foo).to.exist;
        });

        eventBus.once('create.start', function(event) {
          event.context.hints.foo = 'foo';
        });

        eventBus.once('commandStack.shape.create.execute', spy);

        // when
        create.start(canvasEvent({ x: 0, y: 0 }), newShape);

        dragging.move(canvasEvent({ x: 50, y: 50 }));
        dragging.hover({ element: parentShape });
        dragging.move(canvasEvent({ x: 100, y: 100 }));
        dragging.end();

        // then
        expect(spy).to.have.been.called;
      }
    ));

  });

});
