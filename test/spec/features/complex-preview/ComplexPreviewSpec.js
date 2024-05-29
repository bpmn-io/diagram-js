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


describe('features/complex-preview', function() {

  var root,
      shape1,
      shape2,
      connection,
      newShape,
      newConnection;

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

    newConnection = elementFactory.createConnection({
      id: 'newConnection',
      source: shape2,
      target: newShape,
      waypoints: [
        { x: 300, y: 50 },
        { x: 400, y: 50 }
      ],
      marker: {
        start: true,
        end: true
      }
    });
  }


  beforeEach(bootstrapDiagram({
    modules: testModules
  }));

  beforeEach(inject(setupDiagram));


  it('should create preview for created shapes and connections', inject(function(canvas, complexPreview) {

    // when
    complexPreview.create({
      created: [
        newConnection,
        newShape
      ]
    });

    // then
    const layer = canvas.getLayer('complex-preview');

    expect(layer).to.exist;

    expect(queryPreview('newConnection', layer)).to.have.length(1);
    expect(queryPreview('newShape', layer)).to.have.length(1);
  }));


  it('should create preview for moved shapes and connections', inject(function(canvas, complexPreview) {

    // when
    complexPreview.create({
      moved: [
        {
          element: shape1,
          delta: { x: 100, y: 100 }
        },
        {
          element: shape2,
          delta: { x: 100, y: 100 }
        },
        {
          element: connection,
          delta: { x: 100, y: 100 }
        }
      ]
    });

    // then
    const layer = canvas.getLayer('complex-preview');

    expect(layer).to.exist;

    expect(queryPreview('connection', layer)).to.have.length(2);
    expect(queryPreview('shape1', layer)).to.have.length(2);
    expect(queryPreview('shape2', layer)).to.have.length(2);
  }));


  it('should create preview for removed shapes and connections', inject(function(canvas, complexPreview) {

    // when
    complexPreview.create({
      removed: [
        shape2,
        connection
      ]
    });

    // then
    const layer = canvas.getLayer('complex-preview');

    expect(layer).to.exist;

    expect(queryPreview('connection', layer)).to.have.length(1);
    expect(queryPreview('shape2', layer)).to.have.length(1);
  }));


  it('should create preview for resized shapes', inject(function(canvas, complexPreview) {

    // when
    complexPreview.create({
      resized: [
        {
          shape: shape2,
          bounds: { x: 200, y: 0, width: 200, height: 200 }
        }
      ]
    });

    // then
    const layer = canvas.getLayer('complex-preview');

    expect(layer).to.exist;

    expect(queryPreview('shape2', layer)).to.have.length(2);
  }));


  it('should clone markers', inject(function(canvas, complexPreview) {

    // when
    complexPreview.create({
      moved: [
        {
          element: shape1,
          delta: { x: 100, y: 100 }
        },
        {
          element: shape2,
          delta: { x: 100, y: 100 }
        },
        {
          element: connection,
          delta: { x: 100, y: 100 }
        }
      ]
    });

    // then
    expect(domQueryAll('marker.djs-dragging', canvas.getContainer())).to.have.length(2);

    expect(domQuery('marker[id^="marker-start-djs-dragging-ps"]', canvas.getContainer())).to.exist;
    expect(domQuery('marker[id^="marker-end-djs-dragging-ps"]', canvas.getContainer())).to.exist;
  }));


  it('should clean up preview', inject(function(canvas, complexPreview) {

    // given
    complexPreview.create({
      moved: [
        {
          element: shape1,
          delta: { x: 100, y: 100 }
        },
        {
          element: shape2,
          delta: { x: 100, y: 100 }
        },
        {
          element: connection,
          delta: { x: 100, y: 100 }
        }
      ]
    });

    // when
    complexPreview.cleanUp();

    // then
    const layer = canvas.getLayer('complex-preview');

    expect(layer).to.exist;

    expect(layer.childNodes).to.have.length(0);
    expect(domQuery('marker[id^="marker-start-djs-dragging-ps"]', canvas.getContainer())).not.to.exist;
    expect(domQuery('marker[id^="marker-end-djs-dragging-ps"]', canvas.getContainer())).not.to.exist;
  }));

});

function queryPreview(id, layer) {
  return domQueryAll('[data-preview-support-element-id="' + id + '"]', layer);
}