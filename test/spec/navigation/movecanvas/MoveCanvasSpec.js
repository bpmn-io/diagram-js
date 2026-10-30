import { expect } from 'chai';

import {
  bootstrapDiagram,
  getDiagramJS,
  inject
} from 'test/TestHelper';

import {
  assign
} from 'min-dash';

import moveCanvasModule from 'lib/navigation/movecanvas';
import interactionEventsModule from 'lib/features/interaction-events';


describe('navigation/movecanvas', function() {

  describe('bootstrap', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        moveCanvasModule
      ]
    }));


    it('should bootstrap', inject(function(moveCanvas, canvas) {

      canvas.addShape({
        id: 'test',
        width: 100,
        height: 100,
        x: 100,
        y: 100
      });

      expect(moveCanvas).not.to.be.null;
    }));

  });


  describe('activate on mouse', function() {

    var rootElement;

    beforeEach(bootstrapDiagram({
      modules: [
        moveCanvasModule
      ]
    }));

    beforeEach(inject(function(canvas) {
      rootElement = canvas.getRootElement();
    }));


    it('should start on PRIMARY mousedown', inject(function(eventBus, moveCanvas) {

      // when
      eventBus.fire(mouseDownEvent(rootElement));

      // then
      expect(moveCanvas.isActive()).to.be.true;
    }));


    it('should start on AUXILIARY mousedown', inject(function(eventBus, moveCanvas) {

      // when
      eventBus.fire(mouseDownEvent(rootElement, { button: 1 }));

      // then
      expect(moveCanvas.isActive()).to.be.true;
    }));


    it('should NOT start on mousedown with modifier key', inject(function(eventBus, moveCanvas) {

      // when
      eventBus.fire(mouseDownEvent(rootElement, { ctrlKey: true }));

      // then
      expect(moveCanvas.isActive()).to.be.false;
    }));


    it('should NOT start on mousedown on .djs-draggable', inject(function(eventBus, moveCanvas, canvas) {

      // given
      var svg = canvas.getContainer().querySelector('svg');

      var group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      group.classList.add('djs-draggable');

      var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

      group.appendChild(rect);

      svg.appendChild(group);

      // when
      eventBus.fire(mouseDownEvent(rootElement, { target: rect }));

      // then
      expect(moveCanvas.isActive()).to.be.false;
    }));

  });


  describe('behavior', function() {

    var rootElement;

    beforeEach(bootstrapDiagram({
      modules: [
        moveCanvasModule
      ]
    }));

    beforeEach(inject(function(canvas) {
      rootElement = canvas.getRootElement();
    }));


    it('should move', inject(function(eventBus, canvas, moveCanvas) {

      // given
      var viewbox = canvas.viewbox();

      eventBus.fire(mouseDownEvent(rootElement, { clientX: 0, clientY: 0 }));

      // when
      document.dispatchEvent(createMouseEvent(200, 100, 'mousemove'));
      document.dispatchEvent(createMouseEvent(200, 100, 'mouseup'));

      // then
      var updatedViewbox = canvas.viewbox();

      expect(moveCanvas.isActive()).to.be.false;

      expect(viewbox.x - updatedViewbox.x).to.eql(200);
      expect(viewbox.y - updatedViewbox.y).to.eql(100);
    }));


    it('should cancel on diagram destroy', inject(function(eventBus, moveCanvas) {

      // given
      var diagram = getDiagramJS();

      eventBus.fire(mouseDownEvent(rootElement, { clientX: 0, clientY: 0 }));

      document.dispatchEvent(createMouseEvent(200, 100, 'mousemove'));

      // assume
      expect(moveCanvas.isActive()).to.be.true;

      // when
      diagram.destroy();

      // then
      expect(moveCanvas.isActive()).to.be.false;

      // no error on subsequent interaction with destroyed canvas
      expect(function() {
        document.dispatchEvent(createMouseEvent(300, 200, 'mousemove'));
        document.dispatchEvent(createMouseEvent(300, 200, 'mouseup'));
      }).not.to.throw();
    }));

  });


  describe('toggle', function() {

    var rootElement;

    beforeEach(bootstrapDiagram({
      modules: [ moveCanvasModule ],
      canvas: {
        deferUpdate: false
      }
    }));

    beforeEach(inject(function(canvas) {
      rootElement = canvas.getRootElement();
    }));


    it('should disable movement', inject(function(eventBus, canvas, moveCanvas) {

      // given
      var viewbox = canvas.viewbox();

      // when
      expect(moveCanvas.toggle(false)).to.be.false;
      eventBus.fire(mouseDownEvent(rootElement, { clientX: 0, clientY: 0 }));
      document.dispatchEvent(createMouseEvent(200, 100, 'mousemove'));
      document.dispatchEvent(createMouseEvent(200, 100, 'mouseup'));

      // then
      expect(moveCanvas.isActive()).to.be.false;
      expect(canvas.viewbox()).to.eql(viewbox);
    }));


    it('should enable movement again', inject(function(eventBus, canvas, moveCanvas) {

      // given
      var viewbox = canvas.viewbox();
      moveCanvas.toggle(false);

      // when
      expect(moveCanvas.toggle(true)).to.be.true;
      eventBus.fire(mouseDownEvent(rootElement, { clientX: 0, clientY: 0 }));
      document.dispatchEvent(createMouseEvent(200, 100, 'mousemove'));
      document.dispatchEvent(createMouseEvent(200, 100, 'mouseup'));

      // then
      expect(viewbox.x - canvas.viewbox().x).to.eql(200);
      expect(viewbox.y - canvas.viewbox().y).to.eql(100);
    }));


    it('should toggle movement without an argument', inject(function(eventBus, moveCanvas) {

      // when
      expect(moveCanvas.toggle()).to.be.false;
      eventBus.fire(mouseDownEvent(rootElement));

      // then
      expect(moveCanvas.isActive()).to.be.false;

      // when
      expect(moveCanvas.toggle()).to.be.true;
      eventBus.fire(mouseDownEvent(rootElement));

      // then
      expect(moveCanvas.isActive()).to.be.true;
    }));


    it('should allow enabling repeatedly', inject(function(eventBus, canvas, moveCanvas) {

      // given
      var viewbox = canvas.viewbox();
      moveCanvas.toggle(true);
      moveCanvas.toggle(true);

      // when
      eventBus.fire(mouseDownEvent(rootElement, { clientX: 0, clientY: 0 }));
      document.dispatchEvent(createMouseEvent(200, 100, 'mousemove'));
      document.dispatchEvent(createMouseEvent(200, 100, 'mouseup'));

      // then
      expect(viewbox.x - canvas.viewbox().x).to.eql(200);
      expect(viewbox.y - canvas.viewbox().y).to.eql(100);
    }));


    [ false, true ].forEach(function(dragging) {
      it('should cancel the current interaction when disabling (dragging: ' + dragging + ')',
        inject(function(eventBus, canvas, moveCanvas) {

          // given
          eventBus.fire(mouseDownEvent(rootElement, { clientX: 0, clientY: 0 }));

          if (dragging) {
            document.dispatchEvent(createMouseEvent(200, 100, 'mousemove'));
            expect(document.body.classList.contains('djs-cursor-grab')).to.be.true;
          }

          var viewbox = canvas.viewbox();

          // when
          moveCanvas.toggle(false);
          document.dispatchEvent(createMouseEvent(300, 200, 'mousemove'));
          document.dispatchEvent(createMouseEvent(300, 200, 'mouseup'));

          // then
          expect(moveCanvas.isActive()).to.be.false;
          expect(document.body.classList.contains('djs-cursor-grab')).to.be.false;
          expect(canvas.viewbox()).to.eql(viewbox);
        })
      );
    });


    [ 'canvas.viewbox.changing', 'canvas.viewbox.changed' ].forEach(function(eventName) {
      it('should allow disabling from ' + eventName, inject(function(eventBus, canvas, moveCanvas) {

        // given
        var moveEvent = createMouseEvent(200, 100, 'mousemove');

        eventBus.on(eventName, function() {
          moveCanvas.toggle(false);
        });

        eventBus.fire(mouseDownEvent(rootElement, { clientX: 0, clientY: 0 }));

        // when
        document.dispatchEvent(moveEvent);

        // then
        expect(moveEvent.defaultPrevented).to.be.true;
        expect(moveCanvas.isActive()).to.be.false;
        expect(document.body.classList.contains('djs-cursor-grab')).to.be.false;

        var viewbox = canvas.viewbox();

        // when
        document.dispatchEvent(createMouseEvent(300, 200, 'mousemove'));
        document.dispatchEvent(createMouseEvent(300, 200, 'mouseup'));

        // then
        expect(canvas.viewbox()).to.eql(viewbox);
      }));
    });


    it('should stay disabled across canvas focus changes', inject(function(eventBus, moveCanvas) {

      // given
      moveCanvas.toggle(false);

      // when
      eventBus.fire('canvas.focus.changed', { focused: false });
      eventBus.fire('canvas.focus.changed', { focused: true });
      eventBus.fire(mouseDownEvent(rootElement));

      // then
      expect(moveCanvas.isActive()).to.be.false;
    }));
  });


  describe('integration', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        moveCanvasModule,
        interactionEventsModule
      ]
    }));


    it('should silence click', inject(function(eventBus, moveCanvas, canvas) {

      canvas.addShape({
        id: 'test',
        width: 100,
        height: 100,
        x: 100,
        y: 100
      });

      // click should not be triggered on
      // canvas drag
      eventBus.on('element.click', function(e) {
        console.error('click', e);
      });
    }));

  });


  describe('integration - canvas focus', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        moveCanvasModule,
        interactionEventsModule
      ]
    }));

    beforeEach(inject(function(canvas) {

      canvas.addShape({
        id: 'test',
        width: 100,
        height: 100,
        x: 100,
        y: 100
      });
    }));


    it('should not activate if canvas focus is prevented', inject(
      function(eventBus, canvas, moveCanvas) {

        // given
        var rootElement = canvas.getRootElement();

        // forcefully disable <mousedown> action
        eventBus.on('element.mousedown', 1500, event => {
          return false;
        });

        eventBus.fire(mouseDownEvent(rootElement, { clientX: 0, clientY: 0 }));

        // when
        document.dispatchEvent(createMouseEvent(200, 100, 'mousemove'));

        // then
        expect(moveCanvas.isActive()).to.be.false;
      }
    ));


    it('should activate, implicitly focussing canvas', inject(
      function(eventBus, canvas, moveCanvas) {

        // given
        var rootElement = canvas.getRootElement();

        // when
        eventBus.fire(mouseDownEvent(rootElement, { clientX: 0, clientY: 0 }));

        // and
        document.dispatchEvent(createMouseEvent(200, 100, 'mousemove'));

        // then
        expect(moveCanvas.isActive()).to.be.true;
      }
    ));


    it('should respect prevented focus after re-enabling', inject(function(eventBus, canvas, moveCanvas) {

      // given
      moveCanvas.toggle(false);
      moveCanvas.toggle(true);
      eventBus.on('element.mousedown', 1500, function() {
        return false;
      });

      // when
      eventBus.fire(mouseDownEvent(canvas.getRootElement()));

      // then
      expect(moveCanvas.isActive()).to.be.false;
    }));

  });

});


// helpers ////////////////

function mouseDownEvent(element, data) {

  return getDiagramJS().invoke(function(eventBus, elementRegistry) {
    return eventBus.createEvent({
      type: 'element.mousedown',
      element: element,
      originalEvent: assign({
        button: 0,
        target: elementRegistry.getGraphics(element)
      }, data || {})
    });
  });
}


function createMouseEvent(x, y, type) {
  var event = document.createEvent('MouseEvent');

  var screenX = x,
      screenY = y,
      clientX = x,
      clientY = y;

  if (event.initMouseEvent) {
    event.initMouseEvent(
      type,
      true,
      true,
      window,
      0,
      screenX,
      screenY,
      clientX,
      clientY,
      false,
      false,
      false,
      false,
      0,
      null
    );
  }

  return event;
}
