import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import createModule from 'lib/features/create';
import draggingModule from 'lib/features/dragging';
import modelingModule from 'lib/features/modeling';
import moveModule from 'lib/features/move';
import connectModule from 'lib/features/connect';
import rulesModule from './rules';
import selectionModule from 'lib/features/selection';


describe('features/selection/Selection', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      coreModule,
      draggingModule,
      modelingModule,
      createModule,
      moveModule,
      connectModule,
      rulesModule,
      selectionModule
    ]
  }));

  var shape1, shape2, connection1;

  beforeEach(inject(function(canvas) {

    // given
    shape1 = canvas.addShape({
      id: 'shape1',
      x: 10,
      y: 10,
      width: 100,
      height: 100
    });

    shape2 = canvas.addShape({
      id: 'shape2',
      x: 150,
      y: 10,
      width: 100,
      height: 100
    });

    connection1 = canvas.addConnection({
      id: 'connection1',
      source: 'shape1',
      target: 'shape2',
      waypoints: [ { x: 110, y: 60 }, { x: 150, y: 60 } ]
    });
  }));


  describe('bootstrap', function() {

    it('should bootstrap diagram with component', inject(function(selection) {
      expect(selection).to.exist;
    }));

  });


  describe('#isSelected', function() {

    it('should get selected elements', inject(function(selection) {

      // given
      selection.select(shape1);

      // when
      var isSelected = selection.isSelected(shape1);

      // then
      expect(isSelected).to.be.true;
    }));

  });


  describe('#select', function() {

    it('should add shape to selection', inject(function(selection) {

      // when
      selection.select(shape1);

      // then
      var selectedElements = selection.get();

      expect(selectedElements[0]).to.equal(shape1);
    }));


    it('should add connection to selection', inject(function(selection) {

      // when
      selection.select(connection1);

      // then
      var selectedElements = selection.get();

      expect(selectedElements[0]).to.equal(connection1);
    }));


    it('should add multiple elements to selection', inject(function(selection) {

      // when
      selection.select(shape2);
      selection.select(connection1, true);

      // then
      var selectedElements = selection.get();

      expect(selectedElements[0]).to.equal(shape2);
      expect(selectedElements[1]).to.equal(connection1);
    }));


    it('should remove all elements from selection', inject(function(selection) {

      // given
      selection.select(shape2);
      selection.select(connection1, true);

      // when
      selection.select();

      // then
      var selectedElements = selection.get();

      expect(selectedElements.length).to.equal(0);
    }));


    it('should not fail on empty selection', inject(function(selection) {

      // when
      selection.select();

      // then
      var selectedElements = selection.get();

      expect(selectedElements.length).to.equal(0);
    }));


    it('should not select elements on other plane', inject(function(canvas, selection) {

      // given
      var shapeRoot = canvas.addRootElement({ id: 'root' });

      var shape3 = canvas.addShape({
        id: 'shape3',
        x: 300,
        y: 10,
        width: 100,
        height: 100
      }, shapeRoot);

      // when
      selection.select(shape1);
      selection.select(shape2, true);
      selection.select(shape3, true);

      // then
      var selectedElements = selection.get();

      expect(selectedElements.length).to.equal(2);
      expect(selectedElements).to.not.contain(shape3);
    }));

  });


  describe('#deselect', function() {

    it('should remove shape from selection', inject(function(selection) {

      // given
      selection.select(shape2);
      selection.select(connection1, true);

      // when
      selection.deselect(shape2);

      // then
      var selectedElements = selection.get();

      expect(selectedElements[0]).to.equal(connection1);
      expect(selectedElements.length).to.equal(1);
    }));

  });


  describe('integration', function() {

    describe('delete shape/connection', function() {

      it('should remove deleted shape from selection', inject(function(eventBus, modeling, selection) {

        // given
        selection.select(shape1);

        var changedSpy = sinon.spy();

        eventBus.on('selection.changed', changedSpy);

        // when
        modeling.removeShape(shape1);

        // then
        expect(selection.get()).to.be.empty;

        expect(changedSpy).to.have.been.called;
      }));


      it('should remove deleted connection from selection', inject(function(eventBus, modeling, selection) {

        // given
        selection.select(connection1);

        var changedSpy = sinon.spy();

        eventBus.on('selection.changed', changedSpy);

        // when
        modeling.removeShape(connection1);

        // then
        expect(selection.get()).to.be.empty;

        expect(changedSpy).to.have.been.called;
      }));

    });


    describe('clear', function() {

      it('should remove selection', inject(function(selection, eventBus) {

        // given
        selection.select(shape1);

        var changedSpy = sinon.spy(function() {});

        eventBus.on('selection.changed', changedSpy);

        // when
        eventBus.fire('diagram.clear');

        // then
        expect(selection.get()).to.be.empty;

        expect(changedSpy).to.have.been.called;
      }));

    });

  });

});
