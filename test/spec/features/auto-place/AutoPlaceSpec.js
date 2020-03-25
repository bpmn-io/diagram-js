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
  findFreePosition,
  generateGetNextPosition,
  getConnectedAtPosition,
  getConnectedDistance
} from 'lib/features/auto-place/AutoPlaceUtil';

import { assign } from 'min-dash';

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

    describe('#findFreePosition', function() {

      it('should not have to find another position', inject(function(modeling) {

        // given
        var position = {
          x: 200,
          y: 50
        };

        var nextPositionDirection = {
          y: {
            margin: 50,
            minDistance: 50
          }
        };

        // when
        var freePosition =
          findFreePosition(shape, newShape, position, generateGetNextPosition(nextPositionDirection));

        modeling.appendShape(shape, newShape, freePosition);

        // then
        expect(freePosition).to.eql(position);
      }));


      it('should find another position once (positive margin)', inject(
        function(elementFactory, modeling) {

          // given
          var shape1 = elementFactory.createShape({
            id: 'shape1',
            width: 100,
            height: 100
          });

          modeling.appendShape(shape, shape1, {
            x: 200,
            y: 50
          });

          var position = {
            x: 200,
            y: 50
          };

          var nextPositionDirection = {
            y: {
              margin: 50,
              minDistance: 50
            }
          };

          // when
          var freePosition =
            findFreePosition(shape, newShape, position, generateGetNextPosition(nextPositionDirection));

          modeling.appendShape(shape, newShape, freePosition);

          // then
          expect(freePosition).to.eql({
            x: 200,
            y: 200
          });
        }
      ));


      it('should find another position twice (positive margin)', inject(
        function(elementFactory, modeling) {

          // given
          var shape1 = elementFactory.createShape({
            id: 'shape1',
            width: 100,
            height: 100
          });

          modeling.appendShape(shape, shape1, {
            x: 200,
            y: 50
          });

          var shape2 = elementFactory.createShape({
            id: 'shape2',
            width: 100,
            height: 100
          });

          modeling.appendShape(shape, shape2, {
            x: 200,
            y: 200
          });

          var position = {
            x: 200,
            y: 50
          };

          var nextPositionDirection = {
            y: {
              margin: 50,
              minDistance: 50
            }
          };

          // when
          var freePosition =
            findFreePosition(shape, newShape, position, generateGetNextPosition(nextPositionDirection));

          modeling.appendShape(shape, newShape, freePosition);

          // then
          expect(freePosition).to.eql({
            x: 200,
            y: 350
          });
        }
      ));


      it('should find another position once (negative margin)', inject(
        function(elementFactory, modeling) {

          // given
          var shape1 = elementFactory.createShape({
            id: 'shape1',
            width: 100,
            height: 100
          });

          modeling.appendShape(shape, shape1, {
            x: 200,
            y: 50
          });

          var position = {
            x: 200,
            y: 50
          };

          var nextPositionDirection = {
            y: {
              margin: -50,
              minDistance: 50
            }
          };

          // when
          var freePosition =
            findFreePosition(shape, newShape, position, generateGetNextPosition(nextPositionDirection));

          modeling.appendShape(shape, newShape, freePosition);

          // then
          expect(freePosition).to.eql({
            x: 200,
            y: -100
          });
        }
      ));

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
        var connectedDistance = getConnectedDistance(shape);

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
        var connectedDistance = getConnectedDistance(shape);

        // then
        expect(connectedDistance).to.equal(100);
      }));


      it('should ignore connected at distance greater than max distance', inject(
        function(modeling) {

          // given
          modeling.appendShape(shape, newShape, {
            x: 1000,
            y: 50
          });

          // when
          var connectedDistance = getConnectedDistance(shape);

          // then
          expect(connectedDistance).to.equal(DEFAULT_DISTANCE);
        }
      ));


      describe('direction and reference hint', function() {

        function expectConnectedDistance(position, hints, distance) {
          return inject(function(modeling) {

            // given
            modeling.appendShape(shape, newShape, position);

            // when
            var connectedDistance = getConnectedDistance(shape, assign(hints, {
              maxDistance: 1000
            }));

            // then
            expect(connectedDistance).to.equal(distance);
          });
        }


        it ('direction w, reference start', expectConnectedDistance(
          { x: 250, y: 50 },
          { direction: 'w', reference: 'start' },
          100
        ));


        it('direction w, reference center', expectConnectedDistance(
          { x: 250, y: 50 },
          { direction: 'w', reference: 'center' },
          150
        ));


        it ('direction w, reference end', expectConnectedDistance(
          { x: 250, y: 50 },
          { direction: 'w', reference: 'end' },
          200
        ));


        it('direction s, reference start', expectConnectedDistance(
          { x: 50, y: 250 },
          { direction: 's', reference: 'start' },
          100
        ));


        it('direction s, reference center', expectConnectedDistance(
          { x: 50, y: 250 },
          { direction: 's', reference: 'center' },
          150
        ));


        it('direction s, reference end', expectConnectedDistance(
          { x: 50, y: 250 },
          { direction: 's', reference: 'end' },
          200
        ));


        it('direction e, reference start', expectConnectedDistance(
          { x: -250, y: 50 },
          { direction: 'e', reference: 'start' },
          200
        ));


        it('direction e, reference center', expectConnectedDistance(
          { x: -250, y: 50 },
          { direction: 'e', reference: 'center' },
          250
        ));


        it('direction e, reference end', expectConnectedDistance(
          { x: -250, y: 50 },
          { direction: 'e', reference: 'end' },
          300
        ));

        it('direction n, reference start', expectConnectedDistance(
          { x: 50, y: -250 },
          { direction: 'n', reference: 'start' },
          200
        ));


        it('direction n, reference center', expectConnectedDistance(
          { x: 50, y: -250 },
          { direction: 'n', reference: 'center' },
          250
        ));


        it('direction n, reference end', expectConnectedDistance(
          { x: 50, y: -250 },
          { direction: 'n', reference: 'end' },
          300
        ));

      });


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
        var connectedDistance = getConnectedDistance(shape, {
          filter: filter
        });

        // then
        expect(connectedDistance).to.equal(DEFAULT_DISTANCE);
      }));


      it('should accept default distance hint', inject(function(modeling) {

        // when
        var connectedDistance = getConnectedDistance(shape, {
          defaultDistance: 100
        });

        // then
        expect(connectedDistance).to.equal(100);
      }));


      it('should accept max distance hint', inject(function(modeling) {

        // given
        modeling.appendShape(shape, newShape, {
          x: 500,
          y: 50
        });

        // when
        var connectedDistance = getConnectedDistance(shape, {
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
          var connectedDistance = getConnectedDistance(shape);

          // then
          expect(connectedDistance).to.equal(100);
        });


        it('should weight sources higher than targets', function() {

          // given
          function getWeight(connection) {
            return connection.target === shape ? 5 : 1;
          }

          // when
          var connectedDistance = getConnectedDistance(shape, {
            getWeight: getWeight
          });

          // then
          expect(connectedDistance).to.equal(150);
        });

      });

    });

  });

});
