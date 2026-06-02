import type { VNode } from '@bpmn-io/diagram-js-ui';

import type { PopupMenuTarget } from './PopupMenu.js';

export type PopupMenuEntryAction = (
  event: Event,
  entry: PopupMenuActionEntry,
  action?: string
) => any;

type PopupMenuEntryBase = {
  className?: string;
  group?: string | { id: string, name?: string };
  disabled?: boolean;
  imageUrl?: string;
  imageHtml?: string;
  label?: string;
  title?: string;
  description?: string;
  documentationRef?: string;
  rank?: number;
  search?: string | string[];
  searchable?: boolean;
};

/**
 * Popup menu entry which performs an action when clicked.
 */
export type PopupMenuActionEntry = PopupMenuEntryBase & {
  action: PopupMenuEntryAction;
  entries?: never;
};

/**
 * Popup menu entry which navigates to a sub-menu when clicked.
 */
export type PopupMenuStepEntry = PopupMenuEntryBase & {
  entries: PopupMenuEntries;
  action?: never;
};

export type PopupMenuEntry =
  | PopupMenuActionEntry
  | PopupMenuStepEntry;

export type PopupMenuEntries = Record<string, PopupMenuEntry>;

export type PopupMenuEntriesProvider = (
  entries: PopupMenuEntries
) => PopupMenuEntries;

export type PopupMenuGroup = {
  id: string,
  name?: string,
  entries: PopupMenuEntry[]
};

export type PopupMenuHeaderEntryAction = (
  event: Event,
  entry: PopupMenuHeaderEntry,
  action?: string
) => any;

export type PopupMenuHeaderEntry = {
  action: PopupMenuHeaderEntryAction;
  active?: boolean;
  className: string;
  group?: string;
  disabled?: boolean;
  id: string;
  imageUrl?: string;
  imageHtml?: string;
  label?: string;
  title: string;
};

export type PopupMenuHeaderEntries = PopupMenuHeaderEntry[];

export type PopupMenuProviderHeaderEntriesProvider = (
  entries: PopupMenuHeaderEntries
) => PopupMenuHeaderEntries;

export type PopupMenuEmptyPlaceholder = VNode;

export type PopupMenuEmptyPlaceholderProvider = (
  search: string
) => PopupMenuEmptyPlaceholder;

/**
 * An interface to be implemented by a popup menu provider.
 */
export default interface PopupMenuProvider {
  /**
   * Returns a map of entries or a function that receives, modifies and returns
   * a map of entries.
   *
   * The following example shows how to replace any entries returned by previous
   * providers with one entry which alerts the ID of the given target when
   * clicking on the entry.
   *
   * @example
   *
   * ```javascript
   * getPopupMenuEntries(target) {
   *   return function(entries) {
   *     return {
   *       alert: {
   *         action: (event, entry) => {
   *           alert(target.id);
   *         },
   *         className: 'alert',
   *         label: 'Alert target ID'
   *       }
   *     };
   *   };
   * }
   * ```
   *
   * @param target
   */
  getPopupMenuEntries(
    target: PopupMenuTarget
  ): PopupMenuEntriesProvider | PopupMenuEntries;

  /**
   * Returns a list of header entries or a function that receives, modifies and
   * returns a list of header entries.
   *
   * The following example shows how to replace any entries returned by previous
   * providers with one entry which alerts the ID of the given target when
   * clicking on the entry.
   *
   * @example
   *
   * ```javascript
   * getHeaderEntries(target) {
   *   return function(entries) {
   *     return [
   *       {
   *         action: (event, entry) => {
   *           alert(target.id);
   *         },
   *         active: true,
   *         className: 'alert',
   *         id: 'alert',
   *         title: 'Alert target ID';
   *       }
   *     ];
   *   };
   * }
   * ```
   *
   * @param target
   */
  getHeaderEntries?(
    target: PopupMenuTarget
  ): PopupMenuProviderHeaderEntriesProvider | PopupMenuHeaderEntries;

  /**
   * Returns a component to be displayed when no popup menu entries
   * match a given search query.
   *
   * @example
   *
   * ```javascript
   * getEmptyPlaceholder() {
   *   return (search) => <>
   *     No results for <strong>{ search }</strong>
   *   <>;
   * }
   * ```
   */
  getEmptyPlaceholder?():
    | PopupMenuEmptyPlaceholderProvider
    | PopupMenuEmptyPlaceholder;
}
