import { TranslateFunction } from './translate';

const translate: TranslateFunction = (template, replacements) => {
  for (let replacement in replacements) {
    console.log(replacement, replacements[ replacement ]);
  }

  return template;
};

translate('foo {{bar}}', { bar: 'baz' });