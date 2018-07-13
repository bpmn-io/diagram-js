import imageA from './resources/a.png';
import imageB from './resources/b.png';
import imageC from './resources/c.png';


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