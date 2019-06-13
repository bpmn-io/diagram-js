import {
  escapeCSS,
  escapeHTML
} from 'lib/util/EscapeUtil';


describe('util/EscapeUtil', function() {

  it('escapeCSS', function() {
    expect(escapeCSS('..ab')).to.eql('\\.\\.ab');
  });


  it('should escape HTML', function() {
    var htmlStr = '<video src=1 onerror=alert(\'hueh\')>',
        htmlStr2 = '" onfocus=alert(1) "';

    expect(escapeHTML(htmlStr)).to.eql('&lt;video src=1 onerror=alert(&#39;hueh&#39;)&gt;');
    expect(escapeHTML(htmlStr2)).to.eql('&quot; onfocus=alert(1) &quot;');
  });

});