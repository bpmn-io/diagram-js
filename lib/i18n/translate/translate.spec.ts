import translate from './translate';

translate('FOO_BAR', 'Foo bar');
translate('FOO_BAR', 'Foo { bar }', { bar: 'baz' });