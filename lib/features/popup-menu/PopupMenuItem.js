import classNames from 'clsx';

import {
  html
} from '../../ui/index.js';

/**
 * @typedef {import('./PopupMenuProvider.js').PopupMenuEntry} PopupMenuEntry
 */

/**
 * Compute the DOM `id` of a rendered popup menu entry.
 *
 * Used to wire the entry (`role="option"`) to the search field
 * via `aria-activedescendant`.
 *
 * @param {string} idPrefix
 * @param {PopupMenuEntry} entry
 *
 * @return {string}
 */
export function getPopupMenuItemId(idPrefix, entry) {
  return `${ idPrefix }-entry-${ entry.id }`;
}

/**
 * Component that renders a popup menu entry.
 *
 * @param {Object} props
 * @param {string} props.key
 * @param {string} props.idPrefix
 * @param {PopupMenuEntry} props.entry
 * @param {boolean} props.selected
 * @param {(event: MouseEvent) => void} props.onMouseEnter
 * @param {(event: MouseEvent) => void} props.onMouseLeave
 * @param {(event: MouseEvent, entry?: PopupMenuEntry, action?: string) => void} props.onAction
 */
export default function PopupMenuItem(props) {
  const {
    idPrefix,
    entry,
    selected,
    onMouseEnter,
    onMouseLeave,
    onAction
  } = props;

  const handleClick = (event, action) => {
    if (entry.disabled) {
      return;
    }

    return onAction(event, entry, action);
  };

  const draggable = !entry.entries;

  return html`
    <li
      class=${ classNames('entry', { selected, disabled: entry.disabled }) }
      data-id=${ entry.id }
      id=${ getPopupMenuItemId(idPrefix, entry) }
      role="option"
      aria-selected=${ selected || undefined }
      aria-haspopup=${ entry.entries ? 'true' : undefined }
      title=${ entry.title }
      aria-disabled=${ entry.disabled || undefined }
      onClick=${ handleClick }
      onMouseEnter=${ onMouseEnter }
      onMouseLeave=${ onMouseLeave }
      onDragStart=${ (event) => draggable && handleClick(event, 'dragstart') }
      draggable=${ draggable }
    >
      <div class="djs-popup-entry-content">
        <span
          class=${ classNames('djs-popup-entry-name', entry.className) }
        >
          ${(entry.imageUrl && html`<img class="djs-popup-entry-icon" src=${ entry.imageUrl } alt="" />`) ||
            (entry.imageHtml && html`<div class="djs-popup-entry-icon" dangerouslySetInnerHTML=${ { __html: entry.imageHtml } } />`)}

          ${ entry.label ? html`
            <span class="djs-popup-label">
              ${ entry.label }
            </span>
          ` : null }

          ${ entry.documentationRef && html`
            <a
              class="djs-popup-entry-docs"
              href=${ entry.documentationRef }
              onClick=${ (event) => event.stopPropagation() }
              title="Open entry documentation"
              tabIndex="-1"
              aria-hidden="true"
              target="_blank"
              rel="noopener"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M10.6368 10.6375V5.91761H11.9995V10.6382C11.9995 10.9973 11.8623 11.3141 11.5878 11.5885C11.3134 11.863 10.9966 12.0002 10.6375 12.0002H1.36266C0.982345 12.0002 0.660159 11.8681 0.396102 11.6041C0.132044 11.34 1.52588e-05 11.0178 1.52588e-05 10.6375V1.36267C1.52588e-05 0.98236 0.132044 0.660173 0.396102 0.396116C0.660159 0.132058 0.982345 2.95639e-05 1.36266 2.95639e-05H5.91624V1.36267H1.36266V10.6375H10.6368ZM12 0H7.2794L7.27873 1.36197H9.68701L3.06507 7.98391L4.01541 8.93425L10.6373 2.31231V4.72059H12V0Z" fill="#818798"/>
              </svg>
            </a>
          ` }
        </span>
        ${ entry.description && html`
          <span
            class="djs-popup-entry-description"
          >
            ${ entry.description }
          </span>
        ` }
      </div>
      ${ entry.entries && html`
        <div class="djs-popup-entry-chevron" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M3.96967 1.46967C4.26256 1.17678 4.73744 1.17678 5.03033 1.46967L9.03033 5.46967C9.32322 5.76256 9.32322 6.23744 9.03033 6.53033L5.03033 10.5303C4.73744 10.8232 4.26256 10.8232 3.96967 10.5303C3.67678 10.2374 3.67678 9.76256 3.96967 9.46967L7.43934 6L3.96967 2.53033C3.67678 2.23744 3.67678 1.76256 3.96967 1.46967Z" fill="currentColor"/>
          </svg>
        </div>
      ` }
    </li>
  `;
}
