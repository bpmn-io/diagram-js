/**
 * A palette containing modeling elements.
 *
 */
export default class Palette {
  static $inject: string[];
  static HTML_MARKUP: string;

  /**
   * @param eventBus
   * @param canvas
   */
  constructor(eventBus: EventBus, canvas: Canvas);

  /**
   * Register a palette provider with the given priority. See
   * {@link PaletteProvider} for examples.
   *
   * @param priority
   * @param provider
   */
  registerProvider(priority: number, provider: PaletteProvider): void;

  /**
   *
   * Register a palette provider with default priority. See
   * {@link PaletteProvider} for examples.
   *
   * @param provider
   */
  registerProvider(provider: PaletteProvider): void;

  /**
   * Returns the palette entries.
   *
   * @return
   */
  getEntries(): PaletteEntries;

  /**
   * Trigger an action available on the palette
   *
   * @param action
   * @param event
   * @param autoActivate
   */
  trigger(action: string, event: Event, autoActivate?: boolean): any;

  /**
   * @param entryId
   * @param action
   * @param event
   * @param autoActivate
   */
  triggerEntry(entryId: string, action: string, event: Event, autoActivate?: boolean): any;

  /**
   * Close the palette.
   */
  close(): void;

  /**
   * Open the palette.
   */
  open(): void;

  /**
   * Toggle the palette.
   */
  toggle(): void;

  /**
   * @param tool
   *
   * @return
   */
  isActiveTool(tool: string): boolean;

  /**
   * @param name
   */
  updateToolHighlight(name: string): void;

  /**
   * Return `true` if the palette is opened.
   *
   * @example
   *
   * ```javascript
   * palette.open();
   *
   * if (palette.isOpen()) {
   *   // yes, we are open
   * }
   * ```
   *
   * @return
   */
  isOpen(): boolean;
}

type Canvas = import('../../core/Canvas').default;
type EventBus = import('../../core/EventBus').default;
type PaletteEntries = import('./PaletteProvider').PaletteEntries;
type PaletteProvider = import('./PaletteProvider').default;
