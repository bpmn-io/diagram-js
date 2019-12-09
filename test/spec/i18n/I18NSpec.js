import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import paletteModule from 'lib/features/palette';
import i18nModule from 'lib/i18n';


describe('i18n', function() {

  describe('events', function() {

    beforeEach(bootstrapDiagram({ modules: [ i18nModule ] }));


    it('should emit i18n.changed event', inject(function(i18n, eventBus) {

      // given
      var listener = sinon.spy();

      eventBus.on('i18n.changed', listener);

      // when
      i18n.changed();

      // then
      expect(listener).to.have.been.called;
    }));

  });


  describe('integration', function() {

    beforeEach(bootstrapDiagram({ modules: [ i18nModule, paletteModule ] }));


    it('should update palette', inject(function(palette, i18n) {

      // given
      var paletteUpdate = sinon.spy(palette, '_update');
      palette._init();

      // when
      i18n.changed();

      // then
      expect(paletteUpdate).to.have.been.called;
    }));

  });

});