suite("Callback examples");

test("Nesting serial async dependencies", done => {

  getCurrentCity(function (error, city) {

    getWeather(city, function (error, weather) {
      console.log("weather", weather);
      done();
    });

    console.log(`Weather for ${city}:`);
  });

});

test("Parallel result synchronization", done => {

  const city = "NYC";

  let weatherData;
  let forecastData;

  getWeather(city, function (error, weather) {
    weatherData = weather;
    console.log("weather", weather);
    finishIfReady();
  });

  getForecast(city, function (error, forecast) {
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

});

test("Combined serial async dependencies and parallel result synchronization", done => {

  getCurrentCity(function (error, city) {

    let weatherData;
    let forecastData;

    getWeather(city, function (error, weather) {
      weatherData = weather;
      console.log("weather", weather);
      finishIfReady();
    });

    getForecast(city, function (error, forecast) {
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

});

// note: more callback challenges can be done here, for example multiple callbacks
