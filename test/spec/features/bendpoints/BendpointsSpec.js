'use strict';

require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var modelingModule = require('../../../../lib/features/modeling'),
    bendpointsModule = require('../../../../lib/features/bendpoints'),
    rulesModule = require('./rules'),
    interactionModule = require('../../../../lib/features/interaction-events'),
    canvasEvent = require('../../../util/MockEvents').createCanvasEvent;

describe('features/bendpoints', function() {

  beforeEach(bootstrapDiagram({ modules: [ modelingModule, bendpointsModule, interactionModule, rulesModule ] }));

  beforeEach(inject(function(dragging) {
    dragging.setOptions({ manual: true });
  }));


  var rootShape, shape1, shape2, shape3, connection, connection2;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    shape1 = elementFactory.createShape({
      id: 'shape1',
      type: 'A',
      x: 100, y: 100, width: 300, height: 300
    });

    canvas.addShape(shape1, rootShape);

    shape2 = elementFactory.createShape({
      id: 'shape2',
      type: 'A',
      x: 500, y: 100, width: 100, height: 100
    });

    canvas.addShape(shape2, rootShape);

    shape3 = elementFactory.createShape({
      id: 'shape3',
      type: 'B',
      x: 500, y: 400, width: 100, height: 100
    });

    canvas.addShape(shape3, rootShape);

    connection = elementFactory.createConnection({
      id: 'connection',
      waypoints: [ { x: 250, y: 250 }, { x: 550, y: 250 }, { x: 550, y: 150 } ],
      source: shape1,
      target: shape2
    });

    canvas.addConnection(connection, rootShape);

    connection2 = elementFactory.createConnection({
      id: 'connection2',
      waypoints: [ { x: 250, y: 250 }, { x: 550, y: 450 } ],
      source: shape1,
      target: shape2
    });

    canvas.addConnection(connection2, rootShape);
  }));


  describe('activation', function() {

    it('should show on hover', inject(function(eventBus, canvas, elementRegistry) {

      // given
      var layer = canvas.getLayer('overlays');

      // when
      eventBus.fire('element.hover', { element: connection, gfx: elementRegistry.getGraphics(connection) });


      // then
      // 3 visible + 1 invisible bendpoint are shown
      expect(layer.node.querySelectorAll('.djs-bendpoint').length).to.equal(4);
      expect(layer.node.querySelectorAll('.djs-segment-dragger').length).to.equal(2);
    }));


    it('should show on select', inject(function(selection, canvas, elementRegistry) {

      // given
      var layer = canvas.getLayer('overlays');

      // when
      selection.select(connection);

      // then
      // 3 visible + 1 invisible bendpoint are shown
      expect(layer.node.querySelectorAll('.djs-bendpoint').length).to.equal(4);
      expect(layer.node.querySelectorAll('.djs-segment-dragger').length).to.equal(2);
    }));


    it('should activate bendpoint move', inject(function(dragging, eventBus, elementRegistry, bendpoints) {

      // when
      eventBus.fire('element.hover', { element: connection, gfx: elementRegistry.getGraphics(connection) });
      eventBus.fire('element.mousemove', {
        element: connection,
        originalEvent: canvasEvent({ x: 500, y: 250 })
      });
      eventBus.fire('element.mousedown', {
        element: connection,
        originalEvent: canvasEvent({ x: 500, y: 250 })
      });

      var draggingContext = dragging.context();

      // then
      expect(draggingContext).to.exist;
      expect(draggingContext.prefix).to.eql('bendpoint.move');
    }));


    it('should activate parallel move', inject(function(dragging, eventBus, elementRegistry, bendpoints) {

      // precondition
      var intersectionStart = connection.waypoints[0].x,
          intersectionEnd = connection.waypoints[1].x,
          intersectionMid = intersectionEnd - (intersectionEnd - intersectionStart) / 2;

      // when
      eventBus.fire('element.hover', { element: connection, gfx: elementRegistry.getGraphics(connection) });
      eventBus.fire('element.mousemove', {
        element: connection,
        originalEvent: canvasEvent({ x: intersectionMid, y: 250 })
      });
      eventBus.fire('element.mousedown', {
        element: connection,
        originalEvent: canvasEvent({ x: intersectionMid, y: 250 })
      });

      var draggingContext = dragging.context();

      // then
      expect(draggingContext).to.exist;
      expect(draggingContext.prefix).to.eql('connectionSegment.move');
    }));

    it('should emit element.click on connection when clicking bendpoint', inject(function(eventBus, bendpoints){

      // create bendpoints
      bendpoints.addHandles(connection);

      // get one
      var bps = bendpoints.getBendpointsContainer(connection);
      var bp = bps.select('.djs-bendpoint');

      // given
      var clickSpy = sinon.spy(function(event) {
        expect(event.originalEvent.target.innerHtml).to.eql(bp.node.innerHtml);
        expect(event.element).to.eql(connection);
      });

      eventBus.once('element.click', clickSpy);

      // when
      bp.node.dispatchEvent(new MouseEvent('click', {
        'view': window,
        'bubbles': true,
        'cancelable': true
      }));

      // then
      expect(clickSpy).to.have.been.called;
    }));

  });

});
