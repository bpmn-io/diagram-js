import TestContainer from 'mocha-test-container-support';

import {
  bootstrapDiagram,
  getDiagramJS,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import snappingModule from 'lib/features/snapping';

import SnapContext, { SnapPoints } from 'lib/features/snapping/SnapContext';

import { SNAP_LINE_HIDE_DELAY } from 'lib/features/snapping/Snapping';

import { queryAll as domQueryAll } from 'min-dom';


describe('features/snapping - Snapping', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      modelingModule,
      snappingModule
    ]
  }));

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  describe('snapping', function() {

    var snapContext, snapPoints;

    beforeEach(function() {
      snapContext = new SnapContext();

      snapContext.setSnapOrigin('foo', {
        x: 0,
        y: 0
      });

      snapPoints = new SnapPoints();

      snapPoints.add('foo', {
        x: 150,
        y: 150
      });
    });

    it('should snap event', inject(function(snapping) {

      // given
      var event = {
        x: 145,
        y: 155,
        context: {
          snapContext: snapContext
        }
      };

      // when
      snapping.snap(event, snapPoints);

      // then
      expect(event.x).to.equal(150);
      expect(event.y).to.equal(150);
    }));


    it('should NOT snap event', inject(function(snapping) {

      // given
      var event = {
        x: 140,
        y: 160,
        context: {
          snapContext: snapContext
        }
      };

      // when
      snapping.snap(event, snapPoints);

      // then
      expect(event.x).to.equal(140);
      expect(event.y).to.equal(160);
    }));

  });


  describe('snap lines', function() {

    it('should show', inject(function(snapping) {

      // when
      snapping.showSnapLine('horizontal', 100);

      // then
      expect(domQueryAll('.djs-snap-line', container).length).to.equal(2);
    }));


    it('should hide', inject(function(snapping) {

      // given
      snapping.showSnapLine('horizontal', 100);

      // when
      snapping.hide();

      // then
      expect(isHidden(domQueryAll('.djs-snap-line', container)[0])).to.be.true; // horizontal
      expect(isHidden(domQueryAll('.djs-snap-line', container)[1])).to.be.true; // vertical
    }));


    it('should hide async', function(done) {
      getDiagramJS().invoke(function(snapping) {

        // when
        snapping.showSnapLine('horizontal', 100);

        setTimeout(function() {

          // then
          expect(isHidden(domQueryAll('.djs-snap-line', container)[0])).to.be.true; // horizontal
          expect(isHidden(domQueryAll('.djs-snap-line', container)[1])).to.be.true; // vertical

          done();
        }, SNAP_LINE_HIDE_DELAY);
      });
    });

  });

});

// helpers //////////

function isHidden(element) {
  return element && element.style.display === 'none';
}