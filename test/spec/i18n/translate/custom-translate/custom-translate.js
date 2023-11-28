import translate from 'lib/i18n/translate/translate';

export default function customTranslate(id, defaultTranslation, replacements) {
  if (id === 'REMOVE') {
    return translate(id, 'Entfernen', replacements);
  }

  if (id === 'CREATE_ELEMENT') {
    return translate(id, '{element} erzeugen', replacements);
  }

  return translate(id, defaultTranslation, replacements);
}