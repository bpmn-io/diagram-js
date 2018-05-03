import {
  create
} from 'lib/model';


describe('matchers/BoundsMatchers', function() {

  describe('bounds', function() {

    it('should .have.bounds() with Bounds', function() {

      // given
      var bounds = { x: 100, y: 100, width: 200, height: 200 },
          expectedBounds = { x: 100, y: 100, width: 200, height: 200 };

      // then
      expect(bounds).to.have.bounds(expectedBounds);
    });


    it('should .not.have.bounds() with Bounds', function() {

      // given
      var bounds = { x: 100, y: 100, width: 200, height: 200 },
          expectedBounds = { x: 50, y: 100, width: 200, height: 200 };

      // then
      expect(bounds).not.to.have.bounds(expectedBounds);
    });


    it('should .have.bounds() with Shape', function() {

      // given
      var element = create('shape', {
        id: 'someShape',
        x: 100, y: 100,
        width: 200, height: 200
      });

      var expectedBounds = {
        x: 100, y: 100,
        width: 200, height: 200
      };

      // then
      expect(element).to.have.bounds(expectedBounds);
    });


    it('should .not.have.bounds() with Shape', function() {

      // given
      var element = create('shape', {
        id: 'someShape',
        x: 100, y: 100,
        width: 200, height: 200
      });

      var expectedBounds = {
        x: 50, y: 100,
        width: 200, height: 200
      };

      // then
      expect(element).not.to.have.bounds(expectedBounds);
    });

  });

});