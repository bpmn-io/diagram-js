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
import replaceModule from 'lib/features/replace';

import AutoResizeProvider from 'lib/features/auto-resize/AutoResizeProvider';
import AutoResize from 'lib/features/auto-resize/AutoResize';

import inherits from 'inherits-browser';


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

      it('should NOT resize on autoResize=false hint', inject(function(create, dragging, eventBus) {

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
      }));

    });

  });


  describe('move', function() {

    it('should only resize on actual size change', inject(function(autoResize, modeling) {

      // given
      var resizeSpy = sinon.spy(autoResize, 'resize');

      // when
      modeling.moveElements([ topLevelShape ], { x: -300, y: 0 }, parentShape);

      // then
      expect(resizeSpy).not.to.have.been.called;
    }));


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


      it('should NOT expand if moved to root element', inject(function(modeling) {

        // when
        modeling.moveElements([ childShape1 ], { x: 0, y: 300 }, rootShape);

        // then
        expect(parentShape).to.have.bounds({ x: 100, y: 100, width: 300, height: 300 });
      }));

    });


    describe('expand after moving multiple elements', function() {

      it('should NOT expand, if elements keep their parents (different original parents)',
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

      it('on move <ne>', inject(function(autoResize, modeling) {

        // given
        var resizeSpy = sinon.spy(autoResize, 'resize');

        // when
        modeling.moveElements([ childShape1 ], { x: -100, y: -100 }, parentShape);

        // then
        expect(getResizeDirections(resizeSpy)).to.exist;
        expect(getResizeDirections(resizeSpy)).to.eql({
          autoResize: 'ne'
        });
      }));


      it('should NOT resize on autoResize=false hint', inject(function(modeling) {

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


      it('should accept list of elements to to consider when resizing', inject(function(modeling) {

        // when
        modeling.moveElements(
          [ childShape1, childShape2 ],
          { x: 0, y: 200 },
          parentShape,
          { autoResize: [ childShape1 ] });

        // then
        expect(parentShape).to.have.bounds({ x: 100, y: 100, width: 300, height: 320 });
      }));

    });

  });


  describe('collapsed shape', function() {

    var rootShape,
        collapsedShape,
        hiddenContainedChild;

    beforeEach(bootstrapDiagram({
      modules: [
        modelingModule,
        autoResizeModule,
        customAutoResizeModule,
        createModule
      ]
    }));

    beforeEach(inject(function(elementFactory, canvas) {
      rootShape = elementFactory.createRoot({
        id: 'root'
      });

      canvas.setRootElement(rootShape);
    }));


    describe('as a child of root element', function() {

      beforeEach(inject(function(elementFactory, canvas) {

        collapsedShape = elementFactory.createShape({
          id: 'collapsedShape',
          x: 110,
          y: 110,
          width: 200,
          height: 200,
          collapsed: true
        });

        canvas.addShape(collapsedShape, rootShape);
      }));


      it('should resize element which is expanded',
        inject(function(autoResize, canvas, elementFactory, modeling) {

          // given
          var autoResizeSpy = sinon.spy(autoResize, '_expand');

          hiddenContainedChild = elementFactory.createShape({
            id: 'hiddenContainedChild',
            x: 120, y: 120, width: 400, height: 400,
            hidden: true
          });

          canvas.addShape(hiddenContainedChild, collapsedShape);

          // when
          modeling.toggleCollapse(collapsedShape);

          // then
          expect(collapsedShape).to.have.bounds({
            x: 110,
            y: 110,
            width: 420,
            height: 420
          });

          expect(hiddenContainedChild).to.have.bounds({
            x: 120,
            y: 120,
            width: 400,
            height: 400
          });

          expect(autoResizeSpy).to.be.called;
        })
      );


      it('should resize element which is expanded even if it has no children',
        inject(function(autoResize, modeling) {

          // given
          var autoResizeSpy = sinon.spy(autoResize, '_expand');

          // when
          modeling.toggleCollapse(collapsedShape);

          // then
          expect(collapsedShape).to.have.bounds({
            x: 110,
            y: 110,
            width: 200,
            height: 200
          });

          expect(autoResizeSpy).to.be.called;
        })
      );


      it('should NOT resize an expanded element which is collapsed',
        inject(function(autoResize, canvas, elementFactory, modeling) {

          // given
          var autoResizeSpy = sinon.spy(autoResize, '_expand');

          var expandedShape = elementFactory.createShape({
            id: 'hiddenContainedChild',
            x: 120, y: 120, width: 400, height: 400,
            collapsed: false
          });

          canvas.addShape(expandedShape, rootShape);

          // when
          modeling.toggleCollapse(expandedShape);

          // then
          expect(collapsedShape).to.have.bounds({
            x: 110,
            y: 110,
            width: 200,
            height: 200
          });

          expect(autoResizeSpy).to.not.be.called;
        })
      );

    });


    describe('as a child of another element', function() {

      beforeEach(inject(function(canvas, elementFactory) {

        parentShape = elementFactory.createShape({
          id: 'parentShape',
          x: 110,
          y: 110,
          width: 200,
          height: 200
        });

        canvas.addShape(parentShape, rootShape);

        collapsedShape = elementFactory.createShape({
          id: 'collapsedShape',
          x: 120, y: 120, width: 100, height: 100,
          collapsed: true
        });

        canvas.addShape(collapsedShape, parentShape);

        hiddenContainedChild = elementFactory.createShape({
          id: 'hiddenContainedChild',
          x: 130, y: 130, width: 400, height: 400,
          hidden: true
        });

        canvas.addShape(hiddenContainedChild, collapsedShape);
      }));


      it('should resize also the parent element', inject(function(autoResize, modeling) {

        // given
        var autoResizeSpy = sinon.spy(autoResize, '_expand');

        // when
        modeling.toggleCollapse(collapsedShape);

        // then
        expect(collapsedShape).to.have.bounds({
          x: 120,
          y: 120,
          width: 420,
          height: 420
        });

        expect(parentShape).to.have.bounds({
          x: 110,
          y: 110,
          width: 440,
          height: 440
        });

        expect(autoResizeSpy).to.be.calledWith([ hiddenContainedChild ], collapsedShape);
        expect(autoResizeSpy).to.be.calledWith([ collapsedShape ], parentShape);
      }));

    });


    describe('hints', function() {

      beforeEach(inject(function(elementFactory, canvas) {

        collapsedShape = elementFactory.createShape({
          id: 'collapsedShape',
          x: 110,
          y: 110,
          width: 200,
          height: 200,
          collapsed: true
        });

        canvas.addShape(collapsedShape, rootShape);
      }));


      it('should NOT resize on autoResize=false hint',
        inject(function(autoResize, eventBus, modeling) {

          // given
          var autoResizeSpy = sinon.spy(autoResize, '_expand');

          eventBus.on('commandStack.shape.toggleCollapse.preExecute', function(event) {
            event.context.hints = { autoResize: false };
          });

          // when
          modeling.toggleCollapse(collapsedShape);

          // then
          expect(collapsedShape).to.have.bounds({
            x: 110,
            y: 110,
            width: 200,
            height: 200
          });

          expect(autoResizeSpy).to.not.be.called;
        })
      );

    });

  });


  describe('replace', function() {

    var rootShape,
        parentShape,
        replacedShape;

    beforeEach(bootstrapDiagram({
      modules: [
        modelingModule,
        autoResizeModule,
        customAutoResizeModule,
        replaceModule
      ]
    }));


    beforeEach(inject(function(elementFactory, canvas) {
      rootShape = elementFactory.createRoot({
        id: 'root'
      });

      canvas.setRootElement(rootShape);

      parentShape = elementFactory.createShape({
        id: 'parent',
        x: 100, y: 100, width: 300, height: 300
      });

      canvas.addShape(parentShape, rootShape);

      replacedShape = elementFactory.createShape({
        id: 'replacedShape',
        x: 110, y: 110, width: 200, height: 200
      });

      canvas.addShape(replacedShape, parentShape);
    }));


    describe('resize child', function() {

      it('should resize parent', inject(function(autoResize, replace) {

        // given
        var autoResizeSpy = sinon.spy(autoResize, '_expand');

        var replacement = {
          id: 'replacement',
          width: 300,
          height: 300
        };

        // when
        replace.replaceElement(replacedShape, replacement);

        // then
        expect(autoResizeSpy).to.be.called;
        expect(parentShape).to.have.bounds({ x: 100, y: 100, width: 320, height: 320 });
      }));

    });


    describe('hints', function() {

      it('should NOT resize on autoResize=false hint',
        inject(function(autoResize, replace) {

          // given
          var autoResizeSpy = sinon.spy(autoResize, '_expand');

          var replacement = {
            id: 'replacement',
            width: 300,
            height: 300
          };

          // when
          replace.replaceElement(replacedShape, replacement, { autoResize: false });

          // then
          expect(autoResizeSpy).to.not.be.called;
          expect(parentShape).to.have.bounds({ x: 100, y: 100, width: 300, height: 300 });
        })
      );

    });

  });


  describe('resize child shape', function() {

    var rootShape,
        parentShape,
        resizedShape;

    beforeEach(bootstrapDiagram({
      modules: [
        modelingModule,
        autoResizeModule,
        customAutoResizeModule,
        replaceModule
      ]
    }));


    beforeEach(inject(function(elementFactory, canvas) {
      rootShape = elementFactory.createRoot({
        id: 'root'
      });

      canvas.setRootElement(rootShape);

      parentShape = elementFactory.createShape({
        id: 'parent',
        x: 100, y: 100, width: 300, height: 300
      });

      canvas.addShape(parentShape, rootShape);

      resizedShape = elementFactory.createShape({
        id: 'resizedShape',
        x: 110, y: 110, width: 200, height: 200
      });

      canvas.addShape(resizedShape, parentShape);
    }));


    describe('resize child', function() {

      it('should resize parent', inject(function(autoResize, modeling) {

        // given
        var autoResizeSpy = sinon.spy(autoResize, '_expand');

        var newBounds = {
          x: 110,
          y: 110,
          width: 300,
          height: 300
        };

        // when
        modeling.resizeShape(resizedShape, newBounds);

        // then
        expect(autoResizeSpy).to.be.called;
        expect(parentShape).to.have.bounds({ x: 100, y: 100, width: 320, height: 320 });
      }));

    });


    describe('hints', function() {

      it('on resize child shape <nwse>', inject(function(autoResize, modeling) {

        // given
        var resizeSpy = sinon.spy(autoResize, 'resize');

        var newBounds = { x: 0, y: 0, width: 500, height: 500 };

        // when
        modeling.resizeShape(resizedShape, newBounds);

        // then
        expect(getResizeDirections(resizeSpy)).to.exist;
        expect(getResizeDirections(resizeSpy)).to.eql({
          autoResize: 'nwse'
        });
      }));


      it('should NOT resize parent on autoResize=false hint',
        inject(function(autoResize, eventBus, modeling) {

          // given
          var autoResizeSpy = sinon.spy(autoResize, '_expand');

          eventBus.on('commandStack.shape.resize.preExecute', function(event) {
            event.context.hints = { autoResize: false };
          });

          var newBounds = {
            x: 110,
            y: 110,
            width: 300,
            height: 300
          };

          // when
          modeling.resizeShape(resizedShape, newBounds);

          // then
          expect(autoResizeSpy).to.not.be.called;
          expect(parentShape).to.have.bounds({ x: 100, y: 100, width: 300, height: 300 });
        })
      );

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

// helpers //////////

function getResizeDirections(spy) {
  return spy.getCall(0).lastArg;
}