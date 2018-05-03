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

import {
  classes as svgClasses
} from 'tiny-svg';


describe('features/create - Create', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      createModule,
      rulesModule,
      attachSupportModule,
      modelingModule,
      moveModule,
      dragModule
    ]
  }));

  beforeEach(inject(function(dragging, elementRegistry) {
    dragging.setOptions({ manual: true });
  }));

  var rootShape,
      parentShape,
      hostShape,
      childShape,
      newShape;

  beforeEach(inject(function(elementFactory, canvas) {

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


    newShape = elementFactory.createShape({
      id: 'newShape',
      x: 0, y: 0, width: 50, height: 50
    });
  }));


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

  });

});
