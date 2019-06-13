import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import translateModule from 'lib/i18n/translate';
import customTranslateModule from './custom-translate';


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


    it('should handle missing replacement', inject(function(translate) {
      expect(translate('FOO {bar}!', {})).to.eql('FOO {bar}!');
    }));


    it('should escape HTML per default', inject(function(translate) {
      expect(translate('<b>Bold</b> statement', {})).to.eql('&lt;b&gt;Bold&lt;/b&gt; statement');
    }));


    it('should not escape HTML for safe=true', inject(function(translate) {
      expect(translate('<b>Bold</b> statement', true)).to.eql('<b>Bold</b> statement');
      expect(translate('<b>Bold</b> statement', {}, true)).to.eql('<b>Bold</b> statement');
    }));

  });


  describe('custom translate / override', function() {

    beforeEach(bootstrapDiagram({ modules: [ translateModule, customTranslateModule ] }));

    it('should override translate', inject(function(translate) {
      expect(translate('Remove')).to.eql('Eliminar');
    }));

  });

});