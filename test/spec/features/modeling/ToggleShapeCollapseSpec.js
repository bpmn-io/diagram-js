import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';


describe('features/modeling - toggle collapsed', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      modelingModule
    ]
  }));

  var rootShape;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);
  }));


  describe('expand', function() {

    var shapeToExpand,
        hiddenContainedChild,
        hiddenContainedSubChild;

    beforeEach(inject(function(elementFactory, canvas) {

      shapeToExpand = elementFactory.createShape({
        id: 'shapeToExpand',
        x: 100, y: 100, width: 300, height: 300,
        collapsed: true
      });

      canvas.addShape(shapeToExpand, rootShape);

      hiddenContainedChild = elementFactory.createShape({
        id: 'hiddenContainedChild',
        x: 150, y: 110, width: 100, height: 100,
        hidden: true
      });

      canvas.addShape(hiddenContainedChild, shapeToExpand);

      hiddenContainedSubChild = elementFactory.createShape({
        id: 'hiddenContainedSubChild',
        x: 170, y: 150, width: 50, height: 50,
        hidden: true
      });

      canvas.addShape(hiddenContainedSubChild, hiddenContainedChild);
    }));


    it('expand and should show children', inject(function(modeling) {

      // given
      var originalChildren = shapeToExpand.children.slice();

      // when
      modeling.toggleCollapse(shapeToExpand);

      // then
      expect(shapeToExpand.children).to.eql(originalChildren);
      expect(shapeToExpand.children).to.satisfy(allShown());
    }));


    it('expand and show sub children recursively', inject(function(modeling) {

      // when
      modeling.toggleCollapse(shapeToExpand);

      // then
      expect(hiddenContainedSubChild.hidden).not.to.be.true;
    }));


    describe('undo', function() {

      it('collapse and hide all children', inject(function(modeling, commandStack) {

        // given
        var originalChildren = shapeToExpand.children.slice();
        modeling.toggleCollapse(shapeToExpand);

        // when
        commandStack.undo();

        // then
        expect(shapeToExpand.collapsed).to.be.true;
        expect(shapeToExpand.children).to.eql(originalChildren);
        expect(shapeToExpand.children).to.satisfy(allHidden());
      }));


      it('collapse and hide all children recursively', inject(function(modeling, commandStack) {

        // given
        modeling.toggleCollapse(shapeToExpand);

        // when
        commandStack.undo();

        // then
        expect(hiddenContainedSubChild.hidden).to.be.true;
      }));
    });

  });


  describe('collapse', function() {

    var shapeToCollapse,
        shownChildShape,
        shownSubChildShape,
        hiddenChildShape;

    beforeEach(inject(function(elementFactory, canvas) {

      shapeToCollapse = elementFactory.createShape({
        id: 'shapeToCollapse',
        x: 100, y: 100, width: 300, height: 300,
        collapsed: false
      });

      canvas.addShape(shapeToCollapse, rootShape);

      shownChildShape = elementFactory.createShape({
        id: 'shownChildShape',
        x: 110, y: 110,
        width: 100, height: 100
      });

      canvas.addShape(shownChildShape, shapeToCollapse);

      shownSubChildShape = elementFactory.createShape({
        id: 'shownSubChildShape',
        x: 150, y: 150,
        width: 50, height: 50
      });

      canvas.addShape(shownSubChildShape, shownChildShape);

      hiddenChildShape = elementFactory.createShape({
        id: 'hiddenChildShape',
        x: 220, y: 110,
        width: 100, height: 100,
        hidden: true
      });

      canvas.addShape(hiddenChildShape, shapeToCollapse);
    }));


    it('collapse and hide children', inject(function(modeling) {

      // given
      var originalChildren = shapeToCollapse.children.slice();

      // when
      modeling.toggleCollapse(shapeToCollapse);

      // then
      expect(shapeToCollapse.collapsed).to.be.true;
      expect(shapeToCollapse.children).to.eql(originalChildren);
      expect(shapeToCollapse.children).to.satisfy(allHidden());
    }));


    it('collapse and hide sub children recursively', inject(function(modeling) {

      // when
      modeling.toggleCollapse(shapeToCollapse);

      // then
      expect(shownSubChildShape.hidden).to.be.true;
    }));


    describe('undo', function() {

      it('expand and show children that were visible', inject(
        function(modeling, commandStack) {

          // given
          var originalChildren = shapeToCollapse.children.slice();
          modeling.toggleCollapse(shapeToCollapse);

          // when
          commandStack.undo();

          // then
          expect(shapeToCollapse.collapsed).to.be.false;
          expect(shapeToCollapse.children).to.eql(originalChildren);
          expect(shownChildShape.hidden).not.to.be.true;
          expect(hiddenChildShape.hidden).to.be.true;
        }
      ));


      it('expand do not show children under collapsed parents', inject(
        function(modeling, commandStack) {

          // given
          modeling.toggleCollapse(shownChildShape);
          modeling.toggleCollapse(shapeToCollapse);

          // when
          commandStack.undo();

          // then
          expect(shownSubChildShape.hidden).to.be.true;
          expect(shownChildShape.collapsed).to.be.true;
        }
      ));

    });


    describe('expand afterwards', function() {

      it('should keep collapsed child visually collapsed', inject(
        function(modeling, commandStack) {

          // given
          modeling.toggleCollapse(shownChildShape);
          modeling.toggleCollapse(shapeToCollapse);

          // assume
          expect(shownSubChildShape.hidden).to.be.true;
          expect(shownChildShape.hidden).to.be.true;

          expect(shownChildShape.collapsed).to.be.true;

          // when
          modeling.toggleCollapse(shapeToCollapse);

          // then
          expect(shownSubChildShape.hidden).to.be.true;
          expect(shownChildShape.hidden).to.be.false;

          expect(shownChildShape.collapsed).to.be.true;
        }
      ));


      it('should keep expanded child visually expanded', inject(
        function(modeling, commandStack) {

          // given
          modeling.toggleCollapse(shapeToCollapse);

          // assume
          expect(shownSubChildShape.hidden).to.be.true;
          expect(shownChildShape.hidden).to.be.true;

          expect(shownChildShape.collapsed).not.to.be.true;

          // when
          modeling.toggleCollapse(shapeToCollapse);

          // then
          expect(shownSubChildShape.hidden).to.be.false;
          expect(shownChildShape.hidden).to.be.false;

          expect(shownChildShape.collapsed).not.to.be.true;
        }
      ));

    });

  });

});


// helpers //////////////////////

function allHidden() {
  return childrenHidden(true);
}

function allShown() {
  return childrenHidden(false);
}

function childrenHidden(hidden) {
  return function(children) {
    return children.every(function(c) {
      return c.hidden == hidden;
    });
  };
}
