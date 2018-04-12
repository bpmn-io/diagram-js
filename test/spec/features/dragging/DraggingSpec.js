import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import { createCanvasEvent as canvasEvent } from '../../../util/MockEvents';

import { assign } from 'min-dash';

import dragModule from 'lib/features/dragging';
import zoomScrollModule from 'lib/navigation/zoomscroll';
import createModule from 'lib/features/create';
import modelingModule from 'lib/features/modeling';

import { classes as svgClasses } from 'tiny-svg';


describe('features/dragging - Dragging', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      dragModule
    ]
  }));

  beforeEach(inject(function(canvas) {
    canvas.addShape({ id: 'shape', x: 10, y: 10, width: 50, height: 50 });
  }));


  describe('behavior', function() {

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    var recordEvents;

    beforeEach(inject(function(eventBus) {
      recordEvents = function(prefix) {
        var events = [];

        var eventTypes = [
          'start',
          'move',
          'end',
          'ended',
          'hover',
          'out',
          'cancel',
          'canceled',
          'cleanup',
          'init'
        ];

        eventTypes.forEach(function(type) {
          eventBus.on(prefix + '.' + type, function(e) {
            events.push(assign({}, e));
          });
        });

        return events;
      };
    }));


    function raw(e) {
      var omitted = assign({}, e);
      delete omitted.originalEvent;
      delete omitted.previousSelection;
      delete omitted.isTouch;
      return omitted;
    }


    it('should stop original event propagation on init', inject(function(dragging) {

      // given
      var event = canvasEvent({ x: 10, y: 10 });

      // when
      dragging.init(event, 'foo');

      // then
      expect(event.cancelBubble).to.be.true;
    }));


    it('should pass custom data', inject(function(dragging) {

      // given
      var events = recordEvents('foo');

      // when
      dragging.init(canvasEvent({ x: 10, y: 10 }), 'foo', {
        data: { foo: 'BAR' }
      });

      // then
      expect(events.length).to.equal(1);

      expect(events).to.eql([
        { foo: 'BAR', type: 'foo.init', isTouch: false }
      ]);
    }));


    describe('trapClick', function() {

      it('should prevent default action on drag end', inject(function(dragging) {

        // given
        dragging.setOptions({
          manual: false
        });

        dragging.init(canvasEvent({ x: 10, y: 10 }), 'foo', { trapClick: true });
        dragging.move(canvasEvent({ x: 30, y: 20 }));

        // when
        var realEvent = mouseDown(document, { x: 20, y: 20 });

        // then
        expect(realEvent.defaultPrevented).to.be.true;
      }));


      it('should NOT prevent default action if drag did not start', inject(function(dragging) {

        // given
        dragging.setOptions({
          manual: false
        });

        dragging.init(canvasEvent({ x: 10, y: 10 }), 'foo', { trapClick: true });

        // when
        var realEvent = mouseDown(document, { x: 10, y: 10 });

        // then
        expect(realEvent.defaultPrevented).to.be.false;
      }));


      // helpers //////////////////

      function mouseDown(element, canvasPosition) {

        var mockEvent = canvasEvent(canvasPosition);

        const event = document.createEvent('MouseEvent');

        if (event.initMouseEvent) {
          event.initMouseEvent(
            'mousedown', true, true, window, 0, 0, 0,
            mockEvent.x, mockEvent.y, false, false, false, false,
            0, null
          );
        }

        element.dispatchEvent(event);

        return event;
      }

    });


    it('should fire life-cycle on successful drag', inject(function(dragging, canvas) {

      // given
      var events = recordEvents('foo');

      // when
      dragging.init(canvasEvent({ x: 10, y: 10 }), 'foo');
      dragging.move(canvasEvent({ x: 30, y: 20 }));
      dragging.move(canvasEvent({ x: 5, y: 10 }));

      dragging.end();

      // then
      expect(events.map(raw)).to.eql([
        { type: 'foo.init' },
        { x: 10, y: 10, dx: 0, dy: 0, type: 'foo.start' },
        { x: 30, y: 20, dx: 20, dy: 10, type: 'foo.move' },
        { x: 5, y: 10, dx: -5, dy: 0, type: 'foo.move' },
        { x: 5, y: 10, dx: -5, dy: 0, type: 'foo.end' },
        { x: 5, y: 10, dx: -5, dy: 0, type: 'foo.cleanup' },
        { x: 5, y: 10, dx: -5, dy: 0, type: 'foo.ended' }
      ]);
    }));


    it('should fire life-cycle events', inject(function(dragging, canvas) {

      // given
      var events = recordEvents('foo');

      // when
      dragging.init(canvasEvent({ x: 10, y: 10 }), 'foo');
      dragging.move(canvasEvent({ x: 30, y: 20 }));
      dragging.move(canvasEvent({ x: 5, y: 10 }));

      dragging.cancel();

      // then
      expect(events.map(raw)).to.eql([
        { type: 'foo.init' },
        { x: 10, y: 10, dx: 0, dy: 0, type: 'foo.start' },
        { x: 30, y: 20, dx: 20, dy: 10, type: 'foo.move' },
        { x: 5, y: 10, dx: -5, dy: 0, type: 'foo.move' },
        { x: 5, y: 10, dx: -5, dy: 0, type: 'foo.cancel' },
        { x: 5, y: 10, dx: -5, dy: 0, type: 'foo.cleanup' },
        { x: 5, y: 10, dx: -5, dy: 0, type: 'foo.canceled' }
      ]);
    }));


    it('should cancel running', inject(function(dragging) {

      // given
      var events = recordEvents('foo');

      // a is active
      dragging.init(canvasEvent({ x: 10, y: 10 }), 'foo', { data: { element: 'a' } });

      // when
      // activate b
      dragging.init(canvasEvent({ x: 10, y: 10 }), 'foo', { data: { element: 'b' } });

      // then
      expect(events.map(raw)).to.eql([
        { element: 'a', type: 'foo.init' },
        { element: 'a', type: 'foo.cleanup' },
        { element: 'b', type: 'foo.init' }
      ]);

    }));


    describe('djs-drag-active marker', function() {

      it('should not add to root on drag start', inject(function(dragging, canvas, elementRegistry) {

        // given
        var rootElement = canvas.getRootElement(),
            rootGfx = elementRegistry.getGraphics(rootElement);

        // when
        dragging.init(canvasEvent({ x: 10, y: 10 }), 'foo');

        // then
        expect(svgClasses(rootGfx).has('djs-drag-active')).to.be.false;

        // but when
        dragging.move(canvasEvent({ x: 30, y: 20 }));

        // then
        expect(svgClasses(rootGfx).has('djs-drag-active')).to.be.true;
      }));


      it('should remove from root on drag end', inject(function(dragging, canvas, elementRegistry) {

        // given
        var rootElement = canvas.getRootElement(),
            rootGfx = elementRegistry.getGraphics(rootElement);

        // when
        dragging.init(canvasEvent({ x: 10, y: 10 }), 'foo');
        dragging.move(canvasEvent({ x: 30, y: 20 }));
        dragging.cancel();

        // then
        expect(svgClasses(rootGfx).has('djs-drag-active')).to.be.false;
      }));

    });


    it('should adjust positions to local point', inject(function(dragging) {

      // given
      var events = recordEvents('foo');

      // when
      dragging.init(canvasEvent({ x: 0, y: 0 }), { x: 10, y: 10 }, 'foo');
      dragging.move(canvasEvent({ x: 20, y: 10 }));
      dragging.move(canvasEvent({ x: -5, y: 0 }));

      dragging.cancel();

      // then
      expect(events.map(raw)).to.eql([
        { type: 'foo.init' },
        { x: 10, y: 10, dx: 0, dy: 0, type: 'foo.start' },
        { x: 30, y: 20, dx: 20, dy: 10, type: 'foo.move' },
        { x: 5, y: 10, dx: -5, dy: 0, type: 'foo.move' },
        { x: 5, y: 10, dx: -5, dy: 0, type: 'foo.cancel' },
        { x: 5, y: 10, dx: -5, dy: 0, type: 'foo.cleanup' },
        { x: 5, y: 10, dx: -5, dy: 0, type: 'foo.canceled' }
      ]);
    }));

  });

});


describe('features/dragging - Dragging - zoomScroll integration', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      createModule,
      dragModule,
      modelingModule,
      zoomScrollModule
    ]
  }));

  beforeEach(inject(function(dragging) {
    dragging.setOptions({ manual: true });
  }));


  it('should keep shape at cursor when zooming while creating', inject(
    function(elementFactory, zoomScroll, dragging, create) {

      // given
      var shape = elementFactory.createShape({
        id: 'shape',
        x: 0, y: 0,
        width: 50, height: 50
      });

      // when
      create.start(canvasEvent({ x: 0, y: 0 }), shape);
      dragging.move(canvasEvent({ x: 100, y: 100 }));

      var elementBefore = dragging.context().data.context.visual.getBBox();

      zoomScroll.stepZoom(-1.25);
      zoomScroll.stepZoom(0.25);

      dragging.move(canvasEvent({ x: 100, y: 100 }));

      var elementAfter = dragging.context().data.context.visual.getBBox();

      // then
      expect(elementBefore).to.eql(elementAfter);
    }
  ));

});