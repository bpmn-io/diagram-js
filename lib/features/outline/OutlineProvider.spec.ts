import {
  attr as svgAttr,
  create as svgCreate
} from 'tiny-svg';

import { Element } from '../../model/Types';

import OutlineProvider, { Outline } from './OutlineProvider';

export class FooOutlineProvider implements OutlineProvider {
  getOutline(element: Element): Outline {
    const outline = svgCreate('circle');

    svgAttr(outline, {
      cx: element.width / 2,
        cy: element.height / 2,
        r: 23
      });
    
    return outline;
  }

  updateOutline(element: Element, outline: Outline): boolean {
    if (element.type === 'Foo') {
      svgAttr(outline, {
        cx: element.width / 2,
        cy: element.height / 2,
        r: 23
      });
    }
     
    return false;
  }
}
