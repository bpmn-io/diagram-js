import translate from './translate';

translate('foo {{bar}}', { bar: 'baz' });
translate('foo {{bar}}');