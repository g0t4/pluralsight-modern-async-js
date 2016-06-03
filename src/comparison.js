test("this?", done => {

  getCurrentCity(function (error, city) {
    if (error) {
      return done(error);
    }

    let weatherData;
    let forecastData;

    getWeather(city, function (error, weather) {
      if (error) {
        return done(error);
      }

      weatherData = weather;
      console.log("weather", weather);
      finishIfReady();
    });

    getForecast(city, function (error, forecast) {
      if (error) {
        return done(error);
      }

      forecastData = forecast;
      console.log("forecast", forecast);
      finishIfReady();
    });

    function finishIfReady() {
      if (weatherData && forecastData) {
        // could add logic here to update UI all at once
        console.log("both done!");
        done();
        return;
      }
      console.log("not done yet");
    }

    console.log(`Weather for ${city}:`);
  });

  /*
   // What I would like this to look like
   // - imagine `await` waits for an async operation to complete and then returns the result
   // - `await` does this without blocking
   // - `await` will throw any errors from the async operation

   const city = await getCurrentCity();

   // fire both requests in parallel, so I have to defer waiting for result
   const weatherRequest = getWeather(city);
   const forecastRequest = getForecast(city);

   const weather = await weatherRequest;
   console.log("weather", weather);

   const forecast = await forecastRequest;
   console.log("forecast", forecast);

   done();

   */

});

test("or this?", function () {

  async function weatherProcess(){

    const city = await getCurrentCity();

    // fire both requests in parallel, so I have to defer waiting for result
    const weatherRequest = getWeather(city);
    const forecastRequest = getForecast(city);

    const weather = await weatherRequest;
    const forecast = await forecastRequest;

    console.log("forecast", forecast);
    console.log("weather", weather);
  }

  return weatherProcess();
});

