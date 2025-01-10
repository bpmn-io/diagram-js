/**
 * A component that manages shape styles
 */
export default class Styles {
  /**
   * Builds a style definition from a className, a list of traits and an object
   * of additional attributes.
   *
   * @param className
   * @param traits
   * @param additionalAttrs
   *
   * @return the style definition
   */
  cls: (className: string, traits?: string[], additionalAttrs?: any) => any;

  /**
   * Builds a style definition from a list of traits and an object of additional
   * attributes.
   *
   * @param additionalAttrs
   *
   * @return the style definition
   */
  style(additionalAttrs: any): any;

  /**
   * Builds a style definition from a list of traits and an object of additional
   * attributes.
   *
   * @param traits
   * @param additionalAttrs
   *
   * @return the style definition
   */
  style(traits: string[], additionalAttrs: any): any;

  /**
   * Computes a style definition from a list of traits and an object of
   * additional attributes, with custom style definition object.
   *
   * @param custom
   * @param defaultStyles
   *
   * @return the style definition
   */
  computeStyle(custom: any, defaultStyles: any): any;

  /**
   * Computes a style definition from a list of traits and an object of
   * additional attributes, with custom style definition object.
   *
   * @param custom
   * @param traits
   * @param defaultStyles
   *
   * @return the style definition
   */
  computeStyle(custom: any, traits: string[], defaultStyles: any): any;
}
