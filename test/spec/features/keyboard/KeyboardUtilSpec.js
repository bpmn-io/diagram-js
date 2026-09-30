import { expect } from 'chai';

import {
  isKey,
  isUndo,
  isRedo,
  isCopy
} from 'lib/features/keyboard/KeyboardUtil';


describe('features/keyboard - KeyboardUtil', function() {

  function keyEvent(key, code, attrs) {
    return {
      key: key,
      code: code,
      ctrlKey: !!(attrs && attrs.ctrlKey),
      shiftKey: !!(attrs && attrs.shiftKey),
      keyCode: attrs && attrs.keyCode,
      altKey: false,
      metaKey: false
    };
  }


  describe('isKey', function() {

    it('should match logical key', function() {
      expect(isKey('z', keyEvent('z', 'KeyZ'))).to.be.true;
    });


    it('should match code', function() {
      expect(isKey('Space', keyEvent(' ', 'Space'))).to.be.true;
    });


    it('should match logical key on QWERTZ layout', function() {

      // physical Y key produces <z> on German layout
      expect(isKey('z', keyEvent('z', 'KeyY'))).to.be.true;
      expect(isKey('y', keyEvent('z', 'KeyY'))).to.be.false;
    });


    it('should match physical key on non-Latin layout', function() {

      // Cyrillic
      expect(isKey('z', keyEvent('я', 'KeyZ'))).to.be.true;
      expect(isKey('Z', keyEvent('Я', 'KeyZ', { shiftKey: true }))).to.be.true;

      // Arabic
      expect(isKey('c', keyEvent('ؤ', 'KeyC'))).to.be.true;

      // Adlam (outside of Basic Multilingual Plane)
      expect(isKey('a', keyEvent('\u{1E922}', 'KeyA'))).to.be.true;
    });


    it('should match logical key on Latin layout with non-ASCII letters', function() {

      // Turkish Q: <ı> (dotless i) on physical I key
      expect(isKey('i', keyEvent('ı', 'KeyI'))).to.be.false;
      expect(isKey('ı', keyEvent('ı', 'KeyI'))).to.be.true;

      // letters shared with Latin orthographies
      expect(isKey('z', keyEvent('\u02BC', 'KeyZ'))).to.be.false;
      expect(isKey('z', keyEvent('\u02BB', 'KeyZ'))).to.be.false;
    });


    it('should not match physical key for non-letter character', function() {

      // AZERTY: <,> on physical M key
      expect(isKey('m', keyEvent(',', 'KeyM'))).to.be.false;
    });


    it('should not match physical key for multi-character key', function() {
      expect(isKey('z', keyEvent('Unidentified', 'KeyZ'))).to.be.false;
    });


    it('should not match non-letter physical key on non-Latin layout', function() {

      // Cyrillic <ж> on physical Semicolon key
      expect(isKey('z', keyEvent('ж', 'Semicolon'))).to.be.false;
      expect(isKey(';', keyEvent('ж', 'Semicolon'))).to.be.false;
    });


    it('should not match without code on non-Latin layout', function() {
      expect(isKey('z', keyEvent('я'))).to.be.false;
    });


    it('should match physical key for shifted symbol on non-Latin layout', function() {

      // Arabic (101): <~> on <Shift> + physical Z key
      expect(isKey('Z', keyEvent('~', 'KeyZ', { shiftKey: true, keyCode: 90 }))).to.be.true;
    });


    it('should not match physical key for shifted symbol on Latin layout', function() {

      // Dvorak: <:> on <Shift> + physical Z key
      expect(isKey('Z', keyEvent(':', 'KeyZ', { shiftKey: true, keyCode: 186 }))).to.be.false;

      // AZERTY: <?> on <Shift> + physical M key
      expect(isKey('M', keyEvent('?', 'KeyM', { shiftKey: true, keyCode: 188 }))).to.be.false;
    });


    it('should not match physical key for shifted symbol without keyCode', function() {
      expect(isKey('Z', keyEvent('~', 'KeyZ', { shiftKey: true }))).to.be.false;
    });


    it('should not match physical key for unshifted symbol', function() {

      // Greek: <;> on physical Q key
      expect(isKey('q', keyEvent(';', 'KeyQ', { keyCode: 81 }))).to.be.false;
    });

  });


  describe('undo / redo', function() {

    it('US layout', function() {
      expect(isUndo(keyEvent('z', 'KeyZ', { ctrlKey: true }))).to.be.true;
      expect(isRedo(keyEvent('z', 'KeyZ', { ctrlKey: true }))).to.be.false;

      expect(isRedo(keyEvent('y', 'KeyY', { ctrlKey: true }))).to.be.true;
      expect(isUndo(keyEvent('y', 'KeyY', { ctrlKey: true }))).to.be.false;
    });


    it('German layout', function() {
      expect(isUndo(keyEvent('z', 'KeyY', { ctrlKey: true }))).to.be.true;
      expect(isRedo(keyEvent('z', 'KeyY', { ctrlKey: true }))).to.be.false;

      expect(isRedo(keyEvent('y', 'KeyZ', { ctrlKey: true }))).to.be.true;
      expect(isUndo(keyEvent('y', 'KeyZ', { ctrlKey: true }))).to.be.false;
    });


    it('Cyrillic layout', function() {
      expect(isUndo(keyEvent('я', 'KeyZ', { ctrlKey: true }))).to.be.true;
      expect(isRedo(keyEvent('я', 'KeyZ', { ctrlKey: true }))).to.be.false;

      expect(isRedo(keyEvent('н', 'KeyY', { ctrlKey: true }))).to.be.true;
      expect(isUndo(keyEvent('н', 'KeyY', { ctrlKey: true }))).to.be.false;

      expect(isRedo(keyEvent('Я', 'KeyZ', { ctrlKey: true, shiftKey: true }))).to.be.true;
    });


    it('Arabic layout', function() {
      expect(isUndo(keyEvent('ئ', 'KeyZ', { ctrlKey: true }))).to.be.true;
      expect(isRedo(keyEvent('غ', 'KeyY', { ctrlKey: true }))).to.be.true;

      expect(isRedo(keyEvent('~', 'KeyZ', { ctrlKey: true, shiftKey: true, keyCode: 90 }))).to.be.true;
      expect(isUndo(keyEvent('~', 'KeyZ', { ctrlKey: true, shiftKey: true, keyCode: 90 }))).to.be.false;
    });


    it('Dvorak layout', function() {

      // Dvorak Z is on physical Slash key
      expect(isRedo(keyEvent('Z', 'Slash', { ctrlKey: true, shiftKey: true, keyCode: 90 }))).to.be.true;

      expect(isRedo(keyEvent(':', 'KeyZ', { ctrlKey: true, shiftKey: true, keyCode: 186 }))).to.be.false;
    });

  });


  describe('copy', function() {

    it('Cyrillic layout', function() {
      expect(isCopy(keyEvent('с', 'KeyC', { ctrlKey: true }))).to.be.true;
    });

  });

});
