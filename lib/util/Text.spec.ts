// instantiation

import Text from './Text';

const text = new Text({
  style: {
    fontFamily: 'Arial, sans-serif',
    fontSize: 1,
    fontWeight: 'normal',
    lineHeight: 12
  }
});

// usage

text.createText('foo bar', {
  box: {
    width: 100,
    height: 50
  }
});

text.getDimensions('foo bar', {
  align: 'center-middle'
});