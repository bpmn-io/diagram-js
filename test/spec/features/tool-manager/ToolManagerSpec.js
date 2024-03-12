import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper.js';

import {
  createCanvasEvent as canvasEvent
} from '../../../util/MockEvents.js';

import toolManagerModule from 'lib/features/tool-manager/index.js';
import handToolModule from 'lib/features/hand-tool/index.js';
import draggingModule from 'lib/features/dragging/index.js';


describe('features/tool-manager', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      toolManagerModule,
      handToolModule,
      draggingModule
    ]
  }));

  beforeEach(inject(function(dragging) {
    dragging.setOptions({ manual: true });
  }));


  describe('basics', function() {

    it('should register a tool', inject(function(toolManager) {

      // when
      toolManager.registerTool('lasso', {
        tool: 'lasso.selection',
        dragging: 'lasso'
      });

      // then
      expect(toolManager.length()).to.equal(2);
    }));


    it('should throw error when registering a tool without events', inject(function(toolManager) {

      // when
      function result() {
        toolManager.registerTool('hand');
      }

      // then
      expect(result).to.throw('A tool has to be registered with it\'s "events"');
    }));


    it('should have hand-tool as active', inject(function(toolManager, handTool) {

      // when
      handTool.activateHand(canvasEvent({ x: 150, y: 150 }));

      expect(toolManager.isActive('hand')).to.be.true;
    }));


    it('should have no active tool', inject(function(toolManager, handTool, dragging) {

      // when
      handTool.activateHand(canvasEvent({ x: 150, y: 150 }));

      dragging.end();

      expect(toolManager.isActive('hand')).to.be.false;
    }));

  });

});
