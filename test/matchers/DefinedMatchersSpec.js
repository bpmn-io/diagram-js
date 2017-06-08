'use strict';

describe('matchers/DefinedMatchers', function () {
  it('should define matcher .defined', function () {
    expect((typeof expect("something").to.be.defined)).to.not.equal('undefined');
  });

  it('should .be.defined', function () {
    expect("something").to.be.defined;
  });

  it('should .not.be.defined', function () {
    expect(undefined).to.not.be.defined;
  });
});
