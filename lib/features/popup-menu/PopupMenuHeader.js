import classNames from 'clsx';

import {
  html,
  useMemo
} from '../../ui';

/**
 * @typedef {import('./PopupMenuProvider').PopupMenuHeaderEntry} PopupMenuHeaderEntry
 */

/**
 * Component that renders a popup menu header.
 *
 * @param {Object} props
 * @param {PopupMenuHeaderEntry[]} props.headerEntries
 * @param {PopupMenuHeaderEntry} props.selectedEntry
 * @param {(event: MouseEvent, entry: PopupMenuHeaderEntry) => void} props.onSelect
 * @param {(entry: PopupMenuHeaderEntry | null) => void} props.setSelectedEntry
 * @param {string} props.title
 */
export default function PopupMenuHeader(props) {
  const {
    headerEntries,
    onSelect,
    selectedEntry,
    setSelectedEntry,
    title
  } = props;

  const groups = useMemo(() => groupEntries(headerEntries), [ headerEntries ]);

  return html`
    <div class="djs-popup-header">
      <h3 class="djs-popup-title" title=${ title }>${ title }</h3>
      ${ groups.map((group) => html`
        <ul key=${ group.id } class="djs-popup-header-group" data-header-group=${ group.id }>

          ${ group.entries.map(entry => html`
            <li key=${ entry.id }>
              <${ entry.action ? 'button' : 'span' }
                class=${ getHeaderClasses(entry, entry === selectedEntry) }
                onClick=${ event => entry.action && onSelect(event, entry) }
                title=${ entry.title || entry.label }
                data-id=${ entry.id }
                onMouseEnter=${ () => entry.action && setSelectedEntry(entry) }
                onMouseLeave=${ () => entry.action && setSelectedEntry(null) }
                onFocus=${ () => entry.action && setSelectedEntry(entry) }
                onBlur=${ () => entry.action && setSelectedEntry(null) }
              >
                ${(entry.imageUrl && html`<img class="djs-popup-entry-icon" src=${ entry.imageUrl } alt="" />`) ||
                (entry.imageHtml && html`<div class="djs-popup-entry-icon" dangerouslySetInnerHTML=${ { __html: entry.imageHtml } } />`)}
                ${ entry.label ? html`
                  <span class="djs-popup-label">${ entry.label }</span>
                ` : null }
              </${ entry.action ? 'button' : 'span' }>
            </li>
          `) }
        </ul>
      `) }
    </div>
  `;
}


// helpers
function groupEntries(entries) {
  return entries.reduce((groups, entry) => {
    const groupId = entry.group || 'default';

    const group = groups.find(group => group.id === groupId);

    if (group) {
      group.entries.push(entry);
    } else {
      groups.push({
        id: groupId,
        entries: [ entry ]
      });
    }

    return groups;
  }, []);
}

function getHeaderClasses(entry, selected) {
  return classNames(
    'entry',
    entry.className,
    entry.active ? 'active' : '',
    entry.disabled ? 'disabled' : '',
    selected ? 'selected' : ''
  );
}