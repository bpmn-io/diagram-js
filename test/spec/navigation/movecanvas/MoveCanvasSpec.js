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