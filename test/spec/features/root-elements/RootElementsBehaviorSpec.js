import { expect } from 'chai';

import {
  bootstrapDiagram,
  inject
} from 'diagram-js/test/TestHelper.js';

import coreModule from 'diagram-js/lib/core';
import commandModule from 'diagram-js/lib/command';
import modelingModule from 'diagram-js/lib/features/modeling';
import rootElementsModule from 'diagram-js/lib/features/root-elements';


describe('features/planes/RootElementsBehavior', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      coreModule,
      commandModule,
      modelingModule,
      rootElementsModule
    ]
  }));

  var shape1;

  beforeEach(inject(function(canvas) {

    // given
    shape1 = canvas.addShape({
      id: 'shape1',
      x: 10,
      y: 10,
      width: 100,
      height: 100
    });
  }));


  describe('undo', function() {

    it('should switch to affected root', inject(function(canvas, modeling, commandStack) {

      // given
      modeling.removeShape(shape1);

      canvas.setRootElement(canvas.addRootElement(null));

      // when
      commandStack.undo();

      // then
      expect(canvas.getRootElement()).to.equal(shape1.parent);
    }));

  });


  describe('redo', function() {

    it('should switch to affected root', inject(function(canvas, modeling, commandStack) {

      // given
      var rootElement = canvas.getRootElement();

      var otherRootElement = canvas.addRootElement(null);

      modeling.removeShape(shape1);
      commandStack.undo();
      canvas.setRootElement(otherRootElement);

      // when
      commandStack.redo();

      // then
      expect(canvas.getRootElement()).to.equal(rootElement);
    }));

  });

});

