const delayms = 1;

function getCurrentCity(callback) {
  setTimeout(function () {

    const city = "New York, NY";
    callback(null, city);

  }, delayms)
}

function getWeather(city, callback) {
  setTimeout(function () {

    if (!city) {
      callback(new Error("City required to get weather"));
      return;
    }

    const weather = {
      temp: 50
    };

    callback(null, weather)

  }, delayms)
}

function getForecast(city, callback) {
  setTimeout(function () {

    if (!city) {
      callback(new Error("City required to get forecast"));
      return;
    }

    const fiveDay = {
      fiveDay: [60, 70, 80, 45, 50]
    };

    callback(null, fiveDay)

  }, delayms)
}

suite.only("operations");

function fetchCurrentCity() {
  const operation = {
    successReactions: [],
    errorReactions: []
  };

  getCurrentCity(function (error, result) {
    if (error) {
      operation.errorReactions.forEach(r => r(error));
      return;
    }
    operation.successReactions.forEach(r => r(result));
  });

  operation.onCompletion = function setCallbacks(onSuccess, onError) {
    const noop = function () {};
    operation.successReactions.push(onSuccess || noop);
    operation.errorReactions.push(onError);
  };
  operation.onFailure = function onFailure(onError) {
    operation.onCompletion(null, onError);
  };
  return operation;
}

test("register only error handler, ignores success handler", function (done) {

  const operation = fetchCurrentCity();

  operation.onFailure(error => done(error));
  operation.onCompletion(result => done());

});

test("register only success handler, ignores error handler", function (done) {

  // todo operation that can fail
  const operation = fetchCurrentCity();

  operation.onCompletion(result => done(new Error("shouldn't succeed")));

  operation.onFailure(error => done());

});

test("pass multiple callbacks - all of them are called", function (done) {

  const operation = fetchCurrentCity();

  const multiDone = callDone(done).afterTwoCalls();

  operation.onCompletion(result => multiDone());
  operation.onCompletion(result => multiDone());

});

test("fetchCurrentCity pass the callbacks later on", function (done) {

  // initiate operation
  const operation = fetchCurrentCity();

  // register callbacks
  operation.onCompletion(
    result => done(),
    error => done(error));

});

/* Avoid timing issues with initializing a database
 // initiate operation
 const initDb = initiateDB();

 // register callbacks
 initDb.onCompletion(function(db){
 db.InsertPayment();
 });

 initDb.onCompletion(function(db){
 db.InsertUser();
 })
 );*/
