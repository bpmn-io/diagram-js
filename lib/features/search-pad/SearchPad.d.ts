/**
 * Provides searching infrastructure.
 *
 */
export default class SearchPad {
  static $inject: string[];

  /**
   * CONSTANTS
   */
  static CONTAINER_SELECTOR: string;

  static INPUT_SELECTOR: string;
  static RESULTS_CONTAINER_SELECTOR: string;
  static RESULT_SELECTOR: string;
  static RESULT_SELECTED_CLASS: string;
  static RESULT_SELECTED_SELECTOR: string;
  static RESULT_ID_ATTRIBUTE: string;
  static RESULT_HIGHLIGHT_CLASS: string;
  static BOX_HTML: string;
  static RESULT_HTML: string;
  static RESULT_PRIMARY_HTML: string;
  static RESULT_SECONDARY_HTML: string;

  /**
   * @param canvas
   * @param eventBus
   * @param selection
   * @param translate
   */
  constructor(canvas: Canvas, eventBus: EventBus, selection: Selection, translate: Translate);

  /**
   * Register search element provider.
   *
   * @param provider
   */
  registerProvider(provider: SearchPadProvider): void;

  /**
   * Open search pad.
   */
  open(): void;

  /**
   * Close search pad.
   */
  close(restoreCached?: boolean): void;

  /**
   * Toggles search pad on/off.
   */
  toggle(): void;

  /**
   * Report state of search pad.
   */
  isOpen(): boolean;
}

type Canvas = import('../../core/Canvas').default;
type EventBus = import('../../core/EventBus').default;
type Selection = import('../selection/Selection').default;
export type Translate = typeof import("../../i18n/translate/translate.js").default;
type Dimensions = import('../../util/Types').Dimensions;
type SearchPadProvider = import('./SearchPadProvider').default;
type SearchResult = import('./SearchPadProvider').SearchResult;
type Token = import('./SearchPadProvider').Token;
