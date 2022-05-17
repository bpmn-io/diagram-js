import {
  bootstrapDiagram,
  getDiagramJS,
  inject
} from 'test/TestHelper';

import {
  createCanvasEvent as canvasEvent
} from '../../../util/MockEvents';

import {
  assign,
  pick
} from 'min-dash';

import modelingModule from 'lib/features/modeling';
import moveModule from 'lib/features/move';


describe('features/move - Move', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      moveModule,
      modelingModule
    ]
  }));

  beforeEach(inject(function(canvas, dragging) {
    dragging.setOptions({ manual: true });
  }));


  var rootShape, parentShape, childShape, childShape2, connection;

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


  describe('event centering', function() {

    it('should emit events relative to shape center', inject(function(eventBus, move, dragging) {

      // given
      function recordEvents(prefix) {
        var events = [];

        [ 'start', 'move', 'end', 'hover', 'out', 'cancel', 'cleanup', 'init' ].forEach(function(type) {
          eventBus.on(prefix + '.' + type, function(e) {
            events.push(assign({}, e));
          });
        });

        return events;
      }

      function position(e) {
        return pick(e, [ 'x', 'y', 'dx', 'dy' ]);
      }

      var events = recordEvents('shape.move');


      // when
      move.start(canvasEvent({ x: 0, y: 0 }), childShape);

      dragging.move(canvasEvent({ x: 20, y: 20 }));

      // then
      expect(events.map(position)).to.eql([
        { },
        { x: 160, y: 160, dx: 0, dy: 0 },
        { x: 180, y: 180, dx: 20, dy: 20 }
      ]);
    }));

  });


  describe('modeling', function() {

    it('should round movement to pixels', inject(function(move, dragging, elementRegistry) {

      // given
      move.start(canvasEvent({ x: 0, y: 0 }), childShape);

      // when
      dragging.move(canvasEvent({ x: 20, y: 20 }));
      dragging.hover({
        element: parentShape,
        gfx: elementRegistry.getGraphics(parentShape)
      });

      dragging.move(canvasEvent({ x: 30.4, y: 99.7 }));

      dragging.end();

      // then
      expect(childShape.x).to.eql(140);
      expect(childShape.y).to.eql(210);
    }));


    it('should accept context', inject(function(dragging, move) {

      // given
      var context = {
        foo: 'foo'
      };

      // when
      move.start(canvasEvent({ x: 0, y: 0 }), childShape, context);

      // then
      expect(dragging.context().data.context).to.include(context);
    }));


    it('should NOT move if no delta', inject(
      function(dragging, elementRegistry, modeling, move) {

        // given
        var moveElementsSpy = sinon.spy(modeling, 'moveElements');

        move.start(canvasEvent({ x: 0, y: 0 }), childShape);

        // when
        dragging.move(canvasEvent({ x: 20, y: 20 }));

        dragging.hover({
          element: parentShape,
          gfx: elementRegistry.getGraphics(parentShape)
        });

        dragging.move(canvasEvent({ x: 0, y: 0 }));

        dragging.end();

        // then
        expect(moveElementsSpy).not.to.have.been.called;

        expect(childShape.x).to.eql(110);
        expect(childShape.y).to.eql(110);
      }
    ));


    it('should NOT start if triggered on `no-move` hit', inject(function(dragging, move) {

      // given
      var target = document.createElement('svg'),
          event = canvasEvent({ x: 0, y: 0 }, { target: target });

      target.classList.add('djs-hit-no-move');

      // when
      move.start(event, childShape);

      // then
      expect(dragging.context()).not.to.exist;
    }));
  });


  describe('activate on mouse', function() {

    it('should start on PRIMARY mousedown', inject(function(dragging, eventBus) {

      // when
      eventBus.fire(mouseDownEvent(parentShape));

      // then
      var context = dragging.context();

      expect(context && context.prefix).to.match(/^shape.move/);
    }));


    it('should NOT start on AUXILIARY mousedown', inject(function(dragging, eventBus) {

      // when
      eventBus.fire(mouseDownEvent(parentShape, { button: 1 }));

      // then
      expect(dragging.context()).not.to.exist;
    }));

  });

});


// helpers ////////////////

function mouseDownEvent(element, data) {

  data = data || { target: document.createElement('svg') };

  return getDiagramJS().invoke(function(eventBus) {
    return eventBus.createEvent({
      type: 'element.mousedown',
      element: element,
      originalEvent: assign({ button: 0 }, data || {})
    });
  });
}