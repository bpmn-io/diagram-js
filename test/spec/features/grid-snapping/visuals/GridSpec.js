import {
  bootstrapDiagram,
  getDiagramJS,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import gridSnappingModule from 'lib/features/grid-snapping';
import gridVisualsModule from 'lib/features/grid-snapping/visuals';
import moveModule from 'lib/features/move';

import { getMid } from 'lib/layout/LayoutUtil';

import { GRID_DIMENSIONS } from 'lib/features/grid-snapping/visuals/Grid';

import { SPACING } from 'lib/features/grid-snapping/GridUtil';

import { attr as svgAttr } from 'tiny-svg';


describe('features/grid-snapping/visuals', function() {

  it('should be visible by default', function() {

    // when
    bootstrapDiagram({
      modules: [
        modelingModule,
        gridSnappingModule,
        gridVisualsModule,
        moveModule
      ]
    })();

    // then
    var grid = getDiagramJS().get('grid'),
        gfx = grid._getParent();

    expect(grid._isVisible()).to.be.true;
    expect(gfx.childNodes).to.have.length(1);
  });


  it('should NOT be visible if gridSnapping is disabled', function() {

    // when
    bootstrapDiagram({
      modules: [
        modelingModule,
        gridSnappingModule,
        gridVisualsModule,
        moveModule
      ],
      gridSnapping: {
        active: false
      }
    })();

    // then
    var grid = getDiagramJS().get('grid'),
        gfx = grid._getParent();

    expect(grid._isVisible()).to.be.false;
    expect(gfx.childNodes).to.have.length(0);
  });


  it('should NOT be visible if gridSnapping is toggled inactive', function() {

    // given
    bootstrapDiagram({
      modules: [
        modelingModule,
        gridSnappingModule,
        gridVisualsModule,
        moveModule
      ]
    })();

    var gridSnapping = getDiagramJS().get('gridSnapping');

    // when
    gridSnapping.setActive(false);

    // then
    var grid = getDiagramJS().get('grid'),
        gfx = grid._getParent();

    expect(grid._isVisible()).to.be.false;
    expect(gfx.childNodes).to.have.length(0);
  });


  it('should be visible if gridSnapping is toggled active', function() {

    // given
    bootstrapDiagram({
      modules: [
        modelingModule,
        gridSnappingModule,
        gridVisualsModule,
        moveModule
      ],
      gridSnapping: {
        active: false
      }
    })();

    var gridSnapping = getDiagramJS().get('gridSnapping');

    // when
    gridSnapping.setActive(true);

    // then
    var grid = getDiagramJS().get('grid'),
        gfx = grid._getParent();

    expect(grid._isVisible()).to.be.true;
    expect(gfx.childNodes).to.have.length(1);
  });


  describe('api', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        modelingModule,
        gridSnappingModule,
        gridVisualsModule,
        moveModule
      ]
    }));


    it('#_isVisible', inject(function(grid, gridSnapping) {

      // then
      expect(grid._isVisible()).to.be.true;

      // when
      gridSnapping.setActive(false);

      // then
      expect(grid._isVisible()).to.be.false;
    }));

  });


  describe('update', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        modelingModule,
        gridSnappingModule,
        gridVisualsModule,
        moveModule
      ],
      canvas: {
        deferUpdate: false
      }
    }));


    it('should initially update grid', inject(function(canvas, grid) {

      // then
      var viewbox = canvas.viewbox(),
          viewboxMid = getMid(viewbox);

      var gridMid = getMid({
        x: parseInt(svgAttr(grid.grid, 'x')),
        y: parseInt(svgAttr(grid.grid, 'y')),
        width: GRID_DIMENSIONS.width,
        height: GRID_DIMENSIONS.height
      });

      // should be centered around viewbox
      expect(viewboxMid.x).to.be.closeTo(gridMid.x, SPACING / 2);
      expect(viewboxMid.y).to.be.closeTo(gridMid.y, SPACING / 2);
    }));

    [
      { x: 12, y: 24 },
      { x: 24, y: 48 },
      { x: 36, y: 72 },
      { x: 48, y: 96 },
      { x: 60, y: 120 }
    ].forEach(function(delta) {

      it('should update on canvas.viewbox.changed ' + JSON.stringify(delta), inject(
        function(canvas, grid) {

          // when
          canvas.scroll(delta);

          // then
          var viewbox = canvas.viewbox(),
              viewboxMid = getMid(viewbox);

          var gridMid = getMid({
            x: parseInt(svgAttr(grid.grid, 'x')),
            y: parseInt(svgAttr(grid.grid, 'y')),
            width: GRID_DIMENSIONS.width,
            height: GRID_DIMENSIONS.height
          });

          // should be centered around viewbox
          expect(viewboxMid.x).to.be.closeTo(gridMid.x, SPACING / 2);
          expect(viewboxMid.y).to.be.closeTo(gridMid.y, SPACING / 2);
        })
      );

    });

  });

  describe('api', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        modelingModule,
        gridSnappingModule,
        gridVisualsModule,
        moveModule
      ]
    }));


    it('#_isVisible', inject(function(grid) {

      // then
      expect(grid._isVisible()).to.be.true;

      // when
      grid._setVisible(false);

      // then
      expect(grid._isVisible()).to.be.false;
    }));


    it('#_setVisible', inject(function(grid) {

      // when
      grid._setVisible(false);

      // then
      var gfx = grid._getParent();

      expect(grid._isVisible()).to.be.false;
      expect(gfx.childNodes).to.have.length(0);
    }));

  });

});