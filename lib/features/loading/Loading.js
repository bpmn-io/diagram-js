/**
 * A plugin hides the Canvas below a loading spinner while rendering is happening.
 */
export default function Loading(
    eventBus, canvas) {
  this._eventBus = eventBus;
  this._canvas = canvas;

  var overlay = document.createElement('div');
  canvas.getContainer().appendChild(overlay);

  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.position = 'absolute';
  overlay.style.background = 'white';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.display = 'block';

  overlay.className = 'loading-overlay';
  overlay.innerHTML = '<div class="spinner spinner-big" />';

  this._overlay = overlay;


  var self = this;
  eventBus.on('root.set.start' , function(e) {

    // console.log('loading start', e);
    !e.element.isImplicit && self.start();
  });

  eventBus.on('root.set', function(e) {
    console.log('root.setm, loading end', e);

    !e.element.isImplicit && self.end();
  });
}

Loading.prototype.start = function() {
  this._overlay.style.display = 'block';
};


Loading.prototype.end = function() {
  this._overlay.style.display = 'none';
};

Loading.$inject = [
  'eventBus',
  'canvas'
];
