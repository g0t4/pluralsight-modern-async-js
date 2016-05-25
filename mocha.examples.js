suite.skip("Mocha with QUnit interface and expect (separate library) assertions - examples");

test("Passing test", function () {
  expect(true).toBe(true);
});

test("Throw, expected", function () {

  expect(function () {

    throw new Error("oh noes")

  }).toThrow("oh noes")

});

test("Synchronous throw, uncaught", function () {

  throw new Error("oh noes")

});

test("Async throw, uncaught", function (done) {

  setTimeout(function () {

    throw new Error("oh noes")

  }, 1)

});


test("Synchronous assert, is an uncaught error", function () {

  expect(true).toBe(false);

});

test("Async assert, is an uncaught error too!", function (done) {

  setTimeout(function () {

    expect(true).toBe(false);

  }, 1)

});

