import HoverTooltipModule from '../../ui/hover-tooltip/index.js';

import Palette from './Palette.js';
import PaletteTooltip from './PaletteTooltip.js';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [ HoverTooltipModule ],
  __init__: [ 'palette', 'paletteTooltip' ],
  palette: [ 'type', Palette ],
  paletteTooltip: [ 'type', PaletteTooltip ]
};
