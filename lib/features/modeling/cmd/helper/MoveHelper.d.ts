/**
 * A helper that is able to carry out serialized move
 * operations on multiple elements.
 *
 */
export default class MoveHelper {
  /**
   * @param modeling
   */
  constructor(modeling: Modeling);

  /**
   * Move the specified elements and all children by the given delta.
   *
   * This moves all enclosed connections, too and layouts all affected
   * external connections.
   *
   *
   * @param elements
   * @param delta
   * @param newParent The new parent of all elements that are not nested.
   *
   * @return
   */
  moveRecursive<T extends import("../../../../model/Types").ElementLike>(elements: T[], delta: Point, newParent: Shape): T[];

  /**
   * Move the given closure of elmements.
   *
   * @param closure
   * @param delta
   * @param newParent
   * @param newHost
   */
  moveClosure(closure: any, delta: Point, newParent?: Shape, newHost?: Shape): void;

  /**
   * Returns the closure for the selected elements
   *
   * @param elements
   *
   * @return
   */
  getClosure(elements: Element[]): MoveClosure;
}

type Element = import('../../../../core/Types').ElementLike;
type Shape = import('../../../../core/Types').ShapeLike;
type Point = import('../../../../util/Types').Point;
type Modeling = import('../../Modeling').default;
import MoveClosure from './MoveClosure';
