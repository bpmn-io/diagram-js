/**
 * The tool manager acts as middle-man between the available tool's and the Palette,
 * it takes care of making sure that the correct active state is set.
 *
 */
export default class ToolManager {
  static $inject: string[];

  /**
   * @param eventBus
   */
  constructor(eventBus: EventBus);

  /**
   * Register a tool.
   *
   * @param name
   * @param events
   */
  registerTool(name: string, events: {
      tool: string;
  }): void;

  isActive(tool: any): boolean;
  length(tool: any): number;
  setActive(tool: any): void;
  bindEvents(name: any, events: any): void;
}

type EventBus = import('../../core/EventBus').default;
type Event = import('../../core/EventBus').Event;
