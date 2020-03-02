import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import autoPlaceModule from 'lib/features/auto-place';
import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';
import selectionModule from 'lib/features/selection';

import { getMid } from 'lib/layout/LayoutUtil';

import {
  deconflictPosition,
  getConnectedAtPosition,
  getConnectedDistance
} from 'lib/features/auto-place/AutoPlaceUtil';

import { DEFAULT_DISTANCE } from 'lib/features/auto-place/AutoPlaceUtil';


describe('features/auto-place', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      autoPlaceModule,
      coreModule,
      modelingModule,
      selectionModule
    ]
  }));

  var root, shape, newShape;

  beforeEach(inject(function(canvas, elementFactory) {
    root = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(root);

    shape = elementFactory.createShape({
      id: 'shape',
      x: 0,
      y: 0,
      width: 100,
      height: 100
    });

    canvas.addShape(shape, root);

    newShape = elementFactory.createShape({
      id: 'newShape',
      width: 100,
      height: 100
    });
  }));


  describe('element placement', function() {

    it('at default distance', inject(function(autoPlace) {

      // when
      autoPlace.append(shape, newShape);

      // then
      expect(newShape).to.have.bounds({
        x: 150,
        y: 0,
        width: 100,
        height: 100
      });
    }));

  });


  describe('integration', function() {

    it('should select', inject(function(autoPlace, selection) {

      // when
      autoPlace.append(shape, newShape);

      // then
      expect(selection.get()).to.eql([ newShape ]);
    }));

  });


  describe('eventbus integration', function() {

    it('<autoPlace.start>', inject(function(autoPlace, eventBus) {

      // given
      var listener = sinon.spy(function(event) {

        // then
        expect(event.shape).to.equal(newShape);
        expect(event.source).to.equal(shape);
      });

      eventBus.on('autoPlace.start', listener);

      // when
      autoPlace.append(shape, newShape);

      expect(listener).to.have.been.called;
    }));


    it('<autoPlace>', inject(function(autoPlace, eventBus) {

      // given
      var listener = sinon.spy(function(event) {

        // then
        expect(event.shape).to.equal(newShape);
        expect(event.source).to.equal(shape);

        return {
          x: 0,
          y: 0
        };
      });

      eventBus.on('autoPlace', listener);

      // when
      newShape = autoPlace.append(shape, newShape);

      expect(listener).to.have.been.called;

      expect(getMid(newShape)).to.eql({
        x: 0,
        y: 0
      });
    }));


    it('<autoPlace.end>', inject(function(autoPlace, eventBus) {

      // given
      var listener = sinon.spy(function(event) {

        // then
        expect(event.shape).to.equal(newShape);
        expect(event.source).to.equal(shape);
      });

      eventBus.on('autoPlace.end', listener);

      // when
      newShape = autoPlace.append(shape, newShape);

      expect(listener).to.have.been.called;
    }));

  });


  it('should pass hints', inject(function(autoPlace) {

    // when
    autoPlace.append(shape, newShape, {
      connectionTarget: shape
    });

    // then
    expect(newShape.outgoing).to.have.lengthOf(1);
    expect(shape.incoming).to.have.lengthOf(1);
  }));


  describe('util', function() {

    describe('#deconflictPosition', function() {

      it('should not have to deconflict', inject(function(modeling) {

        // given
        var position = {
          x: 200,
          y: 50
        };

        var escapeDirection = {
          y: {
            margin: 50,
            rowSize: 50
          }
        };

        // when
        var deconflictedPosition = deconflictPosition(shape, newShape, position, escapeDirection);

        modeling.appendShape(shape, newShape, deconflictedPosition);

        // then
        expect(deconflictedPosition).to.eql(position);
      }));


      it('should deconflict once', inject(function(autoPlace, elementFactory, modeling) {

        // given
        var shape1 = elementFactory.createShape({
          id: 'shape1',
          width: 100,
          height: 100
        });

        autoPlace.append(shape, shape1);

        var position = {
          x: 200,
          y: 50
        };

        var escapeDirection = {
          y: {
            margin: 50,
            rowSize: 50
          }
        };

        // when
        var deconflictedPosition = deconflictPosition(shape, newShape, position, escapeDirection);

        modeling.appendShape(shape, newShape, deconflictedPosition);

        // then
        expect(deconflictedPosition).to.eql({
          x: 200,
          y: 200
        });
      }));

    });


    describe('#getConnectedAtPosition', function() {

      it('should get connected at position', inject(function(autoPlace, elementFactory) {

        // given
        var shape1 = elementFactory.createShape({
          id: 'shape1',
          width: 100,
          height: 100
        });

        autoPlace.append(shape, shape1);

        var position = {
          x: 200,
          y: 50
        };

        // when
        var connectedAtPosition = getConnectedAtPosition(shape, position, newShape);

        // then
        expect(connectedAtPosition).to.equal(shape1);
      }));

    });


    describe('#getConnectedDistance', function() {

      it('should get default distance', function() {

        // when
        var connectedDistance = getConnectedDistance(shape, 'x');

        // then
        expect(connectedDistance).to.equal(DEFAULT_DISTANCE);
      });


      it('should get connected distance', inject(function(modeling) {

        // given
        modeling.appendShape(shape, newShape, {
          x: 250,
          y: 50
        });

        // when
        var connectedDistance = getConnectedDistance(shape, 'x');

        // then
        expect(connectedDistance).to.equal(100);
      }));


      it('should accept filter', inject(function(modeling) {

        // given
        modeling.appendShape(shape, newShape, {
          x: 250,
          y: 50
        });

        function filter(connection) {
          return connection.target !== newShape;
        }

        // when
        var connectedDistance = getConnectedDistance(shape, 'x', filter);

        // then
        expect(connectedDistance).to.equal(DEFAULT_DISTANCE);
      }));


      it('should accept max distance hint', inject(function(modeling) {

        // given
        modeling.appendShape(shape, newShape, {
          x: 500,
          y: 50
        });

        // when
        var connectedDistance = getConnectedDistance(shape, 'x', null, {
          maxDistance: 500
        });

        // then
        expect(connectedDistance).to.equal(350);
      }));


      describe('weighting', function() {

        beforeEach(inject(function(elementFactory, modeling) {
          var shape1 = elementFactory.createShape({
            id: 'shape1',
            width: 100,
            height: 100
          });

          modeling.createShape(shape1, {
            x: 300,
            y: 200
          }, root);

          modeling.connect(shape1, shape);

          modeling.createShape(newShape, {
            x: 250,
            y: 50
          }, root);

          modeling.connect(shape, newShape);
        }));


        it('should weight targets higher than sources by default', function() {

          // when
          var connectedDistance = getConnectedDistance(shape, 'x');

          // then
          expect(connectedDistance).to.equal(100);
        });


        it('should weight sources higher than targets', function() {

          // when
          var connectedDistance = getConnectedDistance(shape, 'x', null, {
            connectionTarget: shape
          });

          // then
          expect(connectedDistance).to.equal(150);
        });

      });

    });

  });

});
