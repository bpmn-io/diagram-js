import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper.js';

import translateModule from 'diagram-js/lib/i18n/translate/index.js';
import customTranslateModule from './custom-translate/index.js';


describe('i18n - translate', function() {

  describe('basics', function() {

    beforeEach(bootstrapDiagram({ modules: [ translateModule ] }));


    it('should provide translate helper', inject(function(translate) {
      expect(translate).to.be.a('function');
    }));


    it('should pass through', inject(function(translate) {
      expect(translate('FOO BAR')).to.eql('FOO BAR');
    }));


    it('should replace patterns', inject(function(translate) {
      expect(translate('FOO {bar}!', { bar: 'BAR' })).to.eql('FOO BAR!');
    }));


    it('should handle missing replacement', inject(function(translate) {
      expect(translate('FOO {bar}!')).to.eql('FOO {bar}!');
    }));


    it('should NOT escape', inject(function(translate) {
      expect(translate('<div />')).to.eql('<div />');
    }));


    it('should handle missing replacement', inject(function(translate) {
      expect(translate('FOO {bar}!', {})).to.eql('FOO {bar}!');
    }));

  });


  describe('custom translate / override', function() {

    beforeEach(bootstrapDiagram({ modules: [ translateModule, customTranslateModule ] }));

    it('should override translate', inject(function(translate) {
      expect(translate('Remove')).to.eql('Eliminar');
    }));

  });

});