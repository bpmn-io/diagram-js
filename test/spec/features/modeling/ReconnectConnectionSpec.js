import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';


describe('features/modeling - reconnect connection', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      modelingModule,
      {
        layouter: [ 'type', NoopLayouter ]
      }
    ]
  }));


  var parentShape, childShape, childShape2, connection;

  beforeEach(inject(function(elementFactory, canvas) {

    parentShape = elementFactory.createShape({
      id: 'parent',
      x: 100, y: 100, width: 300, height: 300
    });

    canvas.addShape(parentShape);

    childShape = elementFactory.createShape({
      id: 'child',
      x: 110, y: 110, width: 100, height: 100
    });

    canvas.addShape(childShape, parentShape);

    childShape2 = elementFactory.createShape({
      id: 'child2',
      x: 200, y: 110, width: 100, height: 100
    });

    canvas.addShape(childShape2, parentShape);

    connection = elementFactory.createConnection({
      id: 'connection',
      waypoints: [ { x: 150, y: 150 }, { x: 150, y: 200 }, { x: 350, y: 150 } ],
      source: childShape,
      target: childShape2
    });

    canvas.addConnection(connection, parentShape);
  }));


  describe('reconnect', function() {

    it('should execute', inject(function(modeling) {

      // when
      modeling.reconnect(connection, childShape, connection.target);

      // then
      expect(connection.source).to.equal(childShape);
    }));


    it('should undo', inject(function(modeling, commandStack) {

      // given
      var oldSource = connection.source;

      modeling.reconnect(connection, childShape, connection.target);

      // when
      commandStack.undo();

      // then
      expect(connection.source).to.equal(oldSource);
    }));


    it('should redo', inject(function(modeling, commandStack) {

      // given
      modeling.reconnect(connection, childShape, connection.target);

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(connection.source).to.equal(childShape);
    }));

  });


  describe('reconnectStart', function() {

    describe('passing position', function() {

      it('should execute', inject(function(modeling) {

        // given
        var newWaypoints = [ { x: 120, y: 120 }, { x: 350, y: 150 } ];

        // when
        modeling.reconnectStart(connection, childShape, { x: 120, y: 120 });

        // then
        expect(connection).to.have.waypoints(newWaypoints);
      }));


      it('should undo', inject(function(modeling, commandStack) {

        // given
        var oldWaypoints = connection.waypoints.slice();

        modeling.reconnectStart(connection, childShape, { x: 120, y: 120 });

        // when
        commandStack.undo();

        // then
        expect(connection).to.have.waypoints(oldWaypoints);
      }));


      it('should redo', inject(function(modeling, commandStack) {

        // given
        var newWaypoints = [ { x: 120, y: 120 }, { x: 350, y: 150 } ];

        modeling.reconnectStart(connection, childShape, { x: 120, y: 120 });

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(connection).to.have.waypoints(newWaypoints);
      }));


      it('should layout connection', inject(function(modeling) {

        // given
        var layoutSpy = sinon.spy(modeling, 'layoutConnection'),
            docking = { x: 120, y: 120 };

        // when
        modeling.reconnectStart(connection, childShape, docking);

        // then
        expect(layoutSpy).to.have.been.calledOnce;
        expect(layoutSpy.getCall(0).args).to.eql([ connection, { connectionStart: docking } ]);

      }));

    });


    describe('passing waypoints', function() {

      it('should execute', inject(function(modeling) {

        // given
        var newWaypoints = [ { x: 110, y: 110 }, { x: 300, y: 300 } ];

        // when
        modeling.reconnectStart(connection, childShape, newWaypoints);

        // then
        expect(connection).to.have.waypoints(newWaypoints);
      }));


      it('should undo', inject(function(modeling, commandStack) {

        // given
        var oldWaypoints = connection.waypoints.slice();

        modeling.reconnectStart(connection, childShape, [ { x: 110, y: 110 }, { x: 300, y: 300 } ]);

        // when
        commandStack.undo();

        // then
        expect(connection).to.have.waypoints(oldWaypoints);
      }));


      it('should redo', inject(function(modeling, commandStack) {

        // given
        var newWaypoints = [ { x: 110, y: 110 }, { x: 300, y: 300 } ];

        modeling.reconnectStart(connection, childShape, newWaypoints);

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(connection).to.have.waypoints(newWaypoints);
      }));


      it('should layout connection', inject(function(modeling) {

        // given
        var newWaypoints = [ { x: 110, y: 110 }, { x: 300, y: 300 } ],
            docking = newWaypoints[0],
            layoutSpy = sinon.spy(modeling, 'layoutConnection');

        // when
        modeling.reconnectStart(connection, childShape, newWaypoints);

        // then
        expect(layoutSpy).to.have.been.calledOnce;
        expect(layoutSpy.getCall(0).args).to.eql([ connection, { connectionStart: docking } ]);

      }));

    });

  });


  describe('reconnectEnd', function() {

    describe('passing position', function() {

      it('should execute', inject(function(modeling) {

        // given
        var newWaypoints = [ { x: 150, y: 150 }, { x: 300, y: 100 } ];

        // when
        modeling.reconnectEnd(connection, childShape2, { x: 300, y: 100 });

        // then
        expect(connection).to.have.waypoints(newWaypoints);
      }));


      it('should undo', inject(function(modeling, commandStack) {

        // given
        var oldWaypoints = connection.waypoints.slice();

        modeling.reconnectEnd(connection, childShape2, { x: 300, y: 100 });

        // when
        commandStack.undo();

        // then
        expect(connection).to.have.waypoints(oldWaypoints);
      }));


      it('should redo', inject(function(modeling, commandStack) {

        // given
        var newWaypoints = [ { x: 150, y: 150 }, { x: 300, y: 100 } ];

        // when
        modeling.reconnectEnd(connection, childShape2, { x: 300, y: 100 });

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(connection).to.have.waypoints(newWaypoints);
      }));


      it('should layout connection', inject(function(modeling) {

        // given
        var layoutSpy = sinon.spy(modeling, 'layoutConnection'),
            docking = { x: 120, y: 120 };

        // when
        modeling.reconnectEnd(connection, childShape, docking);

        // then
        expect(layoutSpy).to.have.been.calledOnce;
        expect(layoutSpy.getCall(0).args).to.eql([ connection, { connectionEnd: docking } ]);

      }));

    });


    describe('passing waypoints', function() {

      it('should execute', inject(function(modeling) {

        // given
        var newWaypoints = [ { x: 110, y: 110 }, { x: 300, y: 300 } ];

        // when
        modeling.reconnectEnd(connection, childShape2, newWaypoints);

        // then
        expect(connection).to.have.waypoints(newWaypoints);
      }));


      it('should undo', inject(function(modeling, commandStack) {

        // given
        var oldWaypoints = connection.waypoints.slice();

        modeling.reconnectEnd(connection, childShape2, [ { x: 110, y: 110 }, { x: 300, y: 300 } ]);

        // when
        commandStack.undo();

        // then
        expect(connection).to.have.waypoints(oldWaypoints);
      }));


      it('should redo', inject(function(modeling, commandStack) {

        // given
        var newWaypoints = [ { x: 110, y: 110 }, { x: 300, y: 300 } ];

        modeling.reconnectEnd(connection, childShape2, newWaypoints);

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(connection).to.have.waypoints(newWaypoints);
      }));


      it('should layout connection', inject(function(modeling) {

        // given
        var newWaypoints = [ { x: 110, y: 110 }, { x: 300, y: 300 } ],
            docking = newWaypoints[1],
            layoutSpy = sinon.spy(modeling, 'layoutConnection');

        // when
        modeling.reconnectEnd(connection, childShape, newWaypoints);

        // then
        expect(layoutSpy).to.have.been.calledOnce;
        expect(layoutSpy.getCall(0).args).to.eql([ connection, { connectionEnd: docking } ]);

      }));

    });

  });


  describe('hints', function() {

    it('should accept layout hints', inject(function(modeling) {

      // when
      modeling.reconnect(connection, childShape, connection.target, connection.waypoints, {
        connectionStart: {
          x: 0,
          y: 0
        },
        connectionEnd: {
          x: 100,
          y: 100
        }
      });

      // then
      expect(connection.waypoints).to.eql([
        {
          x: 0,
          y: 0
        },
        {
          x: 100,
          y: 100
        }
      ]);
    }));

  });

});


// helpers /////////////////////


/**
 * The most simple of all layouters
 */
function NoopLayouter() {

  this.layoutConnection = function(connection, hints) {

    hints = hints || {};

    return [
      hints.connectionStart || connection.waypoints[0],
      hints.connectionEnd || connection.waypoints[connection.waypoints.length - 1]
    ];
  };

}