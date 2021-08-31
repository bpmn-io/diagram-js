import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import commandModule from 'lib/command';
import modelingModule from 'lib/features/modeling';
import planesModule from 'lib/features/planes';


describe('features/planes/PlanesBehavior', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      coreModule,
      commandModule,
      modelingModule,
      planesModule
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

    it('should switch to affected plane', inject(function(canvas, modeling, commandStack) {

      // given
      modeling.removeShape(shape1);
      canvas.createPlane('1');
      canvas.setActivePlane('1');

      // when
      commandStack.undo();

      // then
      expect(canvas.getActivePlane().name).to.equal('base');
    }));

  });


  describe('redo', function() {

    it('should switch to affected plane', inject(function(canvas, modeling, commandStack) {

      // given
      canvas.createPlane('1');
      modeling.removeShape(shape1);
      commandStack.undo();
      canvas.setActivePlane('1');

      // when
      commandStack.redo();

      // then
      expect(canvas.getActivePlane().name).to.equal('base');
    }));

  });

});

