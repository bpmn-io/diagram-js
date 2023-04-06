import CommandHandler from './CommandHandler';

import Canvas from '../core/Canvas';
import Modeling from '../features/modeling/Modeling';

import {
  ElementLike,
  Shape
} from '../model/Types';

export class AddShapeHandler implements CommandHandler {
  private _canvas: Canvas;

  static $inject = [ 'canvas' ];

  constructor(canvas: Canvas) {
    this._canvas = canvas;
  }

  execute(context) {
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

  revert(context) {
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

  canExecute(_) {
    return true;
  }

  preExecute(_) {}

  postExecute(_) {}
}

class MoveShapeHandler implements CommandHandler {
  private _modeling: Modeling;

  static $inject = [ 'modeling' ];

  constructor(modeling: Modeling) {
    this._modeling = modeling;
  }

  execute(context) {
    const { shape } = context;

    this._modeling.moveShape(shape as Shape, { x: 100, y: 100 });
  }

  revert(context) {
    const { shape } = context;

    this._modeling.moveShape(shape as Shape, { x: 100, y: 100 });
  }
}