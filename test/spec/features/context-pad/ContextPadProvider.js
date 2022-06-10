import imageA from './resources/a.png';
import imageB from './resources/b.png';
import imageC from './resources/c.png';

import { every } from 'min-dash';


export default function ContextPadProvider(contextPad) {
  contextPad.registerProvider(this);
}

ContextPadProvider.$inject = [ 'contextPad' ];

ContextPadProvider.prototype.getContextPadEntries = function(element) {

  if (element.type === 'A') {
    return {
      'action.a': {
        imageUrl: imageA,
        action: function(e) {
          e.__handled = true;
        }
      },
      'action.b': {
        imageUrl: imageB,
        action: function(e) {
          e.__handled = true;
        }
      }
    };
  } else
  if (element.type === 'drag') {
    return {
      'action.dragstart': {
        className: 'drag-out',
        action: {
          dragstart: function(e) {
            e.__handled = true;
          }
        }
      }
    };
  } else if (element.type === 'bigImage') {
    return {
      'action.c': {
        imageUrl: 'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%222048%22%20width%3D%222048%22%3E%3Cpath%20style%3D%22fill%3Anone%3Bfill-rule%3Aevenodd%3Bstroke%3A%23282828%3Bstroke-width%3A146%3Bstroke-linecap%3Abutt%3Bstroke-linejoin%3Amiter%3Bstroke-miterlimit%3A4%3Bstroke-dasharray%3Anone%3Bstroke-dashoffset%3A0%3Bstroke-opacity%3A1%22%20d%3D%22M1027.973%201318v146%22%20transform%3D%22rotate(90%201022%201026)%22%2F%3E%3Cpath%20style%3D%22fill%3A%23fff%3Bfill-opacity%3A1%3Bstroke%3A%23282828%3Bstroke-width%3A146%3Bstroke-miterlimit%3A4%3Bstroke-dasharray%3Anone%3Bstroke-opacity%3A1%22%20d%3D%22M365%20515h1314V77H365v438zM657%201245h730V807H657v438z%22%20transform%3D%22rotate(90%201022%201026)%22%2F%3E%3Cpath%20style%3D%22fill%3Anone%3Bfill-rule%3Aevenodd%3Bstroke%3A%23282828%3Bstroke-width%3A146%3Bstroke-linecap%3Abutt%3Bstroke-linejoin%3Amiter%3Bstroke-miterlimit%3A4%3Bstroke-dasharray%3Anone%3Bstroke-dashoffset%3A0%3Bstroke-opacity%3A1%22%20d%3D%22M1022%20588v146%22%20transform%3D%22rotate(90%201022%201026)%22%2F%3E%3Cpath%20style%3D%22fill%3A%23fff%3Bfill-opacity%3A1%3Bstroke%3A%23282828%3Bstroke-width%3A146%3Bstroke-miterlimit%3A4%3Bstroke-dasharray%3Anone%3Bstroke-opacity%3A1%22%20d%3D%22M365%201975h1314v-438H365v438z%22%20transform%3D%22rotate(90%201022%201026)%22%2F%3E%3C%2Fsvg%3E',
        action: function(e) {
          e.__handled = true;
        }
      }
    };
  } else {
    return {
      'action.c': {
        imageUrl: imageC,
        action: function(e) {
          e.__handled = true;
        }
      },
      'action.no-image': {
        action: function(e) {
          e.__handled = true;
        }
      }
    };
  }
};


ContextPadProvider.prototype.getMultiElementContextPadEntries = function(elements) {

  function allTyped(elements, type) {
    return every(elements, function(element) {
      return element.type === type;
    });
  }

  if (allTyped(elements, 'A')) {
    return {
      'action.a': {
        imageUrl: imageA,
        action: function(e) {
          e.__handled = true;
        }
      }
    };
  }

  if (allTyped(elements, 'C')) {
    return {
      'action.c': {
        imageUrl: imageC,
        action: function(e) {
          e.__handled = true;
        }
      }
    };
  }
};