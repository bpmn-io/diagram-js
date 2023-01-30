import {
  createLine,
  updateLine
} from 'lib/util/RenderUtil';

import {
  attr as svgAttr
} from 'tiny-svg';


describe('util/RenderUtil', function() {

  describe('#createLine', function() {

    // given
    const points = [
      { x: 100, y: 100 },
      { x: 200, y: 100 },
      { x: 200, y: 200 },
      { x: 300, y: 300 }
    ];


    it('should create simple line', function() {

      // when
      const element = createLine(points);

      // then
      expect(svgAttr(element, 'd')).to.eql(
        'M100,100L200,100L200,200L300,300'
      );
    });


    it('should create line with corner radius', function() {

      // when
      const element = createLine(points, 5);

      // then
      expect(svgAttr(element, 'd')).to.eql(
        'M100,100L195,100C197.5,100,200,102.5,200,105L200,195C200,197.5,201.76776695296638,201.76776695296638,203.53553390593274,203.53553390593274L300,300'
      );
    });


    it('should create line with corner radius / handle short segments', function() {

      // given
      const points = [
        { x: 100, y: 100 },
        { x: 100, y: 103 }, // minimal movement
        { x: 200, y: 103 }, // good movement
        { x: 200, y: 103 } // no movement
      ];

      // when
      const element = createLine(points, 5);

      // then
      expect(svgAttr(element, 'd')).to.eql(
        'M100,100L100,100C100,101.5,101.5,103,103,103L200,103L200,103'
      );
    });

  });


  describe('#updateLine', function() {

    // given
    const points = [
      { x: 100, y: 100 },
      { x: 200, y: 100 },
      { x: 200, y: 200 },
      { x: 300, y: 300 }
    ];

    const newPoints = points.slice().reverse();


    it('should update simple line', function() {

      // given
      const element = createLine(points);

      // when
      const updatedElement = updateLine(element, newPoints);

      // then
      expect(updatedElement).to.equal(element);
      expect(svgAttr(element, 'd')).to.eql(
        'M300,300L200,200L200,100L100,100'
      );
    });


    it('should update line with corner radius', function() {

      // given
      const element = createLine(points, 5);

      // when
      const updatedElement = updateLine(element, newPoints);

      // then
      expect(updatedElement).to.equal(element);
      expect(svgAttr(element, 'd')).to.eql(
        'M300,300L203.53553390593274,203.53553390593274C201.76776695296638,201.76776695296638,200,197.5,200,195L200,105C200,102.5,197.5,100,195,100L100,100'
      );
    });

  });

});
