import {
  html,
  useMemo
} from '../../ui';

import PopupMenuItem from './PopupMenuItem';

/**
 * Component that renders a popup menu entry list.
 *
 * @param {Array} entries
 * @param {Object} selectedEntry
 * @param {function} setSelectedEntry
 * @param {Object} resultsRef
 */

export default function PopupMenuList(props) {
  const {
    selectedEntry,
    setSelectedEntry,
    onSelect,
    resultsRef,
    entries
  } = props;

  const groups = useMemo(() => groupEntries(entries), [ entries ]);

  return (html`
    <div class="results" ref=${ resultsRef }>
      ${ groups.map(group => html`
        ${ group && group.name && html`
          <div key=${ group.id } class="entry-header">
            ${group.name}
          </div>
        ` }
        <ul class="group" data-group=${ group.id }>
        ${ group.entries.map(entry => html`
          <${PopupMenuItem}
            key=${ entry.id }
            entry=${ entry }
            selected=${ entry === selectedEntry }
            onMouseEnter=${ () => setSelectedEntry(entry) }
            onClick=${ event => onSelect(event, entry) }
          />
        `) }
        </ul>
      `) }
    </div>
  `);
}


// helpers
function groupEntries(entries) {
  const groups = [];

  const getGroup = group => groups.find(elem => group.id === elem.id);

  const containsGroup = group => !!getGroup(group);

  // legacy support for provider built for the old popUp menu
  const formatGroup = group =>
    typeof group === 'string' ? { id: group } : group;

  entries.forEach(entry => {

    // assume a default group when none is provided
    const group = entry.group ? formatGroup(entry.group) : { id: 'default' };

    if (!containsGroup(group)) {
      groups.push({ ...group, entries: [ entry ] });
    } else {
      getGroup(group).entries.push(entry);
    }
  });

  return groups;
}