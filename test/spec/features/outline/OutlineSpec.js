import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import selectionModule from 'lib/features/selection';

import {
  query as domQuery
} from 'min-dom';

import {
  classes as svgClasses,
  create as svgCreate,
  attr as svgAttr
} from 'tiny-svg';


describe('features/outline/Outline', function() {

  beforeEach(bootstrapDiagram({ modules: [ selectionModule ] }));

  it('should expose API', inject(function(outline) {

    expect(outline).to.exist;
    expect(outline.updateShapeOutline).to.exist;
  }));


  describe('select', function() {

    it('should add outline to shape', inject(function(selection, canvas, elementRegistry) {

      // given
      var shape = canvas.addShape({
        id: 'test',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });

      // when
      selection.select(shape);

      // then
      var gfx = elementRegistry.getGraphics(shape);
      var outline = domQuery('.djs-outline', gfx);

      expect(outline).to.exist;

      expect(svgAttr(outline, 'x')).to.exist;

      // outline class is set
      expect(svgClasses(gfx).has('selected')).to.be.true;
    }));


    it('should add outline to connection', inject(function(selection, canvas, elementRegistry) {

      // given
      var connection = canvas.addConnection({ id: 'select1', waypoints: [ { x: 25, y: 25 }, { x: 115, y: 115 } ] });

      // when
      selection.select(connection);

      // then
      var gfx = elementRegistry.getGraphics(connection);
      var outline = domQuery('.djs-outline', gfx);

      expect(outline).to.exist;

      expect(svgAttr(outline, 'x')).to.exist;

      // outline class is set
      expect(svgClasses(gfx).has('selected')).to.be.true;
    }));

  });


  describe('deselect', function() {

    it('should remove outline class from shape', inject(function(selection, canvas, elementRegistry) {

      // given
      var shape = canvas.addShape({
        id: 'test',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });

      // when
      selection.select(shape);
      selection.deselect(shape);

      // then
      var gfx = elementRegistry.getGraphics(shape);
      var outline = domQuery('.djs-outline', gfx);

      expect(outline).to.exist;
      expect(svgClasses(gfx).has('selected')).to.be.false; // Outline class is not set
    }));
  });


  describe('providers', function() {

    class Provider {
      getOutline(element) {
        if (element === 'A') {
          return svgCreate('circle');
        } else if (element === 'B') {
          return svgCreate('rect');
        }
      }

      updateOutline(element, gfx) {

        // noop
      }
    }

    it('should register provider', inject(function(outline) {

      // given
      var provider = new Provider();

      // when
      outline.registerProvider(provider);

      // then
      expect(function() {
        outline.registerProvider(provider);
      }).not.to.throw;
    }));


    it('should get outline', inject(function(outline) {

      // given
      var provider = new Provider();

      outline.registerProvider(provider);

      // when
      var outlineElement = outline.getOutline('A');

      // then
      expect(outlineElement).to.exist;
      expect(outlineElement.tagName).to.equal('circle');
    }));


    it('missing provider API', inject(function(outline) {

      // given
      var provider = {};

      // when
      outline.registerProvider(provider);

      // then
      expect(outline.getOutline('FOO')).to.be.undefined;
    }));


    it('should set default outline if not provided', inject(function(outline, canvas, selection, elementRegistry) {

      // given
      var provider = new Provider();
      outline.registerProvider(provider);

      var shape = canvas.addShape({
        id: 'test',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });

      // when
      selection.select(shape);

      // then
      expect(outline.getOutline(shape)).to.not.exist;

      var gfx = elementRegistry.getGraphics(shape);
      var outlineShape = domQuery('.djs-outline', gfx);
      expect(outlineShape).to.exist;
      expect(svgClasses(gfx).has('selected')).to.be.true;
    }));


    it('multiple providers', inject(function(outline, canvas, selection, elementRegistry) {
      class OtherProvider {
        getOutline(element) {
          if (element === 'A') {
            return svgCreate('rect');
          }
        }
      }

      // given
      var provider = new Provider();
      var otherProvider = new OtherProvider();

      outline.registerProvider(500, provider);
      outline.registerProvider(1500, otherProvider);

      // when
      var outlineElement = outline.getOutline('A');

      // then
      expect(outlineElement.tagName).to.equal('rect');
    }));
  });
});
