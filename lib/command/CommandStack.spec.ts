import Diagram from '../Diagram.js';

import CommandModule from './index.js';
import CommandStack from './CommandStack.js';

import { AddShapeHandler } from './CommandHandler.spec.js';

const diagram = new Diagram({
  modules: [
    CommandModule
  ]
});

const commandStack = diagram.get<CommandStack>('commandStack');

commandStack.registerHandler('shape.add', AddShapeHandler);

commandStack.canExecute('shape.add', { foo: 'bar' });

commandStack.canUndo();

commandStack.canRedo();

commandStack.clear();

commandStack.execute('shape.add', { foo: 'bar' });

commandStack.redo();

commandStack.undo();