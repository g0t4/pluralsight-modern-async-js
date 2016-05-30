const delayms = 1;

const expectedCurrentCity = "New York, NY";
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
    const proxyOp = new Operation();

    function successHandler() {
      if (onSuccess) {
        const callbackResult = onSuccess(operation.result);
        if (callbackResult && callbackResult.then) {
          callbackResult.forwardCompletion(proxyOp);
        }
      }
    }

    function errorHandler() {
      if (onError) {
        const callbackResult = onError(operation.error);
        if (callbackResult && callbackResult.then) {
          callbackResult.forwardCompletion(proxyOp);
          return;
        }
        proxyOp.succeed(callbackResult);
      }
    }

    if (operation.state == "succeeded") {
      successHandler();
    } else if (operation.state == "failed") {
      errorHandler();
    } else {
      operation.successReactions.push(successHandler);
      operation.errorReactions.push(errorHandler);
    }

    return proxyOp;
  };
  operation.then = operation.onCompletion;

  operation.onFailure = function onFailure(onError) {
    return operation.then(null, onError);
  };
  operation.catch = operation.onFailure;

  operation.nodeCallback = function nodeCallback(error, result) {
    if (error) {
      operation.fail(error);
      return;
    }
    operation.succeed(result);
  };

  operation.forwardCompletion = function (op) {
    operation.onCompletion(op.succeed, op.fail);
  };

  return operation;
}

function doLater(func) {
  setTimeout(func, 1);
}


function fetchCurrentCityThatFails() {
  var operation = new Operation();
  doLater(() => operation.fail("GPS broken"));
  return operation;
}

test("sync error recovery", function (done) {

  fetchCurrentCityThatFails()
  // register error recovery
    .catch(function (error) {
      console.log(error);
      return "default city";
    })
    .then(function (city) {
      expect(city).toBe("default city");
      done();
    });

});

test("async error recovery", function (done) {

  fetchCurrentCityThatFails()
    .catch(function () {
      return fetchCurrentCity();
    })
    .then(function (city) {
      expect(city).toBe(expectedCurrentCity);
      done();
    });

});


test("life is full of async, nesting is inevitable, let's do something about it", function (done) {

  fetchCurrentCity()
    .then(fetchWeather)
    .then(printTheWeather);

  function printTheWeather(weather) {
    console.log(weather);
    done();
  }

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
