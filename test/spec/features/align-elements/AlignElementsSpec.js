import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import { sortBy } from 'min-dash';

import alignElementsModule from 'lib/features/align-elements';
import modelingModule from 'lib/features/modeling';
import testRules from './rules';


describe('features/align-elements', function() {

  beforeEach(bootstrapDiagram({
    modules: [ alignElementsModule, modelingModule ]
  }));


  describe('methods', function() {

    var elements = [
      { x: 50, y: 100, width: 100, height: 100 },
      { x: 200, y: 250, width: 100, height: 100 },
      { x: 400, y: 450, width: 300, height: 300 }
    ];


    describe('#_alignmentPosition', function() {

      function expectAlignmentPosition(type, result) {
        return function(alignElements) {

          // when
          var position = alignElements._alignmentPosition(type, elements);

          expect(position).to.eql(result);
        };
      }

      it('should get "left" position', inject(expectAlignmentPosition('left', { left: 50 })));


      it('should get "right" position', inject(expectAlignmentPosition('right', { right: 700 })));


      it('should get "center" position', inject(expectAlignmentPosition('center', { center: 375 })));


      it('should get "top" position', inject(expectAlignmentPosition('top', { top: 100 })));


      it('should get "bottom" position', inject(expectAlignmentPosition('bottom', { bottom: 750 })));


      it('should get "middle" position', inject(expectAlignmentPosition('middle', { middle: 425 })));

    });

  });


  describe('integration', function() {

    function createShapes() {
      inject(function(elementFactory, canvas) {

        rootShape = elementFactory.createRoot({
          id: 'root'
        });

        canvas.setRootElement(rootShape);

        shape1 = elementFactory.createShape({
          id: 's1',
          x: 50, y: 100, width: 100, height: 100
        });

        canvas.addShape(shape1, rootShape);

        shape2 = elementFactory.createShape({
          id: 's2',
          x: 200, y: 250, width: 100, height: 100
        });

        canvas.addShape(shape2, rootShape);

        shape3 = elementFactory.createShape({
          id: 's3',
          x: 800, y: 550, width: 100, height: 100
        });

        canvas.addShape(shape3, rootShape);

        shapeBig = elementFactory.createShape({
          id: 'sBig',
          x: 400, y: 450, width: 300, height: 300
        });

        canvas.addShape(shapeBig, rootShape);

        elements = [ shape1, shape2, shapeBig ];
      })();
    }

    var rootShape, shape1, shape2, shape3, shapeBig, elements;

    beforeEach(function() {
      createShapes();
    });


    it('should align to the "left"', inject(function(alignElements) {

      // when
      alignElements.trigger(elements, 'left');

      // then
      expect(shape1.x).to.equal(50);
      expect(shape2.x).to.equal(50);
      expect(shapeBig.x).to.equal(50);
    }));


    it('should align to the "right"', inject(function(alignElements) {

      // when
      alignElements.trigger(elements, 'right');

      // then
      expect(shape1.x).to.equal(600);
      expect(shape2.x).to.equal(600);
      expect(shapeBig.x).to.equal(400);
    }));


    it('should align to the "center"', inject(function(alignElements) {

      // when
      alignElements.trigger(elements, 'center');

      // then
      expect(shape1.x).to.equal(325);
      expect(shape2.x).to.equal(325);
      expect(shapeBig.x).to.equal(225);
    }));


    it('should align to the "top"', inject(function(alignElements) {

      // when
      alignElements.trigger(elements, 'top');

      // then
      expect(shape1.y).to.equal(100);
      expect(shape2.y).to.equal(100);
      expect(shapeBig.y).to.equal(100);
    }));


    it('should align to the "bottom"', inject(function(alignElements) {

      // when
      alignElements.trigger(elements, 'bottom');

      // then
      expect(shape1.y).to.equal(650);
      expect(shape2.y).to.equal(650);
      expect(shapeBig.y).to.equal(450);
    }));


    it('should align to the "middle"', inject(function(alignElements) {

      // when
      alignElements.trigger(elements.concat(shape3), 'middle');

      // then
      expect(shape1.y).to.equal(550);
      expect(shape2.y).to.equal(550);
      expect(shape3.y).to.equal(550);
      expect(shapeBig.y).to.equal(450);
    }));


    it('should not align if less than two elements', inject(
      function(alignElements, eventBus) {

        // given
        var changedSpy = sinon.spy();

        eventBus.once('commandStack.changed', changedSpy);

        // when
        alignElements.trigger([ shape1 ], 'left');

        // then
        expect(changedSpy).not.to.have.been.called;
      }
    ));


    describe('rules', function() {

      beforeEach(bootstrapDiagram({
        modules: [ alignElementsModule, modelingModule, testRules ]
      }));


      beforeEach(function() {
        createShapes();
      });


      it('should respect rules (false)', inject(function(alignElements, eventBus, testRules) {

        // given
        var changedSpy = sinon.spy();

        eventBus.once('elements.changed', function(_, context) {
          changedSpy(context.elements);
        });

        testRules.setResult(false);

        // when
        alignElements.trigger(elements, 'left');

        // then
        expect(changedSpy).not.to.have.been.called;
      }));


      it('should respect rules (true)', inject(function(alignElements, eventBus, testRules) {

        // given
        var changedSpy = sinon.spy();

        eventBus.once('elements.changed', function(_, context) {
          changedSpy(context.elements);
        });

        testRules.setResult(true);

        // when
        alignElements.trigger(elements, 'left');

        // then
        expect(changedSpy).to.have.been.calledOnce;
        expectSameElements(changedSpy.firstCall.args[0], elements);
      }));


      it('should respect rules (array)', inject(function(alignElements, eventBus, testRules) {

        // given
        var changedSpy = sinon.spy();

        eventBus.once('elements.changed', function(_, context) {
          changedSpy(context.elements);
        });

        testRules.setResult([ shape1, shape2 ]);

        // when
        alignElements.trigger(elements, 'left');

        // then
        expect(changedSpy).to.have.been.calledOnce;
        expectSameElements(changedSpy.firstCall.args[0], [ shape1, shape2 ]);
      }));
    });
  });

});



// helper //////////////////////////////////////////////////////////////////////
function expectSameElements(arr1, arr2) {
  expect(sortBy(arr1, 'id')).to.eql(sortBy(arr2, 'id'));
}
