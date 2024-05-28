// eslint-disable-next-line import/no-unresolved
import Fuse from 'fuse.js/min-basic';

const options = {
  threshold: 0.25,
  keys: [
    'description',
    'label',
    'search'
  ]
};

export function searchEntries(entries, value) {
  if (!value) {
    return entries.filter(entry => (entry.rank || 0) >= 0);
  }

  const fuse = new Fuse(entries.filter(entry => entry.searchable !== false), options);

  const result = fuse.search(value);

  return result.map(({ item }) => item);
}