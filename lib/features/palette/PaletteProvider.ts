export type PaletteEntry = {
  action: (event: Event, autoActivate: boolean) => any;
  className?: string;
  group?: string;
  html?: string;
  imageUrl?: string;
  separator?: boolean;
  title?: string;
};

export type PaletteEntries = Record<string, PaletteEntry>;

export type PaletteEntriesCallback = (entries: PaletteEntries) => PaletteEntries;

export default interface PaletteProvider {

  /**
   * Returns a map of entries or a function that receives, modifies and returns
   * a map of entries.
   *
   * The following example shows how to replace any entries returned by previous
   * providers with one entry which alerts the ID of the given element when
   * clicking on the entry.
   *
   * @example
   *
   * ```javascript
   * getPaletteEntries() {
   *   return function(entries) {
   *     return {
   *       foo: {
   *         action: (event, autoActivate) => {
   *           alert('Foo');
   *         },
   *         className: 'foo',
   *         title: 'Foo'
   *       }
   *     };
   *   };
   * }
   * ```
   */
  getPaletteEntries: () => PaletteEntriesCallback | PaletteEntries;
}