/**
 * A component that manages shape styles
 */
export default class Styles {

    /**
     * Builds a style definition from a className, a list of traits and an object of additional attributes.
     *
     * @param className
     * @param traits
     * @param additionalAttrs
     *
     * @return the style defintion
     */
    cls: (className: string, traits: Array<string>, additionalAttrs: any) => any;

    /**
     * Builds a style definition from a list of traits and an object of additional attributes.
     *
     * @param traits
     * @param additionalAttrs
     *
     * @return the style defintion
     */
    style: (traits: Array<string>, additionalAttrs: any) => any;

    computeStyle: (custom: any, traits: any, defaultStyles: any) => any;
}
