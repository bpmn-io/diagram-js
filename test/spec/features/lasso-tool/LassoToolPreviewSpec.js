import { expect } from 'chai';

import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import {
  createCanvasEvent as canvasEvent
} from '../../../util/MockEvents';

import {
  classes as domClasses
} from 'min-dom';

import modelingModule from 'lib/features/modeling';
import lassoToolModule from 'lib/features/lasso-tool';
import draggingModule from 'lib/features/dragging';


describe('features/lasso-tool - preview styling', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      modelingModule,
      lassoToolModule,
      draggingModule
    ]
  }));


  var rootShape, child1, child2, child3, child4;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    child1 = elementFactory.createShape({
      id: 'child1',
      x: 100, y: 100, width: 80, height: 80
    });

    canvas.addShape(child1, rootShape);

    child2 = elementFactory.createShape({
      id: 'child2',
      x: 220, y: 100, width: 80, height: 80
    });

    canvas.addShape(child2, rootShape);

    child3 = elementFactory.createShape({
      id: 'child3',
      x: 340, y: 100, width: 80, height: 80
    });

    canvas.addShape(child3, rootShape);

    child4 = elementFactory.createShape({
      id: 'child4',
      x: 460, y: 100, width: 80, height: 80
    });

    canvas.addShape(child4, rootShape);
  }));


  describe('preview markers during drag', function() {

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    it('should add selected marker to elements as they are enclosed', inject(function(lassoTool, dragging, canvas) {

      // given
      lassoTool.activateLasso(canvasEvent({ x: 90, y: 90 }));

      // when: drag to enclose child1 only (bbox right=200 > child1.right=180, excludes child2.x=220)
      dragging.move(canvasEvent({ x: 200, y: 200 }));

      // then
      expect(canvas.hasMarker(child1, 'selected')).to.be.true;
      expect(canvas.hasMarker(child2, 'selected')).to.be.false;
      expect(canvas.hasMarker(child3, 'selected')).to.be.false;

      // when: drag further to also enclose child2 and child3 (bbox right=430 > child3.right=420)
      dragging.move(canvasEvent({ x: 430, y: 200 }));

      // then
      expect(canvas.hasMarker(child1, 'selected')).to.be.true;
      expect(canvas.hasMarker(child2, 'selected')).to.be.true;
      expect(canvas.hasMarker(child3, 'selected')).to.be.true;
      expect(canvas.hasMarker(child4, 'selected')).to.be.false;
    }));


    it('should remove selected marker when element leaves lasso bounds', inject(function(lassoTool, dragging, canvas) {

      // given
      lassoTool.activateLasso(canvasEvent({ x: 90, y: 90 }));

      // when: drag to enclose child1, child2, child3
      dragging.move(canvasEvent({ x: 430, y: 200 }));

      // then
      expect(canvas.hasMarker(child1, 'selected')).to.be.true;
      expect(canvas.hasMarker(child2, 'selected')).to.be.true;
      expect(canvas.hasMarker(child3, 'selected')).to.be.true;

      // when: drag back so bbox right=310, excluding child3 (right=420)
      dragging.move(canvasEvent({ x: 310, y: 200 }));

      // then
      expect(canvas.hasMarker(child1, 'selected')).to.be.true;
      expect(canvas.hasMarker(child2, 'selected')).to.be.true;
      expect(canvas.hasMarker(child3, 'selected')).to.be.false;
    }));


    it('should clear preview markers on cancel', inject(function(lassoTool, dragging, canvas) {

      // given
      lassoTool.activateLasso(canvasEvent({ x: 90, y: 90 }));
      dragging.move(canvasEvent({ x: 430, y: 200 }));

      // assume
      expect(canvas.hasMarker(child1, 'selected')).to.be.true;
      expect(canvas.hasMarker(child2, 'selected')).to.be.true;
      expect(canvas.hasMarker(child3, 'selected')).to.be.true;

      // when
      dragging.cancel();

      // then
      expect(canvas.hasMarker(child1, 'selected')).to.be.false;
      expect(canvas.hasMarker(child2, 'selected')).to.be.false;
      expect(canvas.hasMarker(child3, 'selected')).to.be.false;
    }));


    it('should clear all preview markers when no elements are enclosed', inject(function(lassoTool, dragging, canvas) {

      // given: drag to enclose child1, child2, child3
      lassoTool.activateLasso(canvasEvent({ x: 90, y: 90 }));
      dragging.move(canvasEvent({ x: 430, y: 200 }));

      // assume
      expect(canvas.hasMarker(child1, 'selected')).to.be.true;
      expect(canvas.hasMarker(child2, 'selected')).to.be.true;
      expect(canvas.hasMarker(child3, 'selected')).to.be.true;

      // when: drag back so bbox encloses nothing
      dragging.move(canvasEvent({ x: 91, y: 91 }));

      // then: all markers removed
      expect(canvas.hasMarker(child1, 'selected')).to.be.false;
      expect(canvas.hasMarker(child2, 'selected')).to.be.false;
      expect(canvas.hasMarker(child3, 'selected')).to.be.false;
    }));


    it('should apply final selection after lasso end', inject(function(lassoTool, dragging, canvas, selection) {

      // given
      lassoTool.activateLasso(canvasEvent({ x: 90, y: 90 }));
      dragging.move(canvasEvent({ x: 430, y: 200 }));

      // when
      dragging.end();

      // then
      var selected = selection.get();
      expect(selected).to.include(child1);
      expect(selected).to.include(child2);
      expect(selected).to.include(child3);
      expect(selected).to.not.include(child4);

      expect(canvas.hasMarker(child1, 'selected')).to.be.true;
      expect(canvas.hasMarker(child2, 'selected')).to.be.true;
      expect(canvas.hasMarker(child3, 'selected')).to.be.true;
      expect(canvas.hasMarker(child4, 'selected')).to.be.false;
    }));

  });


  describe('djs-dragging-active-lasso class', function() {

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    it('should add djs-dragging-active-lasso on drag start', inject(function(lassoTool, dragging, canvas) {

      // given
      lassoTool.activateLasso(canvasEvent({ x: 90, y: 90 }));

      // when: first move triggers lasso.start
      dragging.move(canvasEvent({ x: 430, y: 200 }));

      // then
      expect(domClasses(canvas.getContainer()).has('djs-dragging-active-lasso')).to.be.true;
    }));


    it('should add djs-dragging-active-lasso even when no elements are enclosed', inject(function(lassoTool, dragging, canvas) {

      // given
      lassoTool.activateLasso(canvasEvent({ x: 90, y: 90 }));

      // when: tiny move, no elements enclosed (elements start at x:100, y:100)
      dragging.move(canvasEvent({ x: 95, y: 95 }));

      // then: class is added regardless of enclosed elements
      expect(domClasses(canvas.getContainer()).has('djs-dragging-active-lasso')).to.be.true;
    }));


    it('should remove djs-dragging-active-lasso on cancel', inject(function(lassoTool, dragging, canvas) {

      // given
      lassoTool.activateLasso(canvasEvent({ x: 90, y: 90 }));
      dragging.move(canvasEvent({ x: 200, y: 200 }));

      // assume
      expect(domClasses(canvas.getContainer()).has('djs-dragging-active-lasso')).to.be.true;

      // when
      dragging.cancel();

      // then
      expect(domClasses(canvas.getContainer()).has('djs-dragging-active-lasso')).to.be.false;
    }));


    it('should remove djs-dragging-active-lasso on end', inject(function(lassoTool, dragging, canvas) {

      // given
      lassoTool.activateLasso(canvasEvent({ x: 90, y: 90 }));
      dragging.move(canvasEvent({ x: 200, y: 200 }));

      // assume
      expect(domClasses(canvas.getContainer()).has('djs-dragging-active-lasso')).to.be.true;

      // when
      dragging.end();

      // then
      expect(domClasses(canvas.getContainer()).has('djs-dragging-active-lasso')).to.be.false;
    }));

  });


  describe('original selection', function() {

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    it('should show original selection markers when shift is held during drag', inject(function(lassoTool, dragging, canvas, selection) {

      // given
      selection.select([ child1 ]);

      // start lasso after child1's right edge (x=180) to avoid re-enclosing it
      lassoTool.activateLasso(canvasEvent({ x: 190, y: 90 }));

      // when
      // drag with shift held
      dragging.move(canvasEvent({ x: 430, y: 200 }, { shiftKey: true }));

      // then
      // child1 (original) and child2/3 (enclosed) all have marker
      expect(canvas.hasMarker(child1, 'selected')).to.be.true;
      expect(canvas.hasMarker(child2, 'selected')).to.be.true;
      expect(canvas.hasMarker(child3, 'selected')).to.be.true;
    }));


    it('should hide original selection markers when shift is NOT held at drag start', inject(function(lassoTool, dragging, canvas, selection) {

      // given
      // child1 is pre-selected
      selection.select([ child1 ]);

      // start lasso after child1's right edge so it is not re-enclosed
      lassoTool.activateLasso(canvasEvent({ x: 190, y: 90 }));

      // when
      // drag without shift
      dragging.move(canvasEvent({ x: 430, y: 200 }));

      // then
      // child1 marker is hidden (no shift = won't be in final selection)
      expect(canvas.hasMarker(child1, 'selected')).to.be.false;

      // only newly enclosed elements have preview markers
      expect(canvas.hasMarker(child2, 'selected')).to.be.true;
      expect(canvas.hasMarker(child3, 'selected')).to.be.true;
    }));


    it('should NOT toggle original selection markers when shift is pressed and released mid-drag', inject(function(lassoTool, dragging, canvas, selection) {

      // given
      selection.select([ child1 ]);

      lassoTool.activateLasso(canvasEvent({ x: 190, y: 90 }));

      dragging.move(canvasEvent({ x: 430, y: 200 }));
      expect(canvas.hasMarker(child1, 'selected')).to.be.false;

      // when
      // press shift mid-drag → original markers not restored
      dragging.move(canvasEvent({ x: 430, y: 200 }, { shiftKey: true }));
      expect(canvas.hasMarker(child1, 'selected')).to.be.false;
      expect(canvas.hasMarker(child2, 'selected')).to.be.true;

      // when
      // release shift mid-drag → original markers still hidden
      dragging.move(canvasEvent({ x: 430, y: 200 }));
      expect(canvas.hasMarker(child1, 'selected')).to.be.false;
      expect(canvas.hasMarker(child2, 'selected')).to.be.true;
    }));


    it('should preserve original selection markers on cancel in add mode', inject(function(lassoTool, dragging, canvas, selection) {

      // given
      // child1 is pre-selected
      selection.select([ child1 ]);

      lassoTool.activateLasso(canvasEvent({ x: 190, y: 90 }));

      // when
      // drag with shift to enclose child2
      dragging.move(canvasEvent({ x: 310, y: 200 }, { shiftKey: true }));

      // assume
      // both have markers
      expect(canvas.hasMarker(child1, 'selected')).to.be.true;
      expect(canvas.hasMarker(child2, 'selected')).to.be.true;

      // when
      dragging.cancel();

      // then
      // original selection marker preserved, preview-only marker removed
      expect(canvas.hasMarker(child1, 'selected')).to.be.true;
      expect(canvas.hasMarker(child2, 'selected')).to.be.false;
    }));


    it('should include original selection and enclosed elements in final selection in add mode', inject(function(lassoTool, dragging, canvas, selection) {

      // given
      selection.select([ child1 ]);

      // start lasso after child1's right edge so it is not re-enclosed
      lassoTool.activateLasso(canvasEvent({ x: 190, y: 90 }));

      // when
      // drag with shift to enclose child2 and child3
      dragging.move(canvasEvent({ x: 430, y: 200 }, { shiftKey: true }));
      dragging.end();

      // then
      // final selection contains original + newly enclosed
      var selected = selection.get();
      expect(selected).to.include(child1);
      expect(selected).to.include(child2);
      expect(selected).to.include(child3);
      expect(selected).to.not.include(child4);
    }));


    it('should NOT restore original selection markers on cancel when shift NOT pressed', inject(function(lassoTool, dragging, canvas, selection) {

      // given
      // child1 is pre-selected
      selection.select([ child1 ]);

      lassoTool.activateLasso(canvasEvent({ x: 190, y: 90 }));
      dragging.move(canvasEvent({ x: 430, y: 200 }));

      // assume
      // child1 marker hidden (no shift)
      expect(canvas.hasMarker(child1, 'selected')).to.be.false;

      // when
      dragging.cancel();

      // then
      // original selection markers not restored
      expect(canvas.hasMarker(child1, 'selected')).to.be.false;
      expect(canvas.hasMarker(child2, 'selected')).to.be.false;
      expect(canvas.hasMarker(child3, 'selected')).to.be.false;
    }));

  });

});
