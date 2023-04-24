import CommandHandler from './CommandHandler';
import { CommandContext } from './CommandStack';

import Canvas from '../core/Canvas';

export class AddShapeHandler implements CommandHandler {
  private _canvas: Canvas;

  static $inject = [ 'canvas' ];

  constructor(canvas: Canvas) {
    this._canvas = canvas;
  }

  execute(context: CommandContext) {
    const {
      parent,
      shape
    } = context;

    this._canvas.addShape(shape, parent);

    return [
      parent,
      shape
    ];
  }

  revert(context: CommandContext) {
    const {
      parent,
      shape
    } = context;

    this._canvas.removeShape(shape);

    return [
      parent,
      shape
    ];
  }

  canExecute(context: CommandContext) {
    console.log(context);

    return true;
  }

  preExecute(context: CommandContext) {
    console.log(context);
  }

  postExecute(context: CommandContext) {
    console.log(context);
  }
}