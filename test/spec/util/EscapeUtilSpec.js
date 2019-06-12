import {
  escapeCSS,
  escapeHTML
} from 'lib/util/EscapeUtil';


describe('util/EscapeUtil', function() {

  it('escapeCSS', function() {
    expect(escapeCSS('..ab')).to.eql('\\.\\.ab');
  });


  it('escapeHTML', function() {
    var htmlStr = '<video src=1 onerror=alert(\'hueh\')>';

    expect(escapeHTML(htmlStr)).to.eql('&ltvideo src=1 onerror=alert(\'hueh\')&gt');
  });

});