import Diagram from '../../Diagram';
import Keyboard from './Keyboard';

const diagram = new Diagram();

let keyboard = diagram.get<Keyboard>('keyboard');

keyboard.bind();

keyboard.unbind();

keyboard.bind(document);