import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import copyPasteModule from 'lib/features/copy-paste';
import gridSnappingModule from 'lib/features/grid-snapping';
import modelingModule from 'lib/features/modeling';
import rulesModule from '../../copy-paste/rules';
import selectionModule from 'lib/features/selection';

import { getBBox } from 'lib/util/Elements';
import { getMid } from 'lib/layout/LayoutUtil';

import { SPACING } from 'lib/features/grid-snapping/GridSnapping';


describe('features/grid-snapping - paste', function() {

  var rootShape, shape1, shape2, midGridOffset;

  beforeEach(bootstrapDiagram({
    modules: [
      copyPasteModule,
      gridSnappingModule,
      modelingModule,
      rulesModule,
      selectionModule
    ]
  }));

  beforeEach(inject(function(canvas, elementFactory) {
    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    // snapped
    shape1 = elementFactory.createShape({
      id: 'shape1',
      x: 100, y: 100,
      width: 100, height: 100
    });

    canvas.addShape(shape1);

    // not snapped
    shape2 = elementFactory.createShape({
      id: 'shape2',
      x: 305, y: 105,
      width: 100, height: 100
    });

    canvas.addShape(shape2);

    midGridOffset = getGridOffset(getMid(getBBox([ shape1, shape2 ])));
  }));


  var points = [
    { x: 300, y: 300 },
    { x: 306, y: 312 },
    { x: 312, y: 324 },
    { x: 318, y: 336 },
    { x: 324, y: 348 }
  ];

  points.forEach(function(point) {

    it('should have same grid offset when pasting at ' + point.x + ', ' + point.y, inject(
      function(copyPaste, selection) {

        // given
        copyPaste.copy([ shape1, shape2 ]);

        // when
        copyPaste.paste({
          element: rootShape,
          point: point
        });

        // then
        var copies = selection.get(),
            shape1Copy = copies[0],
            shape2Copy = copies[1],
            mid = getMid(getBBox(copies));

        // take rounding into account
        expect(getGridOffset(mid).x).to.be.closeTo(midGridOffset.x, 1);
        expect(getGridOffset(mid).y).to.be.closeTo(midGridOffset.y, 1);

        expect(getGridOffset(shape1Copy).x).to.be.closeTo(getGridOffset(shape1).x, 1);
        expect(getGridOffset(shape1Copy).y).to.be.closeTo(getGridOffset(shape1).y, 1);

        expect(getGridOffset(shape2Copy).x).to.be.closeTo(getGridOffset(shape2).x, 1);
        expect(getGridOffset(shape2Copy).y).to.be.closeTo(getGridOffset(shape2).y, 1);
      })
    );

  });

});

// helpers //////////

/**
 * Get a shape's grid offset.
 * A snapped shape will have an offset of 0.
 *
 * @param {Object} shape
 *
 * @returns {Object}
 */
function getGridOffset(shape) {
  return {
    x: shape.x % SPACING,
    y: shape.y % SPACING
  };
}