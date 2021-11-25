import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';


describe('ElementRegistry', function() {

  beforeEach(bootstrapDiagram());

  beforeEach(inject(function(canvas) {

    canvas.addShape({ id: '1', type: 'FOOO', x: 10, y: 20, width: 40, height: 40 });
    canvas.addShape({ id: '2', type: 'BAR', x: 100, y: 200, width: 40, height: 40 });
  }));


  describe('add', function() {

    it('should wire element', inject(function(elementRegistry, canvas) {

      // when
      canvas.addShape({ id: '3', type: 'XXX', x: 300, y: 300, width: 50, height: 50 });

      // then
      var shape = elementRegistry.get('3'),
          gfx = elementRegistry.getGraphics(shape);

      expect(shape).to.exist;
      expect(gfx).to.exist;
    }));

  });


  describe('remove', function() {

    it('should wire element', inject(function(elementRegistry, canvas) {

      // when
      canvas.removeShape('1');

      // then
      var shape = elementRegistry.get('1'),
          gfx = elementRegistry.getGraphics('1');

      expect(shape).not.to.exist;
      expect(gfx).not.to.exist;
    }));

  });


  describe('updateId', function() {

    it('should update id', inject(function(elementRegistry) {

      // given
      var oldId = '1',
          newId = '56';

      var shape = elementRegistry.get(oldId);

      // when
      elementRegistry.updateId(shape, newId);

      // then
      var shapeByOldId = elementRegistry.get(oldId),
          gfxByOldId = elementRegistry.getGraphics(oldId);

      var shapeByNewId = elementRegistry.get(newId),
          gfxByNewId = elementRegistry.getGraphics(newId);

      expect(shapeByOldId).not.to.exist;
      expect(gfxByOldId).not.to.exist;

      expect(shapeByNewId).to.exist;
      expect(gfxByNewId).to.exist;
    }));


    it('should update by id', inject(function(elementRegistry) {

      // given
      var oldId = '1',
          newId = '56';

      elementRegistry.updateId(oldId, newId);

      // then
      var shapeByOldId = elementRegistry.get(oldId),
          gfxByOldId = elementRegistry.getGraphics(oldId);

      var shapeByNewId = elementRegistry.get(newId),
          gfxByNewId = elementRegistry.getGraphics(newId);

      expect(shapeByOldId).not.to.exist;
      expect(gfxByOldId).not.to.exist;

      expect(shapeByNewId).to.exist;
      expect(gfxByNewId).to.exist;
    }));

  });


  describe('updateGraphics', function() {

    it('should update graphics', inject(function(elementRegistry, graphicsFactory) {

      // given
      var shape = elementRegistry.get('1');
      var newGfx = graphicsFactory.create('shape', shape);

      // when
      var primaryGfx = elementRegistry.updateGraphics(shape, newGfx);

      // then
      expect(primaryGfx).to.be.equal(newGfx);
      expect(elementRegistry.getGraphics(shape)).to.be.equal(newGfx);
    }));


    it('should remove graphics', inject(function(elementRegistry, graphicsFactory) {

      // given
      var shape = elementRegistry.get('1');
      var newGfx = graphicsFactory.create('shape', shape);
      elementRegistry.updateGraphics(shape, newGfx);

      // when
      elementRegistry.updateGraphics(shape, null);

      // then
      expect(elementRegistry.getGraphics(shape)).to.not.exist;
    }));


    it('should update secondary graphics', inject(function(elementRegistry, graphicsFactory) {

      // given
      var shape = elementRegistry.get('1');
      var newGfx = graphicsFactory.create('shape', shape);

      // when
      var secondaryGfx = elementRegistry.updateGraphics(shape, newGfx, true);

      // then
      expect(secondaryGfx).to.be.equal(newGfx);
      expect(elementRegistry.getGraphics(shape, true)).to.be.equal(newGfx);
    }));


    it('should remove secondary graphics', inject(function(elementRegistry, graphicsFactory) {

      // given
      var shape = elementRegistry.get('1');
      var newGfx = graphicsFactory.create('shape', shape);
      elementRegistry.updateGraphics(shape, newGfx, true);

      // assume
      expect(elementRegistry.getGraphics(shape, true)).to.exist;

      // when
      elementRegistry.updateGraphics(shape, null, true);

      // then
      expect(elementRegistry.getGraphics(shape, true)).to.not.exist;
    }));
  });


  describe('getGraphics', function() {

    it('should get by id', inject(function(elementRegistry) {

      // when
      var gfx = elementRegistry.getGraphics('1');

      // then
      expect(gfx).to.exist;
    }));


    it('should get secondary by element', inject(function(elementRegistry, canvas) {

      // when
      var secondaryGfx = elementRegistry.getGraphics(canvas.getRootElement(), true);

      // then
      expect(secondaryGfx).to.exist;
    }));

  });


  describe('get', function() {

    it('should get by id', inject(function(elementRegistry) {

      // when
      var shape = elementRegistry.get('1');

      // then
      expect(shape).to.exist;
      expect(shape.id).to.equal('1');
    }));


    it('should get by graphics', inject(function(elementRegistry) {

      // given
      var gfx = elementRegistry.getGraphics('1');

      // when
      var shape = elementRegistry.get(gfx);

      // then
      expect(shape).to.exist;
      expect(shape.id).to.equal('1');
    }));

  });


  describe('getAll', function() {

    it('should return all', inject(function(elementRegistry) {

      // when
      var elements = elementRegistry.getAll();

      // then
      // two shapes + root
      expect(elements.length).to.equal(3);
    }));

  });


  describe('filter', function() {

    it('should noop, returning all', inject(function(elementRegistry) {

      // when
      var elements = elementRegistry.filter(function(element, gfx) {

        // assume we get element and gfx as params
        expect(element).to.exist;
        expect(gfx).to.exist;

        return true;
      });

      // then
      // two shapes + root
      expect(elements.length).to.equal(3);
    }));


    it('should filtered', inject(function(elementRegistry) {

      // when
      var elements = elementRegistry.filter(function(s, gfx) {
        return s.type === 'FOOO';
      });

      // then
      expect(elements.length).to.equal(1);
      expect(elements[0].type).to.equal('FOOO');
    }));

  });


  describe('find', function() {

    it('should find by id', inject(function(elementRegistry) {

      // when
      var element = elementRegistry.find(function(element) {

        // assume we get element as params
        expect(element).to.exist;

        return element.id === '2';
      });

      // then
      expect(element).to.exist;
      expect(element.id).to.equal('2');
    }));


    it('should find by type', inject(function(elementRegistry) {

      // when
      var element = elementRegistry.find(function(element) {

        // assume we get element as params
        expect(element).to.exist;

        return element.type === 'FOOO';
      });

      // then
      expect(element).to.exist;
      expect(element.id).to.equal('1');
    }));


    it('should find by graphics', inject(function(elementRegistry) {

      // when
      var element = elementRegistry.find(function(element, gfx) {

        // assume we get element and gfx as params
        expect(element).to.exist;
        expect(gfx).to.exist;

        return gfx === elementRegistry.getGraphics('2');
      });

      // then
      expect(element).to.exist;
      expect(element.id).to.equal('2');
    }));


    it('should not find if not present', inject(function(elementRegistry) {

      // when
      var element = elementRegistry.find(function(element) {

        // assume we get element
        expect(element).to.exist;

        return element.id === '3';
      });

      // then
      expect(element).to.not.exist;
    }));

  });


  describe('forEach', function() {

    it('should iterate over all', inject(function(elementRegistry) {

      // when
      var elements = [];

      elementRegistry.forEach(function(element, gfx) {
        elements.push(element);

        // assume we get element and gfx as params
        expect(element).to.exist;
        expect(gfx).to.exist;
      });

      // then
      // two shapes + root
      expect(elements.length).to.equal(3);
    }));

  });

});
