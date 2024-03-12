import translate from './translate.js';

translate('foo {{bar}}', { bar: 'baz' });
translate('foo {{bar}}');