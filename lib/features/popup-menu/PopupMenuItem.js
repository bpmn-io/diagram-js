import classNames from 'clsx';

import {
  html
} from '../../ui';

/**
 * @typedef {import('./PopupMenuProvider').PopupMenuEntry} PopupMenuEntry
 */

/**
 * Component that renders a popup menu entry.
 *
 * @param {Object} props
 * @param {string} props.key
 * @param {PopupMenuEntry} props.entry
 * @param {boolean} props.selected
 * @param {(event: MouseEvent) => void} props.onMouseEnter
 * @param {(event: MouseEvent) => void} props.onMouseLeave
 * @param {(event: MouseEvent, entry?: PopupMenuEntry, action?: string) => void} props.onAction
 */
export default function PopupMenuItem(props) {
  const {
    entry,
    selected,
    onMouseEnter,
    onMouseLeave,
    onAction
  } = props;

  return html`
    <li
      class=${ classNames('entry', { selected }) }
      data-id=${ entry.id }
      title=${ entry.title || entry.label }
      tabIndex="0"
      onClick=${ onAction }
      onFocus=${ onMouseEnter }
      onBlur=${ onMouseLeave }
      onMouseEnter=${ onMouseEnter }
      onMouseLeave=${ onMouseLeave }
      onDragStart=${ (event) => onAction(event, entry, 'dragstart') }
      draggable=${ true }
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
        </span>
        ${ entry.description && html`
          <span
            class="djs-popup-entry-description"
            title=${ entry.description }
          >
            ${ entry.description }
          </span>
        ` }
      </div>
      ${ entry.documentationRef && html`
        <div class="djs-popup-entry-docs">
          <a
            href="${ entry.documentationRef }"
            onClick=${ (event) => event.stopPropagation() }
            title="Open element documentation"
            target="_blank"
            rel="noopener"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M10.6368 10.6375V5.91761H11.9995V10.6382C11.9995 10.9973 11.8623 11.3141 11.5878 11.5885C11.3134 11.863 10.9966 12.0002 10.6375 12.0002H1.36266C0.982345 12.0002 0.660159 11.8681 0.396102 11.6041C0.132044 11.34 1.52588e-05 11.0178 1.52588e-05 10.6375V1.36267C1.52588e-05 0.98236 0.132044 0.660173 0.396102 0.396116C0.660159 0.132058 0.982345 2.95639e-05 1.36266 2.95639e-05H5.91624V1.36267H1.36266V10.6375H10.6368ZM12 0H7.2794L7.27873 1.36197H9.68701L3.06507 7.98391L4.01541 8.93425L10.6373 2.31231V4.72059H12V0Z" fill="#818798"/>
            </svg>
          </a>
        </div>
      ` }
    </li>
  `;
}
