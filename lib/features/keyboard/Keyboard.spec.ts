import Diagram from '../../Diagram.js';
import Keyboard from './Keyboard.js';

const diagram = new Diagram();

let keyboard = diagram.get<Keyboard>('keyboard');

keyboard.bind();

keyboard.unbind();

keyboard.bind(document);