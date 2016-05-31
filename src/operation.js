const delayms = 1;

const expectedCurrentCity = "New York, NY";
function getCurrentCity(callback) {
  setTimeout(function () {

    callback(null, expectedCurrentCity);

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

const expectedForecast = {
  fiveDay: [60, 70, 80, 45, 50]
};
function getForecast(city, callback) {
  console.log("Getting forecast");
  setTimeout(function () {

    if (!city) {
      callback(new Error("City required to get forecast"));
      return;
    }

    callback(null, expectedForecast)

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
    if (operation.complete) {
      return;
    }
    operation.complete = true;
    internalReject(error);
  };
  operation.reject = operation.fail;
  function internalReject(error) {
    operation.state = "failed";
    operation.error = error;
    operation.errorReactions.forEach(r => r(error));
  }

  function internalResolve(value) {
    // value could be a promise
    if (value && value.then) {
      value.then(internalResolve, internalReject);
      return;
    }
    // or a result
    operation.state = "succeeded";
    operation.result = value;
    operation.successReactions.forEach(r => r(value));
  }

  operation.resolve = function resolve(value) {
    if (operation.complete) {
      return;
    }
    operation.complete = true;
    internalResolve(value);
  };

  operation.onCompletion = function setCallbacks(onSuccess, onError) {
    const noop = function () {};
    const proxyOp = new Operation();

    function successHandler() {
      doLater(function () {

        if (onSuccess) {
          let callbackResult;
          try {
            callbackResult = onSuccess(operation.result);
          } catch (error) {
            proxyOp.fail(error);
            return;
          }
          proxyOp.resolve(callbackResult);
        }
        else proxyOp.resolve(operation.result);

      });
    }

    function errorHandler() {
      doLater(function () {
        if (onError) {
          let callbackResult;
          try {
            callbackResult = onError(operation.error);
          } catch (error) {
            proxyOp.fail(error);
            return;
          }
          proxyOp.resolve(callbackResult);
        }
        else proxyOp.fail(operation.error);
      });
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
      operation.reject(error);
      return;
    }
    operation.resolve(result);
  };


  return operation;
}

function doLater(func) {
  setTimeout(func, 1);
}

test("what is resolve?", function (done) {

  const fetchCurrentCity = new Operation();
  fetchCurrentCity.resolve("NYC");

  const fetchClone = new Operation();
  fetchClone.resolve(fetchCurrentCity);

  fetchClone.then(function (city) {
    expect(city).toBe("NYC");
    done();
  })

});

test("ensure success handlers are async", function (done) {
  var operation = new Operation();
  operation.resolve("New York, NY");
  operation.then(function (city) {
    doneAlias();
  });

  const doneAlias = done;
});

test("ensure error handlers are async", function (done) {
  var operation = new Operation();
  operation.fail(new Error("oh noes"));
  operation.catch(function (error) {
    doneAlias();
  });

  const doneAlias = done;
});
/*
 function fetchCurrentCity2() {
 var operation = new Operation();
 console.log("Getting weather");
 operation.succeed("New York, NY");
 return operation;
 }

 test("what does this print out?", function (done) {

 let ui;

 fetchCurrentCity2()
 .then(function (city) {
 ui = `You are from ${city}`;
 });

 ui = "loading..";

 // assume we are a human looking at the screen 1 second later
 setTimeout(function () {
 expect(ui).toBe(`You are from New York, NY`);
 done();
 }, 1000)

 });
 */

function fetchCurrentCityRepeatedFailures() {
  const operation = new Operation();
  doLater(function () {
    operation.fail(new Error("I failed"));
    operation.fail(new Error("I failed again!"));
  });
  return operation;
}

test("protect from doubling up on failures", function (done) {

  fetchCurrentCityRepeatedFailures()
    .catch(e => done());

});


function fetchCurrentCityIndecisive() {
  const operation = new Operation();
  doLater(function () {
    operation.resolve("NYC");
    operation.resolve("Philly");
  });
  return operation;
}


test("protect from doubling up on success", function (done) {

  fetchCurrentCityIndecisive()
    .then(e => done());

});

test("thrown error recovery", function (done) {

  fetchCurrentCity()
    .then(function (city) {
      throw new Error("Oh noes");
      return fetchWeather(city);
    })
    .catch(e => done());

});


test("error, error recovery", function (done) {

  fetchCurrentCity()
    .then(function (city) {
      throw new Error("Oh noes");
      return fetchWeather(city);
    })
    .catch(function (error) {
      expect(error.message).toBe("Oh noes");
      throw new Error("Error from an error handler, ohhh my!");
    })
    .catch(function (error) {
      expect(error.message).toBe("Error from an error handler, ohhh my!");
      done();
    });

});

function fetchCurrentCityThatFails() {
  var operation = new Operation();
  doLater(() => operation.fail(new Error("GPS broken")));
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

test("error recovery bypassed if not needed", function (done) {

  fetchCurrentCity()
    .catch(error => "default city")
    .then(function (city) {
      expect(city).toBe(expectedCurrentCity);
      done();
    });

});


test("error fallthrough", function (done) {

  fetchCurrentCityThatFails()
    .then(function (city) {
      console.log(city);
      return fetchForecast(city);
    })
    .then(function (forecast) {
      expect(forecast).toBe(expectedForecast);
    })
    .catch(function (error) {
      done();
    })

});


test("reusing error handlers - errors anywhere!", function (done) {

  // compare this to the test above "error fallthrough",
  // just originating error in a different location,
  // same error handler used!
  fetchCurrentCity()
    .then(function (city) {
      console.log(city);
      return fetchForecast();
    })
    .then(function (forecast) {
      expect(forecast).toBe(expectedForecast);
    })
    .catch(function (error) {
      done();
    })

});


test("sync result transformation", function (done) {

  fetchCurrentCity()
    .then(function (city) {
      // say we have a synchronous cache of city to zip code mappings
      return "10019";
    })
    .then(function (zip) {
      expect(zip).toBe("10019");
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
