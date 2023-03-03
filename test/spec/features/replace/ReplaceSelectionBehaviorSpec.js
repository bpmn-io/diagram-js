import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import replaceModule from 'lib/features/replace';


describe('features/replace - ReplaceSelectionBehavior', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      modelingModule,
      replaceModule
    ]
  }));

  var rootShape, parentShape, originalShape;

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

    originalShape = elementFactory.createShape({
      id: 'originalShape',
      x: 110, y: 110, width: 100, height: 100
    });

    canvas.addShape(originalShape, parentShape);
  }));


  describe('#replaceElement', function() {

    it('should select after replacement', inject(function(replace, selection) {

      // given
      var replacement = {
        id: 'replacement',
        width: 200,
        height: 200
      };

      // when
      var newShape = replace.replaceElement(originalShape, replacement);

      // then
      expect(newShape).to.exist;

      // expect added
      expect(selection.get()).to.eql([ newShape ]);
    }));


    it('should NOT select after replacement if <hints.select === false>', inject(function(replace, selection) {

      // given
      var replacement = {
        id: 'replacement',
        width: 200,
        height: 200
      };

      // when
      var newShape = replace.replaceElement(originalShape, replacement, { select: false });

      // then
      expect(newShape).to.exist;

      // expect added
      expect(selection.get()).not.to.include(newShape);
    }));

  });

});
