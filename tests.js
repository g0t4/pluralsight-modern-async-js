test("should pass a test", function () {
  expect(true).toBe(true);
});

test("should fail a test", () => {
  expect(true).toBe(false);
});

test("async test", done => {

  setTimeout(done, 1);

});