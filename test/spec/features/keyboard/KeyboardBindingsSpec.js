import {
  KEYS_UNDO,
  KEYS_REDO,
  KEYS_COPY,
  KEYS_PASTE
} from 'lib/features/keyboard/KeyboardBindings';


describe('features/keyboard - KeyboardBindings', function() {

  it('should provide legacy KEYS_* exports', function() {
    expect(KEYS_UNDO).to.exist;
    expect(KEYS_REDO).to.exist;
    expect(KEYS_COPY).to.exist;
    expect(KEYS_PASTE).to.exist;
  });

});