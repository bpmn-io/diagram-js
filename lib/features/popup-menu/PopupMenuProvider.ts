import { PopupMenuTarget } from './PopupMenu';

export type PopupMenuEntryAction = (event: Event, entry: PopupMenuEntry, action?: string) => any;

export type PopupMenuEntry = {
  action: PopupMenuEntryAction;
  className: string;
  label: string;
};

export type PopupMenuEntries = Record<string, PopupMenuEntry>;

export type PopupMenuEntriesCallback = (entries: PopupMenuEntries) => PopupMenuEntries;

export type PopupMenuHeaderEntryAction = (event: Event, entry: PopupMenuHeaderEntry, action?: string) => any;

export type PopupMenuHeaderEntry = {
  action: PopupMenuHeaderEntryAction;
  active?: boolean;
  className: string;
  id: string;
  title: string;
};

export type PopupMenuHeaderEntries = PopupMenuHeaderEntry[];

export type PopupMenuProviderHeaderEntriesCallback = (entries: PopupMenuHeaderEntries) => PopupMenuHeaderEntries;

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
  getPopupMenuEntries(target: PopupMenuTarget): PopupMenuEntriesCallback | PopupMenuEntries;

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
  getHeaderEntries?(target: PopupMenuTarget): PopupMenuProviderHeaderEntriesCallback | PopupMenuHeaderEntries;
}