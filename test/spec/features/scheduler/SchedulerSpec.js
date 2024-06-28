import schedulerModule from 'lib/features/scheduler';

import {
  bootstrapDiagram,
  getDiagramJS,
  inject
} from 'test/TestHelper';


describe('features/scheduler', function() {

  beforeEach(bootstrapDiagram({
    modules: [ schedulerModule ]
  }));


  it('should schedule task', inject(async function(scheduler) {

    // given
    const fn = sinon.spy();

    // when
    const promise = scheduler.schedule(fn);

    // assume
    expect(fn).not.to.have.been.called;

    // when
    await promise;

    // then
    expect(fn).to.have.been.calledOnce;
  }));


  it('should cancel task', inject(async function(scheduler) {

    // given
    const fn = sinon.spy();

    const promise = scheduler.schedule(fn, 'myId');

    // when
    scheduler.cancel('myId');

    await Promise.race([
      wait(200),
      promise
    ]);

    // then
    expect(fn).not.to.have.been.called;
  }));


  describe('execution behavior', function() {

    it('should only execute latest task', inject(async function(scheduler) {

      // given
      const fn = sinon.spy();
      const fn2 = sinon.spy();

      // when
      await Promise.race([
        scheduler.schedule(fn, 'myId'),
        scheduler.schedule(fn2, 'myId')
      ]);

      // then
      expect(fn).not.to.have.been.called;
      expect(fn2).to.have.been.calledOnce;
    }));


    it('should return task result', inject(async function(scheduler) {

      // given
      const fn = () => 10;

      // when
      const result = await scheduler.schedule(fn);

      // then
      expect(result).to.eql(10);
    }));


    it('should catch task error', inject(async function(scheduler) {

      // given
      const fn = () => {
        throw new Error('expected error');
      };

      let error;

      // when
      try {
        await scheduler.schedule(fn);
      } catch (_error) {
        error = _error;
      }

      // then
      expect(error).to.exist;
      expect(error.message).to.match(/expected error/);
    }));


    it('should cancel when diagram is destroyed', inject(
      async function(scheduler) {

        // given
        const fn = sinon.spy();
        const promise = scheduler.schedule(fn);

        // when
        getDiagramJS().destroy();

        await Promise.race([
          wait(200),
          promise
        ]);

        // then
        expect(fn).not.to.have.been.called;
      }
    ));

  });

});


function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}