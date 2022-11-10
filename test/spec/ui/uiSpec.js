import {
  html,
  render,
  useState
} from 'lib/ui';


describe('ui', function() {

  Object.entries({
    html,
    render,
    useState
  }).map(([ name, value ]) => {

    it(`should export ${ name }`, function() {
      expect(value, `export <${ name }>`).to.exist;
    });

  });

});
