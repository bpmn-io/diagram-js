import {
  bootstrapDiagram,
  getDiagramJS,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import gridSnappingModule from 'lib/features/grid-snapping';
import gridVisualsModule from 'lib/features/grid-snapping/visuals';
import moveModule from 'lib/features/move';


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

});