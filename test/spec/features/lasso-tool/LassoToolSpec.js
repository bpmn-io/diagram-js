import { expect } from 'chai';

import {
  bootstrapDiagram,
  getDiagramJS,
  inject
} from 'test/TestHelper';

import {
  createCanvasEvent as canvasEvent
} from '../../../util/MockEvents';

import {
  assign
} from 'min-dash';

import modelingModule from 'lib/features/modeling';
import lassoToolModule from 'lib/features/lasso-tool';
import draggingModule from 'lib/features/dragging';


describe('features/lasso-tool', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      modelingModule,
      lassoToolModule,
      draggingModule
    ]
  }));


  var rootShape, childShape, childShape2, childShape3, childShape4;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    childShape = elementFactory.createShape({
      id: 'child',
      x: 110, y: 110, width: 50, height: 100
    });

    canvas.addShape(childShape, rootShape);

    childShape2 = elementFactory.createShape({
      id: 'child2',
      x: 180, y: 110, width: 50, height: 100
    });

    canvas.addShape(childShape2, rootShape);

    childShape3 = elementFactory.createShape({
      id: 'child3',
      x: 240, y: 110, width: 50, height: 100
    });

    canvas.addShape(childShape3, rootShape);

    childShape4 = elementFactory.createShape({
      id: 'child4',
      x: 300, y: 110, width: 50, height: 100
    });

    canvas.addShape(childShape4, rootShape);
  }));


  describe('#toggle', function() {

    it('should activate and deactivate', inject(function(lassoTool) {

      // given
      lassoTool.toggle();

      // assume
      expect(lassoTool.isActive()).to.be.true;

      // when
      lassoTool.toggle();

      // then
      expect(lassoTool.isActive()).not.to.be.ok;
    }));

  });


  describe('#select', function() {

    it('should select elements in bbox', inject(function(lassoTool, selection) {

      // given
      var elements = [ childShape, childShape2, childShape3, childShape4 ];
      var bbox = {
        x: 175,
        y: 0,
        width: 120,
        height: 220
      };

      // when
      lassoTool.select(elements, bbox);

      // then
      var selectedElements = selection.get();

      expect(selectedElements.length).to.equal(2);
      expect(selectedElements[0]).to.equal(childShape2);
      expect(selectedElements[1]).to.equal(childShape3);
    }));


    it('shoud select elements in bbox and previously selected elements', inject(function(lassoTool, selection) {

      // given
      selection.select([ childShape ]);

      var elements = [ childShape2, childShape3 ];

      var bbox = {
        x: 175,
        y: 0,
        width: 120,
        height: 220
      };

      // when
      lassoTool.select(elements, bbox, selection.get());

      // then
      var selectedElements = selection.get();

      expect(selectedElements.length).to.equal(3);
      expect(selectedElements[0]).to.equal(childShape);
      expect(selectedElements[1]).to.equal(childShape2);
      expect(selectedElements[2]).to.equal(childShape3);
    }));

  });


  describe('#activateLasso', function() {

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    it('should select after lasso', inject(function(lassoTool, dragging, selection, elementRegistry) {

      // when
      lassoTool.activateLasso(canvasEvent({ x: 100, y: 100 }));
      dragging.move(canvasEvent({ x: 200, y: 300 }));
      dragging.end();

      // then
      expect(selection.get()).to.eql([ elementRegistry.get('child') ]);
    }));


    it('should add to selection if shift is held at drag start', inject(
      function(lassoTool, dragging, selection, elementRegistry) {

        // given - childShape is already selected
        selection.select([ elementRegistry.get('child') ]);

        // when - start lasso with shift held, selecting childShape2 and childShape3
        lassoTool.activateLasso(canvasEvent({ x: 175, y: 100 }));
        dragging.move(canvasEvent({ x: 295, y: 220 }, { shiftKey: true }));
        dragging.end(canvasEvent({ x: 295, y: 220 }));

        // then - previously selected element is included
        var selected = selection.get();
        expect(selected).to.include(elementRegistry.get('child'));
        expect(selected).to.include(elementRegistry.get('child2'));
        expect(selected).to.include(elementRegistry.get('child3'));
      }
    ));


    it('should NOT add to selection if shift is held only at drag end', inject(
      function(lassoTool, dragging, selection, elementRegistry) {

        // given - childShape is already selected
        selection.select([ elementRegistry.get('child') ]);

        // when - start lasso WITHOUT shift, selecting childShape2 and childShape3
        lassoTool.activateLasso(canvasEvent({ x: 175, y: 100 }));
        dragging.move(canvasEvent({ x: 295, y: 220 }));
        dragging.end(canvasEvent({ x: 295, y: 220 }, { shiftKey: true }));

        // then - previously selected element is NOT included (shift at end is ignored)
        var selected = selection.get();
        expect(selected).not.to.include(elementRegistry.get('child'));
        expect(selected).to.include(elementRegistry.get('child2'));
        expect(selected).to.include(elementRegistry.get('child3'));
      }
    ));

  });


  describe('visuals', function() {

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    it('should show lasso box', inject(function(lassoTool, canvas, dragging) {

      // when
      lassoTool.activateLasso(canvasEvent({ x: 100, y: 100 }));
      dragging.move(canvasEvent({ x: 200, y: 300 }));

      // then
      expect(canvas._svg.querySelector('.djs-lasso-overlay')).to.exist;
    }));

  });


  describe('activate on mouse', function() {

    it('should start on PRIMARY mousedown', inject(function(lassoTool, eventBus) {

      // when
      eventBus.fire(mouseDownEvent(rootShape, { shiftKey: true }));

      // then
      expect(lassoTool.isActive()).to.be.true;
    }));


    it('should NOT start on AUXILIARY mousedown', inject(function(lassoTool, eventBus) {

      // when
      eventBus.fire(mouseDownEvent(rootShape, { button: 1, shiftKey: true }));

      // then
      expect(lassoTool.isActive()).not.to.be.ok;
    }));

  });

});


// helpers ////////////////

function mouseDownEvent(element, data) {

  return getDiagramJS().invoke(function(eventBus) {
    return eventBus.createEvent({
      type: 'element.mousedown',
      element: element,
      originalEvent: assign({ button: 0 }, data || {})
    });
  });
}