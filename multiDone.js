function callDone(done) {
  let counter = 0;

  return {
    afterNCalls: function (expectedCount) {
      return function multiDone() {
        counter++;
        if (counter >= expectedCount) {
          // if we go over the count, we'll call done multiple times thus failing the test
          done();
        }
      }
    },
    afterTwoCalls: function () {
      return this.afterNCalls(2);
    }
  }
}
