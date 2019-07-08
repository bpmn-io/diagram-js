/* global sinon */

import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import {
  classes as svgClasses
} from 'tiny-svg';

var spy = sinon.spy;


describe('GraphicsFactory', function() {

  beforeEach(bootstrapDiagram());


  it('should not fail on update root shape', inject(
    function(canvas, graphicsFactory, elementRegistry) {

      // given
      var root = canvas.getRootElement();
      var gfx = elementRegistry.getGraphics(root);

      // when
      graphicsFactory.update('shape', root, gfx);

      // then
      // expect not to throw an exception
    }
  ));


  describe('#updateContainments', function() {

    var parent;

    beforeEach(inject(function(canvas, elementFactory) {
      var root = elementFactory.createRoot({
        id: 'root'
      });

      canvas.setRootElement(root);

      parent = elementFactory.createShape({
        id: 'parent',
        x: 100,
        y: 100,
        width: 100,
        height: 100
      });

      canvas.addShape(parent, root);

      var child = elementFactory.createShape({
        id: 'child',
        x: 125,
        y: 125,
        width: 50,
        height: 50
      });

      canvas.addShape(child, parent);
    }));


    it('should NOT update containments if less than two children', inject(
      function(elementRegistry, graphicsFactory) {

        // given
        var getGraphicsSpy = spy(elementRegistry, 'getGraphics');

        // when
        graphicsFactory.updateContainments([ parent ]);

        // then
        expect(getGraphicsSpy).not.to.have.been.called;
      }
    ));

  });


  it('should add <djs-frame> class to frames', inject(
    function(canvas, graphicsFactory, elementFactory) {

      // given
      var root = canvas.getRootElement();
      var element = elementFactory.createShape({
        id: 'frameShape',
        isFrame: true,
        parent: root
      });

      // when
      var gfx = graphicsFactory.create('shape', element);

      // then
      expect(svgClasses(gfx).has('djs-frame')).to.equal(true);
    }));

});
