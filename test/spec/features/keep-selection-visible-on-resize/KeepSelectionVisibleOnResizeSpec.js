import { expect } from 'chai';

import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import selectionModule from 'lib/features/selection';
import keepSelectionVisibleOnResizeModule from 'lib/features/keep-selection-visible-on-resize';

import { getBBox } from 'lib/util/Elements';
import { asTRBL } from 'lib/layout/LayoutUtil';


describe('features/keep-selection-visible-on-resize', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      coreModule,
      selectionModule,
      keepSelectionVisibleOnResizeModule
    ],
    canvas: {
      width: 800,
      height: 600
    }
  }));

  var shape1, shape2, shape3;

  beforeEach(inject(function(canvas) {

    shape1 = canvas.addShape({
      id: 'shape1', x: 700, y: 10, width: 100, height: 100
    });

    shape2 = canvas.addShape({
      id: 'shape2', x: 10, y: 500, width: 100, height: 100
    });

    shape3 = canvas.addShape({
      id: 'shape3', x: 10, y: 10, width: 100, height: 100
    });
  }));


  describe('scroll adjustment on resize', function() {

    it('should scroll right when canvas shrinks from right', inject(
      function(canvas, selection) {

        selection.select(shape1);

        var viewboxBeforeResize = canvas.viewbox();

        canvas.getContainer().style.width = '600px';
        canvas.resized();

        expectSelectionInView(canvas, selection);
        expectAxisUnchanged(canvas, viewboxBeforeResize, 'y');
      }
    ));


    it('should scroll down when canvas shrinks from bottom', inject(
      function(canvas, selection) {

        selection.select(shape2);

        var viewboxBeforeResize = canvas.viewbox();

        canvas.getContainer().style.height = '400px';
        canvas.resized();

        expectSelectionInView(canvas, selection);
        expectAxisUnchanged(canvas, viewboxBeforeResize, 'x');
      }
    ));


    it('should scroll to keep multi-selection bounding box visible', inject(
      function(canvas, selection) {

        var nearRight1 = canvas.addShape({
          id: 'nearRight1', x: 500, y: 10, width: 100, height: 100
        });
        var nearRight2 = canvas.addShape({
          id: 'nearRight2', x: 700, y: 50, width: 100, height: 100
        });

        selection.select([ nearRight1, nearRight2 ]);

        var viewboxBeforeResize = canvas.viewbox();

        canvas.getContainer().style.width = '600px';
        canvas.resized();

        expectSelectionInView(canvas, selection);
        expectAxisUnchanged(canvas, viewboxBeforeResize, 'y');
      }
    ));

  });


  describe('visibility guard', function() {

    it('should NOT scroll when selection was not visible before resize', inject(
      function(canvas, selection) {

        selection.select(shape1);
        canvas.scroll({ dx: -2000, dy: 0 });

        var viewboxBeforeResize = canvas.viewbox();

        canvas.getContainer().style.width = '600px';
        canvas.resized();

        expectViewboxUnchanged(canvas, viewboxBeforeResize);
      }
    ));


    it('should NOT scroll when selection still fits after resize', inject(
      function(canvas, selection) {

        selection.select(shape3);

        var viewboxBeforeResize = canvas.viewbox();

        canvas.getContainer().style.width = '600px';
        canvas.resized();

        expectViewboxUnchanged(canvas, viewboxBeforeResize);
      }
    ));


    it('should NOT scroll when selection bbox is larger than viewport', inject(
      function(canvas, selection) {

        var wideShape = canvas.addShape({
          id: 'wideShape', x: 0, y: 0, width: 2000, height: 100
        });
        selection.select(wideShape);

        var viewboxBeforeResize = canvas.viewbox();

        canvas.getContainer().style.width = '600px';
        canvas.resized();

        expectViewboxUnchanged(canvas, viewboxBeforeResize);
      }
    ));


    it('should NOT scroll when nothing is selected', inject(
      function(canvas) {

        var viewboxBeforeResize = canvas.viewbox();

        canvas.getContainer().style.width = '600px';
        canvas.resized();

        expectViewboxUnchanged(canvas, viewboxBeforeResize);
      }
    ));


    it('should NOT scroll when selection is in a different root element', inject(
      function(canvas, selection) {

        var otherRoot = canvas.addRootElement({ id: 'otherRoot' });
        var shapeInOtherRoot = canvas.addShape(
          { id: 'otherShape', x: 700, y: 10, width: 100, height: 100 },
          otherRoot
        );

        selection.select(shapeInOtherRoot);

        var viewboxBeforeResize = canvas.viewbox();

        canvas.getContainer().style.width = '600px';
        canvas.resized();

        expectViewboxUnchanged(canvas, viewboxBeforeResize);
      }
    ));

  });


  describe('visibility flag tracking', function() {

    it('should not bring selection back after user scrolls it away', inject(
      function(canvas, selection) {

        selection.select(shape1);
        canvas.scroll({ dx: -2000, dy: 0 });

        var viewboxBeforeResize = canvas.viewbox();

        canvas.getContainer().style.width = '600px';
        canvas.resized();

        expectViewboxUnchanged(canvas, viewboxBeforeResize);
      }
    ));


    it('should track the current selection, not the previous one', inject(
      function(canvas, selection) {

        selection.select(shape1);
        selection.select(shape3);

        var viewboxBeforeResize = canvas.viewbox();

        canvas.getContainer().style.width = '600px';
        canvas.resized();

        expectViewboxUnchanged(canvas, viewboxBeforeResize);
      }
    ));

  });

});



function expectSelectionInView(canvas, selection) {
  var SCROLL_PADDING = 10;
  var viewbox = canvas.viewbox();
  var viewboxTrbl = asTRBL(viewbox);
  var selectionBBox = getBBox(selection.get());
  var selectionTrbl = asTRBL(selectionBBox);

  expect(selectionTrbl.left).to.be.at.least(viewboxTrbl.left + SCROLL_PADDING);
  expect(selectionTrbl.right).to.be.at.most(viewboxTrbl.right - SCROLL_PADDING);
  expect(selectionTrbl.top).to.be.at.least(viewboxTrbl.top + SCROLL_PADDING);
  expect(selectionTrbl.bottom).to.be.at.most(viewboxTrbl.bottom - SCROLL_PADDING);
}

function expectAxisUnchanged(canvas, viewboxBefore, axis) {
  var viewbox = canvas.viewbox();
  expect(viewbox[axis]).to.equal(viewboxBefore[axis]);
}

function expectViewboxUnchanged(canvas, viewboxBefore) {
  var viewbox = canvas.viewbox();
  expect(viewbox.x).to.equal(viewboxBefore.x);
  expect(viewbox.y).to.equal(viewboxBefore.y);
}