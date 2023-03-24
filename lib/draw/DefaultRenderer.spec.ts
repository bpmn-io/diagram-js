import Diagram from "../Diagram";
import DefaultRenderer from "./DefaultRenderer";

const diagram = new Diagram();

const defaultRenderer = diagram.get<DefaultRenderer>('defaultRenderer');

defaultRenderer.canRender(null);
defaultRenderer.drawShape(null, null);
