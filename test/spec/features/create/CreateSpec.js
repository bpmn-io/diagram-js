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

import { getMid } from 'lib/layout/LayoutUtil';

var testModules = [
  createModule,
  rulesModule,
  attachSupportModule,
  modelingModule,
  moveModule,
  dragModule
];

var LOW_PRIORITY = 500;


describe('features/create - Create', function() {

  var rootShape,
      parentShape,
      hostShape,
      childShape,
      frameShape,
      ignoreShape,
      newShape,
      newShape2,
      newElements,
      hiddenShape;

  function setManualDragging(dragging) {
    dragging.setOptions({ manual: true });
  }

  function setupDiagram(elementFactory, canvas) {
    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    parentShape = elementFactory.createShape({
      id: 'parentShape',
      x: 100, y: 100, width: 300, height: 200
    });

    canvas.addShape(parentShape, rootShape);

    hostShape = elementFactory.createShape({
      id: 'hostShape',
      x: 450, y: 250,
      width: 100, height: 100
    });

    canvas.addShape(hostShape, rootShape);

    childShape = elementFactory.createShape({
      id: 'childShape',
      x: 600, y: 250, width: 100, height: 100
    });

    canvas.addShape(childShape, rootShape);

    frameShape = elementFactory.createShape({
      id: 'frameShape',
      x: 450, y: 100, width: 100, height: 100,
      isFrame: true
    });

    canvas.addShape(frameShape, rootShape);

    ignoreShape = elementFactory.createShape({
      id: 'ignoreShape',
      x: 600, y: 100, width: 100, height: 100
    });

    canvas.addShape(ignoreShape, rootShape);

    newShape = elementFactory.createShape({
      id: 'newShape',
      width: 50,
      height: 50
    });

    newElements = [];

    newShape2 = elementFactory.createShape({
      id: 'newShape2',
      width: 50,
      height: 50
    });

    newElements.push(newShape2);

    var newShape3 = elementFactory.createShape({
      id: 'newShape3',
      x: 100,
      y: -25,
      width: 100,
      height: 100
    });

    newElements.push(newShape3);

    newElements.push(elementFactory.createShape({
      id: 'newShape4',
      parent: newShape2,
      x: 100,
      y: -25,
      width: 100,
      height: 100
    }));

    newElements.push(elementFactory.createConnection({
      id: 'newConnection',
      source: newShape2,
      target: newShape3,
      waypoints: [
        { x: 50, y: 25 },
        { x: 100, y: 25 }
      ]
    }));

    hiddenShape = elementFactory.createShape({
      id: 'hiddenShape',
      x: 1000, y: 100, width: 100, height: 100,
      hidden: true
    });

    newElements.push(hiddenShape);
  }


  beforeEach(bootstrapDiagram({
    modules: testModules
  }));

  beforeEach(inject(setManualDragging));

  beforeEach(inject(setupDiagram));


  describe('basics', function() {

    it('should create', inject(function(create, dragging, elementRegistry) {

      // given
      var parentGfx = elementRegistry.getGraphics('parentShape');

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), newShape);

      dragging.hover({ element: parentShape, gfx: parentGfx });

      dragging.move(canvasEvent(getMid(parentShape)));

      dragging.end();

      // then
      var createdShape = elementRegistry.get('newShape');

      expect(createdShape).to.exist;
      expect(createdShape).to.equal(newShape);

      expect(createdShape.parent).to.equal(parentShape);
    }));


    it('should update elements and shape after create', inject(
      function(create, dragging, elementFactory, elementRegistry, eventBus) {

        // given
        var parentGfx = elementRegistry.getGraphics('parentShape');

        var shape = elementFactory.createShape({
          id: 'shape',
          x: 100,
          y: 100,
          width: 100,
          height: 100
        });

        eventBus.on('commandStack.shape.create.preExecute', function(event) {
          var context = event.context;

          context.shape = shape;
        });

        eventBus.on('create.end', LOW_PRIORITY, function(context) {

          // then
          expect(context.elements).to.have.length(1);
          expect(context.elements[0]).to.equal(shape);

          expect(context.shape).to.equal(shape);
        });

        // when
        create.start(canvasEvent({ x: 0, y: 0 }), newShape);

        dragging.hover({ element: parentShape, gfx: parentGfx });

        dragging.move(canvasEvent(getMid(parentShape)));

        dragging.end();
      }
    ));


    it('should append and connect from source to new shape', inject(function(create, dragging, elementRegistry) {

      // given
      var rootGfx = elementRegistry.getGraphics('rootShape');

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), newShape, {
        source: childShape
      });

      dragging.hover({ element: rootShape, gfx: rootGfx });

      dragging.move(canvasEvent({ x: 500, y: 500 }));

      dragging.end();

      // then
      var createdShape = elementRegistry.get('newShape');

      expect(createdShape).to.exist;
      expect(createdShape).to.equal(newShape);

      expect(createdShape.parent).to.equal(rootShape);
      expect(createdShape.incoming).to.have.length(1);
      expect(createdShape.incoming[0].source).to.equal(childShape);

      expect(childShape.outgoing).to.have.length(1);
      expect(childShape.outgoing[0].target).to.equal(createdShape);
    }));


    it('should append and connect from new shape to source', inject(function(create, dragging, elementRegistry) {

      // given
      var rootGfx = elementRegistry.getGraphics('rootShape');

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), newShape, {
        source: childShape,
        hints: {
          connectionTarget: childShape
        }
      });

      dragging.hover({ element: rootShape, gfx: rootGfx });

      dragging.move(canvasEvent({ x: 500, y: 500 }));

      dragging.end();

      // then
      var createdShape = elementRegistry.get('newShape');

      expect(createdShape).to.exist;
      expect(createdShape).to.equal(newShape);

      expect(createdShape.parent).to.equal(rootShape);
      expect(createdShape.outgoing).to.have.length(1);
      expect(createdShape.outgoing[0].target).to.equal(childShape);

      expect(childShape.incoming).to.have.length(1);
      expect(childShape.incoming[0].source).to.equal(createdShape);
    }));


    it('should attach', inject(function(create, dragging, elementRegistry) {

      // given
      var hostShapeGfx = elementRegistry.getGraphics('hostShape');

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), newShape);

      dragging.hover({ element: hostShape, gfx: hostShapeGfx });

      dragging.move(canvasEvent(getMid(hostShape)));

      dragging.end();

      // then
      var createdShape = elementRegistry.get('newShape');

      expect(createdShape).to.exist;
      expect(createdShape).to.equal(newShape);

      expect(createdShape.parent).to.equal(rootShape);
      expect(createdShape.host).to.equal(hostShape);

      expect(hostShape.attachers).to.have.length;
      expect(hostShape.attachers[0]).to.equal(createdShape);
    }));


    it('should attach with label', inject(function(create, dragging, elementFactory, elementRegistry) {

      // given
      var hostShapeGfx = elementRegistry.getGraphics('hostShape');

      var newLabel = elementFactory.createLabel({
        id: 'newLabel',
        labelTarget: newShape,
        x: 0,
        y: 0,
        width: 50,
        height: 50
      });

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), [ newShape, newLabel ]);

      dragging.hover({ element: hostShape, gfx: hostShapeGfx });

      dragging.move(canvasEvent(getMid(hostShape)));

      dragging.end();

      // then
      var createdShape = elementRegistry.get('newShape'),
          createdLabel = elementRegistry.get('newLabel');

      expect(createdShape).to.exist;
      expect(createdShape).to.equal(newShape);

      expect(createdShape.parent).to.equal(rootShape);
      expect(createdShape.host).to.equal(hostShape);

      expect(hostShape.attachers).to.have.length;
      expect(hostShape.attachers[0]).to.equal(createdShape);

      expect(createdLabel).to.exist;
      expect(createdLabel).to.equal(newLabel);

      expect(createdShape.label).to.equal(newLabel);

      expect(createdShape.labels).to.have.length(1);
      expect(createdShape.labels[0]).to.equal(newLabel);
    }));


    it('should append AND attach', inject(function(create, dragging, elementRegistry) {

      // given
      var hostShapeGfx = elementRegistry.getGraphics('hostShape');

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), newShape, {
        source: parentShape
      });

      dragging.hover({ element: hostShape, gfx: hostShapeGfx });

      dragging.move(canvasEvent(getMid(hostShape)));

      dragging.end();

      // then
      var createdShape = elementRegistry.get('newShape');

      expect(createdShape).to.exist;
      expect(createdShape).to.equal(newShape);

      expect(createdShape.parent).to.equal(rootShape);
      expect(createdShape.host).to.equal(hostShape);
      expect(createdShape.incoming).to.have.length(1);
      expect(createdShape.incoming[0].source).to.equal(parentShape);

      expect(hostShape.attachers).to.have.length;
      expect(hostShape.attachers[0]).to.equal(createdShape);

      expect(parentShape.outgoing).to.have.length(1);
      expect(parentShape.outgoing[0].target).to.equal(createdShape);
    }));


    it('should set first shape as primary shape', inject(function(create, dragging) {

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), newElements);

      // then
      var context = dragging.context().data.context;

      expect(context.shape).to.equal(newShape2);
    }));


    it('should ignore hidden shapes when centering elements around cursor', inject(
      function(create, dragging, elementRegistry) {

        // given
        var parentGfx = elementRegistry.getGraphics('parentShape');

        // when
        create.start(canvasEvent({ x: 0, y: 0 }), [ newShape, hiddenShape ]);

        var delta = {
          x: hiddenShape.x - newShape.x,
          y: hiddenShape.y - newShape.y
        };

        dragging.hover({ element: parentShape, gfx: parentGfx });

        dragging.move(canvasEvent({ x: 100, y: 100 }));

        dragging.end();

        // then
        var newVisibleShape = elementRegistry.get('newShape');

        var expectedPosition = {
          x: 100 - (newVisibleShape.width / 2),
          y: 100 - (newVisibleShape.height / 2)
        };

        // visible shape should be centered around cursor
        expect(newVisibleShape).to.exist;
        expect(newVisibleShape.x).to.equal(expectedPosition.x);
        expect(newVisibleShape.y).to.equal(expectedPosition.y);

        var newHiddenShape = elementRegistry.get('hiddenShape');

        // hidden shape should be positioned relative to visible shape
        expect(newHiddenShape).to.exist;

        expect({
          x: newHiddenShape.x - newVisibleShape.x,
          y: newHiddenShape.y - newVisibleShape.y
        }).to.eql(delta);

        expect(newHiddenShape.x).to.equal(1075);
        expect(newHiddenShape.y).to.equal(175);
      }
    ));


    it('should cancel on <elements.changed>', inject(
      function(create, dragging, elementRegistry, eventBus) {

        // given
        create.start(canvasEvent({ x: 0, y: 0 }), newShape);

        // when
        eventBus.fire('elements.changed', { elements: [] });

        // then
        expect(dragging.context()).not.to.exist;
      }
    ));

  });


  describe('rules', function() {

    describe('create shape', function() {

      it('should allow shape create', inject(function(create, dragging, elementRegistry) {

        // given
        var parentGfx = elementRegistry.getGraphics('parentShape');

        // when
        create.start(canvasEvent({ x: 0, y: 0 }), newShape);

        dragging.hover({ element: parentShape, gfx: parentGfx });

        dragging.move(canvasEvent(getMid(parentShape)));

        // then
        var canExecute = dragging.context().data.context.canExecute;

        expect(canExecute).to.exist;
        expect(canExecute.attach).to.be.false;
        expect(canExecute.connect).to.be.false;
      }));


      it('should NOT allow shape create', inject(function(create, dragging, elementRegistry) {

        // given
        var childGfx = elementRegistry.getGraphics('childShape');

        // when
        create.start(canvasEvent({ x: 0, y: 0 }), newShape);

        dragging.hover({ element: childShape, gfx: childGfx });

        dragging.move(canvasEvent(getMid(childShape)));

        // then
        var canExecute = dragging.context().data.context.canExecute;

        expect(canExecute).to.be.false;
      }));

    });


    describe('create elements', function() {

      it('should allow create elements', inject(function(create, dragging, elementRegistry) {

        // given
        var parentGfx = elementRegistry.getGraphics('parentShape');

        // when
        create.start(canvasEvent({ x: 0, y: 0 }), newElements);

        dragging.hover({ element: parentShape, gfx: parentGfx });

        dragging.move(canvasEvent(getMid(parentShape)));

        // then
        var canExecute = dragging.context().data.context.canExecute;

        expect(canExecute).to.exist;
        expect(canExecute.attach).to.be.false;
        expect(canExecute.connect).to.be.false;
      }));


      it('should NOT allow create elements', inject(function(create, dragging, elementRegistry) {

        // given
        var childGfx = elementRegistry.getGraphics('childShape');

        // when
        create.start(canvasEvent({ x: 0, y: 0 }), newElements);

        dragging.hover({ element: childShape, gfx: childGfx });

        dragging.move(canvasEvent(getMid(childShape)));

        // then
        var canExecute = dragging.context().data.context.canExecute;

        expect(canExecute).to.be.false;
      }));

    });


    describe('attach shape', function() {

      it('should allow shape attach', inject(function(create, dragging, elementRegistry) {

        // given
        var hostGfx = elementRegistry.getGraphics('hostShape');

        // when
        create.start(canvasEvent({ x: 0, y: 0 }), newShape);

        dragging.hover({ element: hostShape, gfx: hostGfx });

        dragging.move(canvasEvent(getMid(hostShape)));

        // then
        var canExecute = dragging.context().data.context.canExecute;

        expect(canExecute).to.exist;
        expect(canExecute.attach).to.equal('attach');
        expect(canExecute.connect).to.be.false;
      }));


      it('should NOT allow shape attach', inject(function(create, dragging, elementRegistry) {

        // given
        var parentGfx = elementRegistry.getGraphics('parentShape');

        // when
        create.start(canvasEvent({ x: 0, y: 0 }), newShape);

        dragging.hover({ element: parentShape, gfx: parentGfx });

        dragging.move(canvasEvent(getMid(parentShape)));

        // then
        var canExecute = dragging.context().data.context.canExecute;

        expect(canExecute).to.exist;
        expect(canExecute.attach).to.be.false;
        expect(canExecute.connect).to.be.false;
      }));

    });


    describe('connect shape', function() {

      it('should allow shape connect', inject(function(create, dragging, elementRegistry) {

        // given
        var rootGfx = elementRegistry.getGraphics('rootShape');

        // when
        create.start(canvasEvent({ x: 0, y: 0 }), newShape, {
          source: childShape
        });

        dragging.hover({ element: rootShape, gfx: rootGfx });

        dragging.move(canvasEvent({ x: 500, y: 500 }));

        // then
        var canExecute = dragging.context().data.context.canExecute;

        expect(canExecute).to.exist;
        expect(canExecute.attach).to.be.false;
        expect(canExecute.connect).to.be.true;
      }));


      it('should NOT allow shape connect', inject(function(create, dragging, elementRegistry) {

        // given
        var rootGfx = elementRegistry.getGraphics('rootShape');

        // when
        create.start(canvasEvent({ x: 0, y: 0 }), newShape, {
          source: hostShape
        });

        dragging.hover({ element: rootShape, gfx: rootGfx });

        dragging.move(canvasEvent({ x: 500, y: 500 }));

        // then
        var canExecute = dragging.context().data.context.canExecute;

        expect(canExecute).to.exist;
        expect(canExecute.attach).to.be.false;
        expect(canExecute.connect).to.be.false;
      }));

    });


    describe.skip('connection preview', function() {

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


    it('should NOT allow create if no hover', inject(function(create, dragging, elementRegistry) {

      // given
      var rootGfx = elementRegistry.getGraphics('rootShape');

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), newShape);

      dragging.hover({ element: rootShape, gfx: rootGfx });

      dragging.out();

      // no new hover
      dragging.move(canvasEvent({ x: 500, y: 500 }));

      // then
      var canExecute = dragging.context().data.context;

      expect(canExecute.canExecute).to.be.false;
      expect(canExecute.target).to.be.null;
    }));

  });


  describe('selection', function() {

    it('should not select hidden after create', inject(
      function(create, dragging, elementRegistry, selection) {

        // given
        newShape2.hidden = true;

        var parentGfx = elementRegistry.getGraphics('parentShape');

        // when
        create.start(canvasEvent({ x: 0, y: 0 }), newElements);

        dragging.hover({ element: parentShape, gfx: parentGfx });

        dragging.move(canvasEvent(getMid(parentShape)));

        dragging.end();

        // then
        var createdHiddenShape = elementRegistry.get(newShape2.id);

        expect(selection.get()).not.to.contain(createdHiddenShape);
      }
    ));

  });


  describe('markers', function() {

    it('should add "attach-ok" marker', inject(function(canvas, create, dragging, elementRegistry) {

      // given
      var hostGfx = elementRegistry.getGraphics('hostShape');

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), newShape);

      dragging.hover({ element: hostShape, gfx: hostGfx });

      dragging.move(canvasEvent(getMid(hostShape)));

      // then
      expect(canvas.hasMarker(hostShape, 'attach-ok')).to.be.true;
    }));


    it('should add "drop-not-ok" marker', inject(
      function(canvas, create, dragging, elementRegistry) {

        // given
        var childGfx = elementRegistry.getGraphics('childShape');

        // when
        create.start(canvasEvent({ x: 0, y: 0 }), newShape);

        dragging.hover({ element: childShape, gfx: childGfx });

        dragging.move(canvasEvent(getMid(childShape)));

        // then
        expect(canvas.hasMarker(childShape, 'drop-not-ok')).to.be.true;
      }
    ));


    it('should add "new-parent" marker', inject(
      function(canvas, create, dragging, elementRegistry) {

        // given
        var parentGfx = elementRegistry.getGraphics('parentShape');

        // when
        create.start(canvasEvent({ x: 0, y: 0 }), newShape);

        dragging.hover({ element: parentShape, gfx: parentGfx });

        dragging.move(canvasEvent(getMid(parentShape)));

        // then
        expect(canvas.hasMarker(parentShape, 'new-parent')).to.be.true;
      }
    ));


    it('should ignore hovering', inject(
      function(canvas, create, dragging, elementRegistry) {

        // given
        var ignoreGfx = elementRegistry.getGraphics('ignoreShape');

        // when
        create.start(canvasEvent({ x: 0, y: 0 }), newShape);

        dragging.hover({ element: ignoreShape, gfx: ignoreGfx });

        dragging.move(canvasEvent(getMid(ignoreShape)));

        // then
        expect(canvas.hasMarker(ignoreShape, 'attach-okay')).to.be.false;
        expect(canvas.hasMarker(ignoreShape, 'drop-not-okay')).to.be.false;
        expect(canvas.hasMarker(ignoreShape, 'new-parent')).to.be.false;
      })
    );


    it('should remove markers on cleanup', inject(function(canvas, create, elementRegistry, dragging) {

      // given
      var targetGfx = elementRegistry.getGraphics('parentShape');

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), newShape);

      dragging.move(canvasEvent({ x: 200, y: 50 }));
      dragging.hover({ element: parentShape, gfx: targetGfx });
      dragging.move(canvasEvent({ x: 200, y: 225 }));

      var hasMarker = canvas.hasMarker(parentShape, 'new-parent');

      dragging.end();

      // then
      expect(canvas.hasMarker(parentShape, 'new-parent')).to.be.false;
      expect(canvas.hasMarker(parentShape, 'new-parent')).not.to.eql(hasMarker);
    }));

  });


  describe('hints', function() {

    afterEach(sinon.restore);


    it('should fire create.start with hints', inject(function(create, eventBus) {

      // given
      var spy = sinon.spy(function(event) {
        expect(event.context.hints).to.exist;
      });

      eventBus.once('create.start', spy);

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), newShape);

      // then
      expect(spy).to.have.been.called;
    }));


    it('should fire create.end with hints', inject(
      function(create, dragging, elementRegistry, eventBus) {

        // given
        var parentGfx = elementRegistry.getGraphics(parentShape);

        var spy = sinon.spy(function(event) {
          expect(event.context.hints).to.exist;
        });

        eventBus.once('create.end', spy);

        // when
        create.start(canvasEvent({ x: 0, y: 0 }), newShape);

        dragging.hover({ element: parentShape, gfx: parentGfx });

        dragging.move(canvasEvent(getMid(parentShape)));

        dragging.end();

        // then
        expect(spy).to.have.been.called;
      }
    ));

  });


  describe('constraints', function() {

    beforeEach(inject(function(create, dragging, elementRegistry) {

      // given
      var parentGfx = elementRegistry.getGraphics('parentShape');

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), newShape, {
        createConstraints: {
          top: 10,
          right: 110,
          bottom: 110,
          left: 10
        }
      });

      dragging.hover({ element: parentShape, gfx: parentGfx });
    }));


    it('top left', inject(function(dragging, elementRegistry) {

      dragging.move(canvasEvent({ x: 0, y: 0 }));

      dragging.end();

      var createdShape = elementRegistry.get('newShape');

      // then
      expect(getMid(createdShape)).to.eql({ x: 10, y: 10 });
    }));


    it('top right', inject(function(dragging, elementRegistry) {

      dragging.move(canvasEvent({ x: 120, y: 0 }));

      dragging.end();

      var createdShape = elementRegistry.get('newShape');

      // then
      expect(getMid(createdShape)).to.eql({ x: 110, y: 10 });
    }));


    it('left bottom', inject(function(dragging, elementRegistry) {

      dragging.move(canvasEvent({ x: 0, y: 120 }));

      dragging.end();

      var createdShape = elementRegistry.get('newShape');

      // then
      expect(getMid(createdShape)).to.eql({ x: 10, y: 110 });
    }));


    it('right bottom', inject(function(dragging, elementRegistry) {

      dragging.move(canvasEvent({ x: 120, y: 120 }));

      dragging.end();

      var createdShape = elementRegistry.get('newShape');

      // then
      expect(getMid(createdShape)).to.eql({ x: 110, y: 110 });
    }));

  });


  describe('integration', function() {

    it('should create on hover after dragging is initialized', inject(
      function(create, dragging, elementRegistry, hoverFix) {

        // given
        hoverFix._findTargetGfx = function(event) {
          return elementRegistry.getGraphics(parentShape);
        };

        // when
        create.start(canvasEvent(getMid(parentShape)), newShape);

        dragging.end();

        // then
        var createdShape = elementRegistry.get('newShape');

        expect(createdShape).to.exist;
        expect(createdShape).to.equal(newShape);
        expect(createdShape.parent).to.equal(parentShape);
      }
    ));

  });

});
