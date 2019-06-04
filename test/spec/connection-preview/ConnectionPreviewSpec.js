import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import TestContainer from 'mocha-test-container-support';

import modelingModule from 'lib/features/modeling';
import connectionPreviewModule from 'lib/features/connection-preview';

import BaseLayouter from 'lib/layout/BaseLayouter';
import CroppingConnectionDocking from 'lib/layout/CroppingConnectionDocking';

import {
  query as domQuery
} from 'min-dom';
import { isDefined } from 'min-dash';

import { getMid } from '../../../lib/layout/LayoutUtil';

var testModules = [
  modelingModule,
  connectionPreviewModule
];


describe('features/connection-preview', function() {

  var rootShape, shape1, shape2, shape3;

  function setupDiagram(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    shape1 = elementFactory.createShape({
      id: 'shape1',
      type: 'A',
      x: 100, y: 100, width: 300, height: 300
    });

    canvas.addShape(shape1, rootShape);

    shape2 = elementFactory.createShape({
      id: 'shape2',
      type: 'A',
      x: 500, y: 100, width: 100, height: 100
    });

    canvas.addShape(shape2, rootShape);

    shape3 = elementFactory.createShape({
      id: 'shape3',
      type: 'B',
      x: 500, y: 400, width: 100, height: 100
    });

    canvas.addShape(shape3, rootShape);

  }


  beforeEach(bootstrapDiagram({
    modules: testModules
  }));

  beforeEach(inject(setupDiagram));

  var testContainer;

  beforeEach(function() {
    testContainer = TestContainer.get(this);
  });


  describe('basics', function() {

    it('should display preview between shapes', inject(function(connectionPreview) {

      // given
      var context = {},
          hints = {
            source: shape1,
            target: shape2
          };

      // when
      connectionPreview.drawPreview(context, true, hints);

      var preview = domQuery('.djs-connection-preview', testContainer);

      // then
      expect(preview).to.exist;
      expect(preview.childNodes).to.have.lengthOf(1);
    }));


    it('should display preview between points', inject(function(connectionPreview) {

      // given
      var context = {},
          hints = {
            connectionStart: { x: 0, y: 0 },
            connectionEnd: { x: 100, y: 100 }
          };

      // when
      connectionPreview.drawPreview(context, true, hints);

      var preview = domQuery('.djs-connection-preview', testContainer);

      // then
      expect(preview).to.exist;
      expect(preview.childNodes).to.have.lengthOf(1);
    }));


    it('should remove preview', inject(function(connectionPreview) {

      // given
      var context = {},
          hints = {
            source: shape1,
            target: shape2
          };

      // when
      connectionPreview.drawPreview(context, true, hints);
      connectionPreview.cleanUp(context);

      var preview = domQuery('.djs-connection-preview', testContainer);

      // then
      expect(preview).not.to.exist;
    }));

  });


  describe('noop connection', function() {

    it('should display noop connection by default preview', inject(function(connectionPreview) {

      // given
      var context = {},
          hints = {
            source: shape1,
            target: shape2
          };

      // when
      connectionPreview.drawPreview(context, false, hints);

      var preview = domQuery('.djs-connection-preview', testContainer);

      // then
      expect(preview).to.exist;
      expect(preview.childNodes).to.have.lengthOf(1);
    }));


    it('should not display noop connection if disabled via config', inject(function(connectionPreview) {

      // given
      var context = {},
          hints = {
            source: shape1,
            target: shape2,
            noNoop: true
          };

      // when
      connectionPreview.drawPreview(context, false, hints);

      var preview = domQuery('.djs-connection-preview', testContainer);

      // then
      expect(preview).to.exist;
      expect(preview.childNodes).to.have.lengthOf(0);
    }));

  });


  describe('connection cropping', function() {

    beforeEach(bootstrapDiagram({
      modules: testModules.concat({
        connectionDocking: [ 'type', CroppingConnectionDocking ]
      })
    }));

    beforeEach(inject(setupDiagram));


    it('should crop the connection preview', inject(function(connectionPreview) {

      // given
      var context = {},
          hints = {
            source: shape1,
            target: shape2
          };

      // when
      connectionPreview.drawPreview(context, true, hints);

      var connection = context.getConnection(true),
          waypoints = connection.waypoints;

      // then
      expect(waypoints).to.have.lengthOf(2);
      expect(waypoints[0]).to.have.property('original');
      expect(waypoints[1]).to.have.property('original');
    }));


    it('should still work when connecting two points', inject(function(connectionPreview) {

      // given
      var context = {},
          hints = {
            connectionStart: { x: 0, y: 0 },
            connectionEnd: { x: 100, y: 100 }
          };

      // when
      connectionPreview.drawPreview(context, true, hints);

      var connection = context.getConnection(true),
          waypoints = connection.waypoints;

      // then
      expect(waypoints).to.have.lengthOf(2);
      expect(waypoints.every(isDefined)).to.be.true;
    }));


    it('should not crop if explicitly disallowed', inject(function(connectionPreview) {

      // given
      var context = {},
          hints = {
            source: shape1,
            target: shape2,
            noCropping: true
          };

      // when
      connectionPreview.drawPreview(context, true, hints);

      var connection = context.getConnection(true),
          waypoints = connection.waypoints;

      // then
      expect(waypoints).to.have.lengthOf(2);
      expect(waypoints).to.eql([
        getMid(shape1),
        getMid(shape2)
      ]);
    }));

  });


  describe('layouting', function() {

    beforeEach(bootstrapDiagram({
      modules: testModules.concat({
        layouter: [ 'type', BaseLayouter ]
      })
    }));

    beforeEach(inject(setupDiagram));


    it('should layout the connection preview', inject(function(layouter, connectionPreview) {

      // given
      var context = {},
          hints = {
            source: shape1,
            target: shape2
          };

      // when
      connectionPreview.drawPreview(context, true, hints);

      var connection = context.getConnection(true),
          waypoints = connection.waypoints;

      // then
      expect(waypoints).to.have.lengthOf(2);
      expect(waypoints.every(isDefined)).to.be.true;
    }));


    it('should not layout connection preview if disabled', inject(function(connectionPreview) {

      // given
      var context = {},
          hints = {
            source: shape1,
            target: shape2,
            noLayout: true
          };

      // when
      connectionPreview.drawPreview(context, true, hints);

      var connection = context.getConnection(true),
          waypoints = connection.waypoints;

      // then
      expect(waypoints).to.have.lengthOf(2);
      expect(waypoints.every(isDefined)).to.be.true;
    }));

  });

});
