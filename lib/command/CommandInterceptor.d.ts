import EventBus from '../core/EventBus';

type Events = string | string[];

type HandlerFunction = (context: any) => void;
export default class CommandInterceptor {
  constructor(eventBus: EventBus);
  canExecute(events: Events, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;
  canExecute(events: Events, priority: number, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;
  preExecute(events: Events, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;
  preExecute(events: Events, priority: number, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;
  preExecuted(events: Events, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;
  preExecuted(events: Events, priority: number, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;
  execute(events: Events, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;
  execute(events: Events, priority: number, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;
  executed(events: Events, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;
  executed(events: Events, priority: number, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;
  postExecute(events: Events, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;
  postExecute(events: Events, priority: number, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;
  postExecuted(events: Events, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;
  postExecuted(events: Events, priority: number, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;
  revert(events: Events, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;
  revert(events: Events, priority: number, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;
  reverted(events: Events, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;
  reverted(events: Events, priority: number, handlerFn: HandlerFunction, unwrap?: boolean, that?: any): void;
  static $inject?: string[];
}