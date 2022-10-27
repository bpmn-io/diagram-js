import PopupMenuItem from './PopupMenuItem';

/**
 * Component that renders a popup menu entry list.
 *
 * @param {Array} entries
 * @param {Object} selectedEntry
 * @param {function} setSelectedEntry
 * @param {Object} resultsRef
 * @param {function} html
 */

export default function PopupMenuList(props) {
  const {
    selectedEntry,
    setSelectedEntry,
    onSelect,
    resultsRef,
    html
  } = props;

  const groups = groupEntries(props.entries);

  const entries = groups.map(group => {
    const groupEntries = group.entries;

    return (html`
        ${group.name && group && html`
          <div key=${ group.id } class="entry-header">
            ${group.name}
          </div>
        `}
        <ul class="result-entries" data-group=${ group.id }>
        ${groupEntries.map((entry, idx) => (html`
          <${PopupMenuItem}
            key=${ entry.id }
            entry=${ entry }
            selected=${ entry === selectedEntry }
            onMouseEnter=${ () => setSelectedEntry(entry) }
            onClick=${ event => onSelect(event, entry) }
            html=${ html }
          />
        `))}
        </ul>
      `
    );
  });

  return (html`
    <div class="results" ref=${ resultsRef }>
      ${entries}
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