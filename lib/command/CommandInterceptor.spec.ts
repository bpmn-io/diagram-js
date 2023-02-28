import CommandInterceptor from './CommandInterceptor';

import EventBus from '../core/EventBus';

import Modeling from '../features/modeling/Modeling';

export class AddShapeBehavior extends CommandInterceptor {
  static $inject = [ 'eventBus', 'modeling' ];

  constructor(eventBus: EventBus, modeling: Modeling) {
    super(eventBus);

    this.canExecute((context) => {}, true);

    this.canExecute([ 'shape.create' ], (context) => {}, true);

    this.canExecute([ 'shape.create' ], 2000, (context) => {}, true);

    this.preExecute((context) => {}, true);

    this.preExecute([ 'shape.create' ], (context) => {}, true);

    this.preExecute([ 'shape.create' ], 2000, (context) => {}, true);

    this.preExecuted((context) => {}, true);

    this.preExecuted([ 'shape.create' ], (context) => {}, true);

    this.preExecuted([ 'shape.create' ], 2000, (context) => {}, true);

    this.execute((context) => {}, true);

    this.execute([ 'shape.create' ], (context) => {}, true);

    this.execute([ 'shape.create' ], (context) => [], true);

    this.execute([ 'shape.create' ], 2000, (context) => {}, true);

    this.executed((context) => {}, true);

    this.executed([ 'shape.create' ], (context) => {}, true);

    this.executed([ 'shape.create' ], (context) => [], true);

    this.executed([ 'shape.create' ], 2000, (context) => {}, true);

    this.postExecute((context) => {}, true);

    this.postExecute([ 'shape.create' ], (context) => {}, true);

    this.postExecute([ 'shape.create' ], 2000, (context) => {}, true);

    this.postExecuted((context) => {}, true);

    this.postExecuted([ 'shape.create' ], (context) => {
      const { shape } = context;

      modeling.moveShape(shape, { x: 100, y: 100 });
    }, true);

    this.postExecuted([ 'shape.create' ], 2000, (context) => {}, true);

    this.revert((context) => {}, true);

    this.revert([ 'shape.create' ], (context) => {}, true);

    this.revert([ 'shape.create' ], (context) => [], true);

    this.revert([ 'shape.create' ], 2000, (context) => {}, true);

    this.reverted((context) => {}, true);

    this.reverted([ 'shape.create' ], (context) => {}, true);

    this.reverted([ 'shape.create' ], (context) => [], true);

    this.reverted([ 'shape.create' ], 2000, (context) => {}, true);
  }
}