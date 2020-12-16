import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import interactionEventsModule from 'lib/features/interaction-events';

import {
  queryAll as domQueryAll
} from 'min-dom';

import {
  filter
} from 'min-dash';


var bindings = {
  mouseover: 'element.hover',
  mouseout: 'element.out',
  click: 'element.click',
  dblclick: 'element.dblclick',
  mousedown: 'element.mousedown',
  mouseup: 'element.mouseup',
  contextmenu: 'element.contextmenu'
};

var auxiliaryBindings = {
  click: 'element.click',
  dblclick: 'element.dblclick',
  mousedown: 'element.mousedown',
  mouseup: 'element.mouseup'
};


describe('features/interaction-events', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      interactionEventsModule
    ]
  }));


  var rootShape,
      parentShape,
      childShape,
      childShape2,
      connection;

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


  describe('bootstrap', function() {

    it('should bootstrap diagram with component', inject(function() {}));

  });


  describe('event handling', function() {

    function verifyEvent(type, button) {

      var description =
        type +
        (button ? ' with button=' + button : '');

      it(description, inject(function(eventBus, elementRegistry) {

        // given
        var parentGfx = elementRegistry.getGraphics(parentShape);

        var listenerFn = sinon.spy(function(e) {
          expect(e.element).to.eql(parentShape);
          expect(e.gfx).to.eql(parentGfx);

          expect(e.type).to.eql(bindings[type]);
        });

        // given
        eventBus.on(bindings[type], listenerFn);

        // when
        triggerMouseEvent(parentGfx, type, button);

        // then
        expect(listenerFn).to.have.been.calledOnce;

        expect(listenerFn).not.to.have.thrown();
      }));
    }

    function verifyNoEvent(type, button) {

      var description =
        'should suppress ' + type +
        (button ? ' with button=' + button : '');

      it(description, inject(function(eventBus, elementRegistry) {

        // given
        var rootGfx = elementRegistry.getGraphics(rootShape);

        var listenerFn = sinon.spy();

        // given
        eventBus.on(bindings[type], listenerFn);

        // when
        triggerMouseEvent(rootGfx, type, button);

        // then
        expect(listenerFn).not.to.have.been.called;
      }));
    }

    describe('should handle', function() {

      // left-clicks
      Object.keys(bindings).forEach(function(event) {
        verifyEvent(event);
      });

      // auxiliary-clicks
      Object.keys(auxiliaryBindings).forEach(function(event) {
        verifyEvent(event, 1);
      });

      // <contextmenu> right-click
      verifyEvent('contextmenu', 2);

    });


    describe('should suppress', function() {

      // right-clicks
      Object.keys(auxiliaryBindings).forEach(function(event) {
        verifyNoEvent(event, 2);
      });

      // may be registered temporarily
      [
        'mousemove'
      ].forEach(function(event) {
        verifyNoEvent(event);
      });

    });

  });


  describe('register / unregister', function() {

    it('should register', inject(
      function(interactionEvents, eventBus, canvas) {

        // given
        var listenerFn = sinon.spy();

        var node = canvas._svg;

        eventBus.on('element.mousemove', listenerFn);

        // when
        interactionEvents.registerEvent(
          node, 'mousemove', 'element.mousemove'
        );

        triggerMouseEvent(node, 'mousemove');

        // then
        expect(listenerFn).to.have.been.called;
      }
    ));


    it('should unregister', inject(function(interactionEvents, eventBus) {

      // given
      var listenerFn = sinon.spy();

      var node = document.body;

      eventBus.on('element.mousemove', listenerFn);

      // when
      interactionEvents.registerEvent(
        node, 'mousemove', 'element.mousemove'
      );

      interactionEvents.unregisterEvent(
        node, 'mousemove', 'element.mousemove'
      );

      triggerMouseEvent(node, 'mousemove');

      // then
      expect(listenerFn).not.to.have.been.called;
    }));


    it('should not throw not de-registration', inject(
      function(interactionEvents) {

        var node = document.body;

        expect(function() {
          interactionEvents.unregisterEvent(
            node, 'mousemove', 'element.mousemove'
          );
        }).not.to.throw;
      }
    ));

  });


  describe('custom hit', function() {

    it('should allow to create custom hit element', inject(function(elementFactory, canvas, eventBus) {

      // given
      var spy = sinon.spy(),
          shape = elementFactory.createShape({
            id: 'shape',
            x: 0, y: 0, width: 100, height: 100
          });

      eventBus.on('interactionEvents.createHit', spy);

      // when
      canvas.addShape(shape, rootShape);

      // then
      expect(spy).to.have.been.calledOnce;
    }));


    it('should allow to update custom element', inject(function(elementFactory, canvas, eventBus) {

      // given
      var spy = sinon.spy();

      eventBus.on('interactionEvents.updateHit', spy);

      // when
      eventBus.fire('shape.changed', { element: childShape });

      // then
      expect(spy).to.have.been.calledOnce;
    }));

  });


  describe('api', function() {

    function getHits(gfx) {

      // TODO(nikku): remove filter when we drop PhantomJS
      return filter(domQueryAll('.djs-hit', gfx), function(hit) { return typeof hit !== 'number'; });
    }


    it('should #removeHits', inject(
      function(elementRegistry, interactionEvents) {

        // given
        var shape = childShape;
        var shapeGfx = elementRegistry.getGraphics(shape);

        // when
        interactionEvents.removeHits(shapeGfx);

        // then
        expect(getHits(shapeGfx)).to.be.empty;
      })
    );


    it('should #createDefaultHit', inject(
      function(elementRegistry, interactionEvents) {

        // given
        var shape = childShape;
        var shapeGfx = elementRegistry.getGraphics(shape);

        var connectionGfx = elementRegistry.getGraphics(connection);

        interactionEvents.removeHits(connectionGfx);
        interactionEvents.removeHits(shapeGfx);

        // when
        interactionEvents.createDefaultHit(shape, shapeGfx);
        interactionEvents.createDefaultHit(connection, connectionGfx);

        // then
        expect(getHits(shapeGfx)).to.have.length(1);
        expect(getHits(connectionGfx)).to.have.length(1);
      })
    );


    it('should #createBoxHit', inject(
      function(elementRegistry, interactionEvents) {

        // given
        var shape = childShape;
        var shapeGfx = elementRegistry.getGraphics(shape);

        interactionEvents.removeHits(shapeGfx);

        // when
        interactionEvents.createBoxHit(shapeGfx, 'click-stroke', { width: 10, height: 10 });
        interactionEvents.createBoxHit(shapeGfx, 'all', { x: 20, y: 30, width: 40, height: 40 });

        // then
        expect(getHits(shapeGfx)).to.have.length(2);
      })
    );

  });

});


// helpers //////////////////////

function triggerMouseEvent(gfx, type, button) {
  var event = mouseEvent(type, button);

  return gfx.dispatchEvent(event);
}

function mouseEvent(type, button) {

  if (!button) {
    button = 0;
  }

  var event = document.createEvent('MouseEvent');

  event.initMouseEvent(
    type, true, true, window,
    0, 0, 0, 80, 20,
    false, false, false, false,
    button, null
  );

  return event;
}