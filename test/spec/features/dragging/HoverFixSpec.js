/* global sinon */

import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import { assign } from 'min-dash';

import { createCanvasEvent as canvasEvent } from '../../../util/MockEvents';

import dragModule from 'lib/features/dragging';


describe('features/dragging - HoverFix', function() {

  beforeEach(bootstrapDiagram({ modules: [ dragModule ] }));

  var shape1,
      shape2;

  beforeEach(inject(function(canvas, elementFactory) {

    shape1 = elementFactory.createShape({
      id: 'shape1',
      x: 10,
      y: 10,
      width: 50,
      height: 50
    });

    canvas.addShape(shape1);

    shape2 = elementFactory.createShape({
      id: 'shape2',
      x: 100,
      y: 10,
      width: 50,
      height: 50
    });

    canvas.addShape(shape2);

  }));


  describe('hover fix', function() {

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    it('should ensure hover', inject(function(dragging, hoverFix) {

      // given
      var fixed = false;

      hoverFix.ensureHover = function(event) {
        fixed = true;
      };

      // when
      dragging.init(canvasEvent({ x: 10, y: 10 }), 'foo');
      dragging.move(canvasEvent({ x: 30, y: 20 }));

      // then
      expect(fixed).to.be.true;
    }));

  });


  describe('out fix', function() {

    it('should ensure out', inject(function(dragging, canvas, eventBus) {

      // given
      var listener = sinon.spy(function(event) {
        expect(event.hover).to.eql(shape1);
        expect(event.hoverGfx).to.eql(canvas.getGraphics(shape1));
      });

      eventBus.on('drag.out', listener);

      // when
      dragging.init(canvasEvent({ x: 10, y: 10 }), 'foo');
      eventBus.fire('element.hover', { element: shape1, gfx: canvas.getGraphics(shape1) });

      // (no out)
      eventBus.fire('element.hover', { element: shape2, gfx: canvas.getGraphics(shape2) });

      // then
      expect(listener).to.have.been.calledOnce;
    }));


    it('should keep event order', inject(function(dragging, canvas, eventBus) {

      // given
      var eventNames = [
            'drag.hover',
            'drag.out'
          ],
          events = recordEvents(eventNames, eventBus);

      // when
      dragging.init(canvasEvent({ x: 10, y: 10 }), 'foo');
      eventBus.fire('element.hover', { element: shape1, gfx: canvas.getGraphics(shape1) });

      // (no out)
      eventBus.fire('element.hover', { element: shape2, gfx: canvas.getGraphics(shape2) });

      // then
      expect(events).to.eql([
        { type: 'drag.hover', hover: shape1 },
        { type: 'drag.out', hover: shape1 },
        { type: 'drag.hover', hover: shape2 }
      ]);
    }));


    it('should prevent additional out', inject(function(dragging, canvas, eventBus) {

      // given
      var listener = sinon.spy(function(event) {
        expect(event.hover).to.eql(shape1);
        expect(event.hoverGfx).to.eql(canvas.getGraphics(shape1));
      });

      eventBus.on('drag.out', listener);

      // when
      dragging.init(canvasEvent({ x: 10, y: 10 }), 'foo');
      eventBus.fire('element.hover', { element: shape1, gfx: canvas.getGraphics(shape1) });
      eventBus.fire('element.out', { element: shape1, gfx: canvas.getGraphics(shape1) });
      eventBus.fire('element.hover', { element: shape2, gfx: canvas.getGraphics(shape2) });

      // then
      expect(listener).to.have.been.calledOnce;
    }));

  });

});

// helpers /////////////////////

function recordEvents(eventNames, eventBus) {

  var events = [];

  eventNames.forEach(function(eventName) {
    eventBus.on(eventName, function(e) {
      events.push(assign({}, {
        type: e.type,
        hover: e.hover
      }));
    });
  });

  return events;
}
