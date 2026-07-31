import { html } from '../../ui/index.js';

/**
 * @typedef { {
 *   title: string;
 *   shortcut?: string;
 * } } PaletteTooltipProps
 */

/**
 * Renders the content of a palette entry tooltip: the entry title and,
 * if provided, its keyboard shortcut.
 *
 * @param {PaletteTooltipProps} props
 */
export default function PaletteTooltipComponent(props) {
  const {
    title,
    shortcut
  } = props;

  const shortcutNode = shortcut
    ? html`<kbd class="djs-palette-tooltip-shortcut">${ shortcut }</kbd>`
    : null;

  return html`
    <span class="djs-palette-tooltip-label">${ title }</span>
    ${ shortcutNode }
  `;
}
