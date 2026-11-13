import { expect } from 'chai';
import { spy } from 'sinon';

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

    beforeEach(bootstrapDiagram({
      modules: [
        moveCanvasModule
      ]
    }));


    it('should start on PRIMARY mousedown', inject(function(moveCanvas) {

      // when
      mouseDown();

      // then
      expect(moveCanvas.isActive()).to.be.true;
    }));


    it('should start on AUXILIARY mousedown', inject(function(moveCanvas) {

      // when
      mouseDown({ button: 1 });

      // then
      expect(moveCanvas.isActive()).to.be.true;
    }));


    it('should NOT start on mousedown with modifier key', inject(function(moveCanvas) {

      // when
      mouseDown({ ctrlKey: true });

      // then
      expect(moveCanvas.isActive()).to.be.false;
    }));


    it('should NOT start on mousedown on .djs-draggable', inject(function(moveCanvas, canvas) {

      // given
      var svg = canvas.getContainer().querySelector('svg');

      var group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      group.classList.add('djs-draggable');

      var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

      group.appendChild(rect);

      svg.appendChild(group);

      // when
      mouseDown({ target: rect });

      // then
      expect(moveCanvas.isActive()).to.be.false;
    }));

  });


  describe('behavior', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        moveCanvasModule
      ]
    }));


    it('should move', inject(function(canvas, moveCanvas) {

      // given
      var viewbox = canvas.viewbox();

      // when
      drag({ x: 200, y: 100 });

      // then
      var updatedViewbox = canvas.viewbox();

      expect(moveCanvas.isActive()).to.be.false;

      expect(viewbox.x - updatedViewbox.x).to.eql(200);
      expect(viewbox.y - updatedViewbox.y).to.eql(100);
    }));


    it('should cancel on diagram destroy', inject(function(moveCanvas) {

      // given
      var diagram = getDiagramJS();

      mouseDown();
      mouseMove({ x: 200, y: 100 });

      // assume
      expect(moveCanvas.isActive()).to.be.true;

      // when
      diagram.destroy();

      // then
      expect(moveCanvas.isActive()).to.be.false;

      // no error on subsequent interaction with destroyed canvas
      expect(function() {
        mouseMove({ x: 300, y: 200 });
        mouseUp({ x: 300, y: 200 });
      }).not.to.throw();
    }));

  });


  describe('configuration', function() {

    beforeEach(bootstrapDiagram({
      modules: [ moveCanvasModule ],
      moveCanvas: {
        enabled: false
      }
    }));


    it('should not move when disabled by configuration', inject(function(canvas, moveCanvas) {

      // given
      var viewbox = canvas.viewbox();

      // when
      drag({ x: 200, y: 100 });

      // then
      expect(moveCanvas.isActive()).to.be.false;
      expect(canvas.viewbox()).to.eql(viewbox);
    }));


    it('should allow enabling after being disabled by configuration', inject(function(canvas, moveCanvas) {

      // given
      var viewbox = canvas.viewbox();

      // when
      moveCanvas.toggle(true);
      refocusCanvas();
      drag({ x: 200, y: 100 });

      // then
      expect(viewbox.x - canvas.viewbox().x).to.eql(200);
      expect(viewbox.y - canvas.viewbox().y).to.eql(100);
    }));

  });


  describe('toggle', function() {

    beforeEach(bootstrapDiagram({
      modules: [ moveCanvasModule ],
      canvas: {
        deferUpdate: false
      }
    }));


    it('should disable movement', inject(function(canvas, moveCanvas) {

      // given
      var viewbox = canvas.viewbox();

      // when
      expect(moveCanvas.toggle(false)).to.be.false;
      drag({ x: 200, y: 100 });

      // then
      expect(moveCanvas.isActive()).to.be.false;
      expect(canvas.viewbox()).to.eql(viewbox);
    }));


    it('should enable movement again, including repeated calls', inject(function(canvas, moveCanvas) {

      // given
      var viewbox = canvas.viewbox();
      moveCanvas.toggle(false);

      // when
      expect(moveCanvas.toggle(true)).to.be.true;
      expect(moveCanvas.toggle(true)).to.be.true;
      drag({ x: 200, y: 100 });

      // then
      expect(viewbox.x - canvas.viewbox().x).to.eql(200);
      expect(viewbox.y - canvas.viewbox().y).to.eql(100);
    }));


    it('should toggle movement without an argument', inject(function(moveCanvas) {

      // when
      expect(moveCanvas.toggle()).to.be.false;
      mouseDown();

      // then
      expect(moveCanvas.isActive()).to.be.false;

      // when
      expect(moveCanvas.toggle()).to.be.true;
      mouseDown();

      // then
      expect(moveCanvas.isActive()).to.be.true;
    }));


    [ false, true ].forEach(function(dragging) {
      it('should cancel the current interaction when disabling (dragging: ' + dragging + ')',
        inject(function(canvas, moveCanvas) {

          // given
          mouseDown();

          if (dragging) {
            mouseMove({ x: 200, y: 100 });
            expect(document.body.classList.contains('djs-cursor-grab')).to.be.true;
          }

          var viewbox = canvas.viewbox();

          // when
          moveCanvas.toggle(false);
          mouseMove({ x: 300, y: 200 });
          mouseUp({ x: 300, y: 200 });

          // then
          expect(moveCanvas.isActive()).to.be.false;
          expect(document.body.classList.contains('djs-cursor-grab')).to.be.false;
          expect(canvas.viewbox()).to.eql(viewbox);
        })
      );
    });


    it('should not silence clicks after cancellation', inject(function(eventBus, moveCanvas) {

      // given
      var clickSpy = spy();
      eventBus.on('element.click', clickSpy);

      mouseDown();
      mouseMove({ x: 200, y: 100 });

      // when
      moveCanvas.toggle(false);
      eventBus.fire('element.click');

      // then
      expect(clickSpy).to.have.been.calledOnce;
    }));


    [ 'canvas.viewbox.changing', 'canvas.viewbox.changed' ].forEach(function(eventName) {
      it('should allow disabling from ' + eventName, inject(function(eventBus, canvas, moveCanvas) {

        // given
        eventBus.on(eventName, function() {
          moveCanvas.toggle(false);
        });

        mouseDown();

        // when
        var moveEvent = mouseMove({ x: 200, y: 100 });

        // then
        expect(moveEvent.defaultPrevented).to.be.true;
        expect(moveCanvas.isActive()).to.be.false;
        expect(document.body.classList.contains('djs-cursor-grab')).to.be.false;

        var viewbox = canvas.viewbox();

        // when
        mouseMove({ x: 300, y: 200 });
        mouseUp({ x: 300, y: 200 });

        // then
        expect(canvas.viewbox()).to.eql(viewbox);
      }));
    });


    it('should stay disabled across canvas focus changes', inject(function(moveCanvas) {

      // given
      moveCanvas.toggle(false);

      // when
      refocusCanvas();
      mouseDown();

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


    it('should silence the click following a drag', inject(function(eventBus, canvas) {

      // given
      var rootElement = canvas.getRootElement(),
          clickSpy = spy();

      eventBus.on('element.click', clickSpy);

      drag({ x: 200, y: 100 });

      // when
      eventBus.fire('element.click', { element: rootElement });

      // then
      expect(clickSpy).not.to.have.been.called;

      // but when
      eventBus.fire('element.click', { element: rootElement });

      // then
      expect(clickSpy).to.have.been.calledOnce;
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
      function(eventBus, moveCanvas) {

        // given
        // forcefully disable <mousedown> action
        eventBus.on('element.mousedown', 1500, event => {
          return false;
        });

        mouseDown();

        // when
        mouseMove({ x: 200, y: 100 });

        // then
        expect(moveCanvas.isActive()).to.be.false;
      }
    ));


    it('should activate, implicitly focussing canvas', inject(
      function(moveCanvas) {

        // when
        mouseDown();

        // and
        mouseMove({ x: 200, y: 100 });

        // then
        expect(moveCanvas.isActive()).to.be.true;
      }
    ));


    it('should respect prevented focus after re-enabling', inject(function(eventBus, moveCanvas) {

      // given
      moveCanvas.toggle(false);
      moveCanvas.toggle(true);
      eventBus.on('element.mousedown', 1500, function() {
        return false;
      });

      // when
      mouseDown();

      // then
      expect(moveCanvas.isActive()).to.be.false;
    }));

  });

});


// helpers ////////////////

// Exercise focus changes to ensure they do not reset the toggled state.
function refocusCanvas() {
  getDiagramJS().invoke(function(eventBus) {
    eventBus.fire('canvas.focus.changed', { focused: false });
    eventBus.fire('canvas.focus.changed', { focused: true });
  });
}


function mouseDown(data) {

  return getDiagramJS().invoke(function(eventBus, canvas, elementRegistry) {
    var element = canvas.getRootElement();

    return eventBus.fire('element.mousedown', {
      element: element,
      originalEvent: assign({
        button: 0,
        clientX: 0,
        clientY: 0,
        target: elementRegistry.getGraphics(element)
      }, data)
    });
  });
}


function mouseMove(position) {
  return dispatchMouseEvent('mousemove', position);
}


function mouseUp(position) {
  return dispatchMouseEvent('mouseup', position);
}


function dispatchMouseEvent(type, position) {
  var event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: position.x,
    clientY: position.y
  });

  document.dispatchEvent(event);

  return event;
}


function drag(position) {
  mouseDown();
  mouseMove(position);
  mouseUp(position);
}
