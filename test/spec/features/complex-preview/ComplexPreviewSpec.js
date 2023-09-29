import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import complexPreviewModule from 'lib/features/complex-preview';
import modelingModule from 'lib/features/modeling';
import rendererModule from '../preview-support/renderer';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

var testModules = [
  complexPreviewModule,
  modelingModule,
  rendererModule
];


describe('features/complex-preview - ComplexPreviewSpec', function() {

  var root,
      shape1,
      shape2,
      shape3,
      connection,
      newShape;

  function setupDiagram(elementFactory, canvas) {
    root = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(root);

    shape1 = elementFactory.createShape({
      id: 'shape1',
      x: 0,
      y: 0,
      width: 100,
      height: 100
    });

    canvas.addShape(shape1, root);

    shape2 = elementFactory.createShape({
      id: 'shape2',
      x: 200,
      y: 0,
      width: 100,
      height: 100
    });

    canvas.addShape(shape2, root);

    shape3 = elementFactory.createShape({
      id: 'shape3',
      x: 0,
      y: 200,
      width: 100,
      height: 100
    });

    canvas.addShape(shape3, root);

    connection = elementFactory.createConnection({
      id: 'connection',
      source: shape1,
      target: shape2,
      waypoints: [
        { x: 100, y: 50 },
        { x: 200, y: 50 }
      ],
      marker: {
        start: true,
        end: true
      }
    });

    canvas.addConnection(connection, root);

    newShape = elementFactory.createShape({
      id: 'newShape',
      x: 400,
      y: 0,
      width: 100,
      height: 100
    });
  }


  beforeEach(bootstrapDiagram({
    modules: testModules
  }));

  beforeEach(inject(setupDiagram));


  beforeEach(inject(function(complexPreview) {
    complexPreview.create({
      created: [
        newShape
      ],
      removed: [
        shape1,
        connection
      ],
      moved: [
        {
          element: shape2,
          delta: {
            x: 100,
            y: 100
          }
        }
      ],
      resized: [
        {
          shape: shape3,
          bounds: {
            x: 0,
            y: 200,
            width: 200,
            height: 200
          }
        }
      ]
    });
  }));


  it('should create preview', inject(function(canvas) {

    // then
    const layer = canvas.getLayer('complex-preview');

    expect(layer).to.exist;

    // created or removed (1 preview)
    expect(queryPreview('newShape', layer)).to.have.length(1);
    expect(queryPreview('connection', layer)).to.have.length(1);
    expect(queryPreview('shape1', layer)).to.have.length(1);

    // moved (2 previews)
    expect(queryPreview('shape2', layer)).to.have.length(2);

    // resized (2 previews)
    expect(queryPreview('shape3', layer)).to.have.length(2);
  }));


  it('should clone markers', inject(function(canvas) {

    // then
    expect(domQueryAll('marker.djs-dragging', canvas.getContainer())).to.have.length(2);

    expect(domQuery('marker#marker-start-djs-dragging-clone', canvas.getContainer())).to.exist;
    expect(domQuery('marker#marker-end-djs-dragging-clone', canvas.getContainer())).to.exist;
  }));


  it('should clean up preview', inject(function(canvas, complexPreview) {

    // when
    complexPreview.cleanUp();

    // then
    const layer = canvas.getLayer('complex-preview');

    expect(layer).to.exist;

    expect(layer.childNodes).to.have.length(0);
  }));

});

function queryPreview(id, layer) {
  return domQueryAll('[data-complex-preview-element-id="' + id + '"]', layer);
}