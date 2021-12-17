import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import {
  createCanvasEvent as canvasEvent
} from '../../../util/MockEvents';

import {
  classes as domClasses,
  domify,
  query as domQuery
} from 'min-dom';

import $ from 'jquery';

import overlayModule from 'lib/features/overlays';
import selectionModule from 'lib/features/selection';
import modelingModule from 'lib/features/modeling';
import resizeModule from 'lib/features/resize';
import moveModule from 'lib/features/move';

import {
  resizeBounds
} from 'lib/features/resize/ResizeUtil';


describe('features/overlay - integration', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      overlayModule,
      selectionModule,
      modelingModule,
      moveModule,
      resizeModule
    ],
    canvas: { deferUpdate: false }
  }));


  beforeEach(inject(function(dragging) {
    dragging.setOptions({ manual: true });
  }));


  describe('modeling integration', function() {

    it('should update on shape.move', inject(function(modeling, canvas, overlays) {

      // given
      var shape = canvas.addShape({
        id: 'test',
        x: 50,
        y: 50,
        width: 100,
        height: 100
      });

      // add overlay to a single shape (or connection)
      overlays.add(shape, {
        html: '<div style="width: 40px; height: 40px">TEST<br/>TEST</div>',
        position: {
          top: 0,
          left: 0
        }
      });

      // when
      modeling.moveShape(shape, { x: -20, y: +20 });

      // then
      var html = domQuery('[data-container-id=test]', canvas.getContainer());

      expect(parseInt(html.style.top)).to.equal(70);
      expect(parseInt(html.style.left)).to.equal(30);
    }));


    it('should update on shape.move undo', inject(function(modeling, canvas, commandStack, overlays) {

      // given
      var shape = canvas.addShape({
        id: 'test',
        x: 50,
        y: 50,
        width: 100,
        height: 100
      });

      // add overlay to a single shape (or connection)
      overlays.add(shape, {
        html: '<div style="width: 40px; height: 40px">TEST<br/>TEST</div>',
        position: {
          top: 0,
          left: 0
        }
      });

      // when
      modeling.moveShape(shape, { x: -20, y: +20 });
      commandStack.undo();

      // then
      var html = domQuery('[data-container-id=test]', canvas.getContainer());

      expect(parseInt(html.style.top)).to.equal(50);
      expect(parseInt(html.style.left)).to.equal(50);
    }));


    it('should update on shape.resize', inject(function(modeling, canvas, overlays) {

      // given
      var shape = canvas.addShape({
        id: 'test',
        x: 50,
        y: 50,
        width: 100,
        height: 100
      });

      // add overlay to a single shape (or connection)
      overlays.add(shape, {
        html: '<div style="width: 40px; height: 40px;">TEST<br/>TEST</div>',
        position: {
          top:  10,
          left: 10
        }
      });

      // when
      modeling.resizeShape(shape, resizeBounds(shape, 'nw', { x: 5, y: -15 }));

      // then
      var html = domQuery('[data-container-id=test]', canvas.getContainer());

      expect(parseInt(html.style.top)).to.equal(35);
      expect(parseInt(html.style.left)).to.equal(55);

    }));


    it('should update on shape.resize undo', inject(function(modeling, canvas, overlays, commandStack, resize) {

      // given
      var shape = canvas.addShape({
        id: 'test',
        x: 50,
        y: 50,
        width: 100,
        height: 100
      });

      // add overlay to a single shape (or connection)
      overlays.add(shape, {
        html: '<div style="width: 40px; height: 40px;">TEST<br/>TEST</div>',
        position: {
          top:  10,
          left: 10
        }
      });

      modeling.resizeShape(shape, resizeBounds(shape, 'nw', { x: 5, y: -15 }));

      // when
      commandStack.undo();

      // then
      var html = domQuery('[data-container-id=test]', canvas.getContainer());

      expect(parseInt(html.style.top)).to.equal(50);
      expect(parseInt(html.style.left)).to.equal(50);
    }));


    describe('changing root elements', function() {

      it('should hide on move to hidden root', inject(function(modeling, canvas, overlays) {

        // given
        var root1 = canvas.setRootElement({ id: '1', children: [] });
        var root2 = canvas.addRootElement({ id: '2', children: [] });
        var shape = canvas.addShape({
          id: 'test',
          x: 50,
          y: 50,
          width: 100,
          height: 100
        }, root1);

        // add overlay to a single shape (or connection)
        var overlayId = overlays.add(shape, {
          html: domify('<div style="width: 40px; height: 40px">TEST<br/>TEST</div>'),
          position: {
            top: 0,
            left: 0
          }
        });

        // when
        modeling.moveShape(shape, { x: 0, y: 0 }, root2);

        // then
        var html = overlays.get(overlayId).html;
        expect(isVisible(html)).to.be.false;
      }));


      it('should show on move to active root', inject(function(modeling, canvas, overlays) {

        // given
        var root1 = canvas.setRootElement({ id: '1', children: [] });
        var root2 = canvas.addRootElement({ id: '2', children: [] });
        var shape = canvas.addShape({
          id: 'test',
          x: 50,
          y: 50,
          width: 100,
          height: 100
        }, root2);

        // add overlay to a single shape (or connection)
        var overlayId = overlays.add(shape, {
          html: domify('<div style="width: 40px; height: 40px">TEST<br/>TEST</div>'),
          position: {
            top: 0,
            left: 0
          }
        });

        // when
        modeling.moveShape(shape, { x: 0, y: 0 }, root1);

        // then
        var html = overlays.get(overlayId).html;
        expect(isVisible(html)).to.be.true;
      }));

    });

  });


  describe('selection/hover integration', function() {

    it('should add selection/hover markers', inject(function(selection, canvas, overlays) {

      // given
      var shape = canvas.addShape({
        id: 'shape',
        x: 50,
        y: 50,
        width: 100,
        height: 100
      });

      var overlayContainer = overlays._getOverlayContainer(shape);

      // when
      selection.select(shape);

      // then
      expect(domClasses(overlayContainer.html).has('selected')).to.be.true;
    }));


    it('should remove selection/hover markers', inject(function(selection, canvas, overlays) {

      // given
      var shape = canvas.addShape({
        id: 'shape',
        x: 50,
        y: 50,
        width: 100,
        height: 100
      });

      var overlayContainer = overlays._getOverlayContainer(shape);

      // when
      selection.select(shape);
      selection.select(null);

      // then
      expect(domClasses(overlayContainer.html).has('selected')).to.be.false;
    }));

  });


  describe('drag integration', function() {

    it('should add <djs-dragging> marker class', inject(function(canvas, move, dragging, overlays) {

      // given
      var parent = canvas.addShape({
        id: 'parent',
        x: 50,
        y: 50,
        width: 100,
        height: 100,
        children: []
      });

      var child = canvas.addShape({
        id: 'child',
        x: 50,
        y: 50,
        width: 100,
        height: 100
      }, parent);

      var parentOverlayContainer = overlays._getOverlayContainer(parent);
      var childOverlayContainer = overlays._getOverlayContainer(child);

      // when
      move.start(canvasEvent({ x: 10, y: 10 }), parent);
      dragging.move(canvasEvent({ x: 20, y: 30 }));

      // then
      expect(domClasses(parentOverlayContainer.html).has('djs-dragging')).to.be.true;
      expect(domClasses(childOverlayContainer.html).has('djs-dragging')).to.be.true;
    }));


    it('should remove <djs-dragging> marker class on end', inject(function(canvas, move, dragging, overlays) {

      // given
      var parent = canvas.addShape({
        id: 'parent',
        x: 50,
        y: 50,
        width: 100,
        height: 100,
        children: []
      });

      var child = canvas.addShape({
        id: 'child',
        x: 50,
        y: 50,
        width: 100,
        height: 100
      }, parent);

      var parentOverlayContainer = overlays._getOverlayContainer(parent);
      var childOverlayContainer = overlays._getOverlayContainer(child);

      // when
      move.start(canvasEvent({ x: 10, y: 10 }), parent);
      dragging.move(canvasEvent({ x: 30, y: 30 }));
      dragging.end();

      // then
      expect(domClasses(parentOverlayContainer.html).has('djs-dragging')).to.be.false;
      expect(domClasses(childOverlayContainer.html).has('djs-dragging')).to.be.false;
    }));

  });


  describe('jquery support', function() {

    it('should allow to pass jquery element as overlay', inject(function(canvas, overlays) {

      // given
      window.jQuery = $;
      var shape = canvas.addShape({
        id: 'test',
        x: 50,
        y: 50,
        width: 100,
        height: 100,
        children: []
      });

      var $element = $('<div id="FOO">');


      // add overlay to a single shape (or connection)
      overlays.add(shape, {
        html: $element,
        position: {
          top:  10,
          left: 10
        }
      });

      // then
      expect($element.parent().length).to.equal(1);
    }));

  });

});


function isVisible(element) {
  return element.parentNode.style.display !== 'none';
}
