import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import selectionModule from 'lib/features/selection';

import {
  matches
} from 'min-dom';


describe('features/selection/HighlightRelated', function() {

  beforeEach(bootstrapDiagram({ modules: [ selectionModule ] }));

  describe('bootstrap', function() {

    beforeEach(bootstrapDiagram({ modules: [ selectionModule ] }));

    it('should bootstrap diagram with component', inject(function() {

    }));

  });

  describe('selection box on related elements', function() {

    var shape, shape2, connection, label, label2;

    beforeEach(inject(function(elementFactory, canvas) {

      // given
      shape = elementFactory.createShape({
        id: 'child',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape);

      shape2 = elementFactory.createShape({
        id: 'child2',
        x: 300, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape2);

      connection = elementFactory.createConnection({
        id: 'connection',
        waypoints: [ { x: 150, y: 150 }, { x: 150, y: 200 }, { x: 350, y: 150 } ],
        source: shape,
        target: shape2
      });

      canvas.addConnection(connection);

      label = elementFactory.createLabel({
        id: 'label',
        x: 100, y: 200, width: 20, height: 20,
        labelTarget: shape
      });

      canvas.addShape(label);

      label2 = elementFactory.createLabel({
        id: 'label2',
        x: 200, y: 200, width: 20, height: 20,
        labelTarget: connection
      });

      canvas.addShape(label2);
    }));

    describe('shapes', function() {

      it('should show box on related label on select',
        inject(function(selection, canvas) {

          // when
          selection.select(shape);

          // then
          var gfx = canvas.getGraphics(label),
              hasOutline = matches(gfx, '.related-selected');

          expect(hasOutline).to.be.true;
        }));


      it('should show box on shape on selecting label',
        inject(function(selection, canvas) {

          // when
          selection.select(label);

          // then
          var gfx = canvas.getGraphics(shape),
              hasOutline = matches(gfx, '.related-selected');

          expect(hasOutline).to.be.true;
        }));
    });


    describe('connection', function() {

      it('should show box on related label on select',
        inject(function(selection, canvas) {

          // when
          selection.select(connection);

          // then
          var gfx = canvas.getGraphics(label2),
              hasOutline = matches(gfx, '.related-selected');

          expect(hasOutline).to.be.true;
        }));


      it('should paler box on connection on selecting label',
        inject(function(selection, canvas) {

          // when
          selection.select(label2);

          // then
          var gfx = canvas.getGraphics(connection),
              hasOutline = matches(gfx, '.related-selected');

          expect(hasOutline).to.be.true;
        }));

    });

  });

});
