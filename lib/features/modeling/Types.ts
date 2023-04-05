export interface ModelingDistributeGroup<ElementType> {
  elements: ElementType[],
  range: {
    min: number;
    max: number;
  } | null
}