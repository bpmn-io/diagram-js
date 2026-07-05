import { expect } from 'chai';

import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import outlineModule from 'lib/features/outline';

import {
  query as domQuery
} from 'min-dom';

import {
  create as svgCreate,
  attr as svgAttr
} from 'tiny-svg';


describe('features/outline - Outline', function() {

  beforeEach(bootstrapDiagram({ modules: [ outlineModule ] }));


  it('should expose API', inject(function(outline) {
    expect(outline).to.exist;
    expect(outline.updateShapeOutline).to.exist;
    expect(outline.createOutline).to.exist;
  }));


  describe('lazy creation', function() {

    it('should not create outline on shape added', inject(
      function(canvas, elementRegistry) {

        // when
        var shape = canvas.addShape({
          id: 'test',
          x: 10,
          y: 10,
          width: 100,
          height: 100
        });

        // then
        var gfx = elementRegistry.getGraphics(shape);

        expect(domQuery('.djs-outline', gfx)).not.to.exist;
      }
    ));


    it('should not create outline on connection added', inject(
      function(canvas, elementRegistry) {

        // when
        var connection = canvas.addConnection({
          id: 'connection',
          waypoints: [ { x: 25, y: 25 }, { x: 115, y: 115 } ]
        });

        // then
        var gfx = elementRegistry.getGraphics(connection);

        expect(domQuery('.djs-outline', gfx)).not.to.exist;
      }
    ));


    it('should create outline on hover', inject(
      function(canvas, eventBus, elementRegistry) {

        // given
        var shape = canvas.addShape({
          id: 'test',
          x: 10,
          y: 10,
          width: 100,
          height: 100
        });

        // when
        eventBus.fire('element.hover', { element: shape });

        // then
        var gfx = elementRegistry.getGraphics(shape);

        expect(domQuery('.djs-outline', gfx)).to.exist;
      }
    ));


    it('should create outline only once', inject(
      function(canvas, eventBus, selection, elementRegistry) {

        // given
        var shape = canvas.addShape({
          id: 'test',
          x: 10,
          y: 10,
          width: 100,
          height: 100
        });

        // when
        eventBus.fire('element.hover', { element: shape });
        selection.select(shape);

        // then
        var gfx = elementRegistry.getGraphics(shape);

        expect(gfx.querySelectorAll('.djs-outline')).to.have.length(1);
      }
    ));


    it('should not update outline on change if not yet created', inject(
      function(canvas, eventBus, elementRegistry) {

        // given
        var shape = canvas.addShape({
          id: 'test',
          x: 10,
          y: 10,
          width: 100,
          height: 100
        });

        // when
        eventBus.fire('shape.changed', {
          element: shape,
          gfx: elementRegistry.getGraphics(shape)
        });

        // then
        var gfx = elementRegistry.getGraphics(shape);

        expect(domQuery('.djs-outline', gfx)).not.to.exist;
      }
    ));


    it('should keep created outline in sync on change', inject(
      function(canvas, outline, eventBus, elementRegistry) {

        // given
        var shape = canvas.addShape({
          id: 'test',
          x: 10,
          y: 10,
          width: 100,
          height: 100
        });

        var outlineGfx = outline.createOutline(shape);

        // when
        shape.width = 200;

        eventBus.fire('shape.changed', {
          element: shape,
          gfx: elementRegistry.getGraphics(shape)
        });

        // then
        // width = element.width + offset (5) * 2
        expect(svgAttr(outlineGfx, 'width')).to.eql('210');
      }
    ));


    it('should create outline via #createOutline', inject(
      function(canvas, outline, elementRegistry) {

        // given
        var shape = canvas.addShape({
          id: 'test',
          x: 10,
          y: 10,
          width: 100,
          height: 100
        });

        // when
        var created = outline.createOutline(shape);

        // then
        var gfx = elementRegistry.getGraphics(shape);

        expect(created).to.exist;
        expect(domQuery('.djs-outline', gfx)).to.equal(created);
      }
    ));


    it('should create outline via #createOutline only once', inject(
      function(canvas, outline, elementRegistry) {

        // given
        var shape = canvas.addShape({
          id: 'test',
          x: 10,
          y: 10,
          width: 100,
          height: 100
        });

        // when
        var first = outline.createOutline(shape);
        var second = outline.createOutline(shape);

        // then
        var gfx = elementRegistry.getGraphics(shape);

        expect(second).to.equal(first);
        expect(gfx.querySelectorAll('.djs-outline')).to.have.length(1);
      }
    ));


    it('should return null via #createOutline without graphics', inject(
      function(outline) {

        // when
        var created = outline.createOutline({ id: 'non-existing' });

        // then
        expect(created).to.be.null;
      }
    ));

  });


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
    }));


    it('should not show box for connection', inject(function(selection, canvas, elementRegistry) {

      // given
      var connection = canvas.addConnection({ id: 'select1', waypoints: [ { x: 25, y: 25 }, { x: 115, y: 115 } ] });

      // when
      selection.select(connection);

      // then
      var gfx = elementRegistry.getGraphics(connection);
      var outline = domQuery('.djs-outline', gfx);

      expect(outline).to.exist;
      expect(getComputedStyle(outline).display).to.equal('none');
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
