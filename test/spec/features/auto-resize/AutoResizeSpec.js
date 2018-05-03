/* global sinon */

import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import {
  createCanvasEvent as canvasEvent
} from '../../../util/MockEvents';

import modelingModule from 'lib/features/modeling';
import autoResizeModule from 'lib/features/auto-resize';
import createModule from 'lib/features/create';

import AutoResizeProvider from 'lib/features/auto-resize/AutoResizeProvider';
import AutoResize from 'lib/features/auto-resize/AutoResize';

var spy = sinon.spy;

import inherits from 'inherits';


/**
 * Custom auto-resize provider.
 *
 * @param {EventBus} eventBus
 */
function CustomAutoResizeProvider(eventBus) {
  AutoResizeProvider.call(this, eventBus);

  this.canResize = function(elements, target) {
    return target.id !== 'root';
  };
}

inherits(CustomAutoResizeProvider, AutoResizeProvider);


function CustomAutoResize(injector) {
  injector.invoke(AutoResize, this);

  this.getOffset = function(element) {
    return { top: 10, bottom: 10, left: 10, right: 10 };
  };
}

inherits(CustomAutoResize, AutoResize);


var customAutoResizeModule = {
  __init__: [ 'customAutoResizeProvider' ],
  autoResize: [ 'type', CustomAutoResize ],
  customAutoResizeProvider: [ 'type', CustomAutoResizeProvider ]
};


