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


    it('should use default translation', inject(function(translate) {
      expect(translate('FOO_BAR', 'FOO BAR')).to.eql('FOO BAR');
    }));


    it('should replace patterns', inject(function(translate) {
      expect(translate('FOO_BAR', 'FOO {bar}!', { bar: 'BAR' })).to.eql('FOO BAR!');
    }));


    it('should handle missing replacement', inject(function(translate) {
      expect(translate('FOO_BAR', 'FOO {bar}!')).to.eql('FOO {bar}!');
    }));


    it('should NOT escape', inject(function(translate) {
      expect(translate('FOO_BAR', '<div />')).to.eql('<div />');
    }));

  });


  describe('custom translate / override', function() {

    beforeEach(bootstrapDiagram({ modules: [ translateModule, customTranslateModule ] }));

    it('should override translate', inject(function(translate) {
      expect(translate('REMOVE', 'Remove')).to.eql('Entfernen');
      expect(translate('CREATE_ELEMENT', 'Create {element}', { element: 'Foo' })).to.eql('Foo erzeugen');
    }));

  });

});