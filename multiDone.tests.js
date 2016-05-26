suite("callDone");

test("test passes if multiDone called expected number of times", function (done) {

  const multiDone = callDone(done).afterTwoCalls();

  multiDone();
  multiDone();

});

test("test fails, with `timeout`, if multiDone called less than expected", function (done) {

  this.timeout(100);

  const multiDone = callDone(done).afterTwoCalls();

  multiDone();

});

test("test fails, with `done() called multiple times`, if multiDone called more than expected", function (done) {

  const multiDone = callDone(done).afterTwoCalls();

  multiDone();
  multiDone();
  multiDone();

});