describe('features/auto-resize', function() {

  var rootShape,
      topLevelShape,
      parentShape,
      parentShapeGfx,
      childShape1,
      childShape2,
      newShape;

  beforeEach(bootstrapDiagram({
    modules: [
      modelingModule,
      autoResizeModule,
      customAutoResizeModule,
      createModule
    ]
  }));

  beforeEach(inject(function(elementFactory, elementRegistry, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    topLevelShape = elementFactory.createShape({
      id: 'topLevel',
      x: 410, y: 110, width: 100, height: 100
    });

    canvas.addShape(topLevelShape, rootShape);

    parentShape = elementFactory.createShape({
      id: 'parent',
      x: 100, y: 100, width: 300, height: 300
    });

    canvas.addShape(parentShape, rootShape);

    parentShapeGfx = elementRegistry.getGraphics('parentShape');

    childShape1 = elementFactory.createShape({
      id: 'child1',
      x: 110, y: 110, width: 100, height: 100
    });

    canvas.addShape(childShape1, parentShape);

    childShape2 = elementFactory.createShape({
      id: 'child2',
      x: 220, y: 160, width: 100, height: 100
    });

    canvas.addShape(childShape2, parentShape);

    newShape = elementFactory.createShape({
      id: 'newShape',
      x: 0, y: 0, width: 100, height: 100
    });
  }));


  describe('create', function() {

    it('should resize', inject(function(create, dragging) {

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), newShape);

      dragging.hover({ element: parentShape, gfx: parentShapeGfx });
      dragging.move(canvasEvent({ x: 110, y: 270 }));

      dragging.end();

      // then
      expect(parentShape).to.have.bounds({ x: 50, y: 100, width: 350, height: 300 });
    }));


    describe('hints', function() {

      it('should not resize on autoResize=false hint', inject(
        function(create, dragging, eventBus) {

          // given
          eventBus.on('commandStack.shape.create.preExecute', function(event) {
            event.context.hints = { autoResize: false };
          });

          // when
          create.start(canvasEvent({ x: 0, y: 0 }), newShape);

          dragging.hover({ element: parentShape, gfx: parentShapeGfx });
          dragging.move(canvasEvent({ x: 110, y: 270 }));

          dragging.end();

          // then
          // parent has original bounds
          expect(parentShape).to.have.bounds({ x: 100, y: 100, width: 300, height: 300 });
        }
      ));

    });

  });


  describe('move', function() {

    it('should only resize on actual size change', inject(
      function(modeling, autoResize) {

        // given
        var resizeSpy = spy(autoResize, 'resize');

        // when
        modeling.moveElements([ topLevelShape ], { x: -300, y: 0 }, parentShape);

        // then
        expect(resizeSpy).not.to.have.been.called;
      }
    ));


    it('should expand after moving non-child into parent', inject(function(modeling) {

      // when
      modeling.moveElements([ topLevelShape ], { x: -50, y: 0 }, parentShape);

      // then
      expect(parentShape).to.have.bounds({ x: 100, y: 100, width: 370, height: 300 });
    }));


    describe('expand after moving child', function() {

      it('should expand to the left', inject(function(modeling) {

        // when
        modeling.moveElements([ childShape1 ], { x: -20, y: 0 }, parentShape);

        // then
        expect(parentShape).to.have.bounds({ x: 80, y: 100, width: 320, height: 300 });
      }));


      it('should expand to the right', inject(function(modeling) {

        // when
        modeling.moveElements([ childShape1 ], { x: 300, y: 0 }, parentShape);

        // then
        expect(parentShape).to.have.bounds({ x: 100, y: 100, width: 420, height: 300 });
      }));


      it('should expand to the top', inject(function(modeling) {

        // when
        modeling.moveElements([ childShape1 ], { x: 0, y: -50 }, parentShape);

        // then
        expect(parentShape).to.have.bounds({ x: 100, y: 50, width: 300, height: 350 });
      }));


      it('should expand to the bottom', inject(function(modeling) {

        // when
        modeling.moveElements([ childShape1 ], { x: 0, y: 300 }, parentShape);

        // then
        expect(parentShape).to.have.bounds({ x: 100, y: 100, width: 300, height: 420 });
      }));


      it('should not expand if moved to root element', inject(function(modeling) {

        // when
        modeling.moveElements([ childShape1 ], { x: 0, y: 300 }, rootShape);

        // then
        expect(parentShape).to.have.bounds({ x: 100, y: 100, width: 300, height: 300 });
      }));

    });


    describe('expand after moving multiple elements', function() {

      it('should not expand, if elements keep their parents (different original parents)',
        inject(function(modeling) {

          // when
          modeling.moveElements([ childShape1, topLevelShape ],
            { x: 0, y: 100 }, rootShape, { primaryShape: topLevelShape });

          // then
          expect(parentShape).to.have.bounds({ x: 100, y: 100, width: 300, height: 300 });
        })
      );


      it('should expand non-primary parents', inject(function(modeling) {

        // when
        modeling.moveElements([ childShape1, topLevelShape ],
          { x: 0, y: -80 }, rootShape, { primaryShape: topLevelShape });

        // then
        expect(parentShape).to.have.bounds({ x: 100, y: 20, width: 300, height: 380 });
      }));


      it('should expand, if elements keep their parents (same original parent)',
        inject(function(modeling) {

          // given
          modeling.moveElements([ topLevelShape ], { x: -50, y: 0 }, parentShape);

          // when
          modeling.moveElements([ childShape1, topLevelShape ],
            { x: 100, y: 0 }, parentShape, { primaryShape: childShape1 });

          // then
          expect(parentShape).to.have.bounds({ x: 100, y: 100, width: 470, height: 300 });
        })
      );


      // TODO(nikku): create test case
      it('should expand with connection');

    });


    describe('hints', function() {

      it('should not resize on autoResize=false hint', inject(function(modeling) {

        // when
        modeling.moveElements(
          [ childShape1 ],
          { x: -20, y: 0 },
          parentShape,
          { autoResize: false });

        // then
        // parent has original bounds
        expect(parentShape).to.have.bounds({ x: 100, y: 100, width: 300, height: 300 });
      }));


      it('should accept list of elements to to consider when resizing', inject(
        function(modeling) {

          // when
          modeling.moveElements(
            [ childShape1, childShape2 ],
            { x: 0, y: 200 },
            parentShape,
            { autoResize: [ childShape1 ] });

          // then
          // parent has original bounds
          expect(parentShape).to.have.bounds({ x: 100, y: 100, width: 300, height: 320 });
        }
      ));

    });

  });


  it('should provide extension points', inject(function(autoResize, modeling) {

    // given
    var getPaddingSpy = sinon.spy(autoResize, 'getPadding'),
        getOffsetSpy = sinon.spy(autoResize, 'getOffset');

    // when
    modeling.moveElements([ childShape1 ], { x: -50, y: 0 });

    // then
    expect(getPaddingSpy).to.have.been.calledWith(parentShape);
    expect(getOffsetSpy).to.have.been.calledWith(parentShape);
  }));

});