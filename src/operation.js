const delayms = 1;

function getCurrentCity(callback) {
  setTimeout(function () {

    const city = "New York, NY";
    callback(null, city);

  }, delayms)
}

function getWeather(city, callback) {
  console.log("Getting weather");
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
  console.log("Getting forecast");
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
  const operation = new Operation();

  getCurrentCity(operation.nodeCallback);

  return operation;
}

function fetchForecast(city) {
  const operation = new Operation();

  getForecast(city, operation.nodeCallback);

  return operation;
}

function fetchWeather(city) {
  const operation = new Operation();

  getWeather(city, operation.nodeCallback);

  return operation;
}

function Operation() {

  const operation = {
    successReactions: [],
    errorReactions: []
  };

  operation.fail = function fail(error) {
    operation.state = "failed";
    operation.error = error;
    operation.errorReactions.forEach(r => r(error));
  };

  operation.succeed = function succeed(result) {
    operation.state = "succeeded";
    operation.result = result;
    operation.successReactions.forEach(r => r(result));
  };

  operation.onCompletion = function setCallbacks(onSuccess, onError) {
    const noop = function () {};

    if (operation.state == "succeeded") {
      onSuccess(operation.result);
    } else if (operation.state == "failed") {
      onError(operation.error);
    } else {
      operation.successReactions.push(onSuccess || noop);
      operation.errorReactions.push(onError || noop);
    }
  };

  operation.onFailure = function onFailure(onError) {
    operation.onCompletion(null, onError);
  };

  operation.nodeCallback = function nodeCallback(error, result) {
    if (error) {
      operation.fail(error);
      return;
    }
    operation.succeed(result);
  };

  return operation;
}

function doLater(func) {
  setTimeout(func, 1);
}

test("life is full of async, nesting is inevitable, let's do something about it", function (done) {

  let weatherOp = new Operation();
  fetchCurrentCity().onCompletion(function (city) {

    fetchWeather(city).onCompletion(function (weather) {
      weatherOp.succeed(weather);
      console.log(weather);
    });

  });

  // some other code needs to use weather response in another part of app 
  weatherOp.onCompletion(weather => done());

});

test("lexical parallelism", function (done) {

  const city = "NYC";
  const weatherOp = fetchWeather(city);
  const forecastOp = fetchForecast(city);
  console.log("before completion handlers");

  weatherOp.onCompletion(function (weather) {

    forecastOp.onCompletion(function (forecast) {

      console.log(`It's currently ${weather.temp} in ${city} with a five day forecast of ${forecast.fiveDay}`);
      done();

    })

  })
});

test("register error callback async", function (done) {

  var operationThatErrors = fetchWeather();

  doLater(function () {

    operationThatErrors.onFailure(() => done());

  });

});

test("register success callback async", function (done) {

  var operationThatSucceeds = fetchCurrentCity();

  doLater(function () {

    operationThatSucceeds.onCompletion(() => done());

  });

});

test("noop if no success handler passed", function (done) {

  const operation = fetchCurrentCity();

  // noop should register for success handler
  operation.onFailure(error => done(error));

  // trigger success to make sure noop registered 
  operation.onCompletion(result => done());

});

test("noop if no error handler passed", function (done) {

  const operation = fetchWeather();

  // noop should register for error handler
  operation.onCompletion(result => done(new Error("shouldn't succeed")));

  // trigger failure to make sure noop registered 
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
