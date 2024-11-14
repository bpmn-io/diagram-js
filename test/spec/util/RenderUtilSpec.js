import {
  componentsToPath,
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


  describe('#componentsToPath', function() {

    // test cases derived from bpmn-js BpmnRenderUtil
    const testCases = [
      {
        name: 'circle',
        components: [
          [ 'M', 0, 0 ],
          [ 'm', 0, -20 ],
          [ 'a', 20, 20, 0, 1, 1, 0, 2 * 20 ],
          [ 'a', 20, 20, 0, 1, 1, 0, -2 * 20 ],
          [ 'z' ]
        ],
        expected: 'M0,0m0,-20a20,20,0,1,1,0,40a20,20,0,1,1,0,-40z'
      },
      {
        name: 'roundRect',
        components: [
          [ 'M', 100 + 5, 10 ],
          [ 'l', 100 - 5 * 2, 0 ],
          [ 'a', 5, 5, 0, 0, 1, 5, 5 ],
          [ 'l', 0, 80 - 5 * 2 ],
          [ 'a', 5, 5, 0, 0, 1, -5, 5 ],
          [ 'l', 5 * 2 - 100, 0 ],
          [ 'a', 5, 5, 0, 0, 1, -5, -5 ],
          [ 'l', 0, 5 * 2 - 80 ],
          [ 'a', 5, 5, 0, 0, 1, 5, -5 ],
          [ 'z' ]
        ],
        expected: 'M105,10l90,0a5,5,0,0,1,5,5l0,70a5,5,0,0,1,-5,5l-90,0a5,5,0,0,1,-5,-5l0,-70a5,5,0,0,1,5,-5z'
      },
      {
        name: 'diamond',
        components: [
          [ 'M', 100, 0 ],
          [ 'l', 100, 100 ],
          [ 'l', -100, 100 ],
          [ 'l', -100, -100 ],
          [ 'z' ]
        ],
        expected: 'M100,0l100,100l-100,100l-100,-100z'
      },
      {
        name: 'rect',
        components: [
          [ 'M', 100, 0 ],
          [ 'l', 100, 0 ],
          [ 'l', 0, 100 ],
          [ 'l', -100, 0 ],
          [ 'z' ]
        ],
        expected: 'M100,0l100,0l0,100l-100,0z'
      }
    ];

    for (const testCase of testCases) {

      it(`should handle ${testCase.name}`, function() {

        // when
        const output = componentsToPath(testCase.components);

        // then
        expect(output).to.eql(testCase.expected);
      });
    }
  });
});
