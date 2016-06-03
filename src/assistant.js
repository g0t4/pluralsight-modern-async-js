const city = "New York, NY";
const appid = 'bad6f8a83fe5c5b46cf478d12a8c638c';
const weatherUrl = `http://apis.openweathermap.org/data/2.5/weather?q=${city}&appid=${appid}&units=imperial`;
const fiveDayUrl = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${appid}&units=imperial`;




function* me() {
  try {
    const response = yield fetch(weatherUrl);
    const weather = yield response.json();

    const fiveDay = yield fetch(fiveDayUrl).then(r => r.json());

    console.log(number);
    console.log(fiveDay);
    console.log(weather);
  } catch (error) {
    console.log("Failed to get the weather");
  }
}

///////////////////

const meGenerator = me();
assistant(meGenerator);















function assistant(generator) {
  remind(() => generator.next());

  function remind(resume) {
    const next = resume();
    if (next.done) {
      return;
    }
    //console.log(next);
    const promise = Promise.resolve(next.value);
    promise.then(
      function fulfillmentReaction(result) {
        remind(() => generator.next(result))
      },
      function rejectionReaction(error) {
        remind(() => generator.throw(error))
      });
  }
}

/*
 fetch(weatherUrl)
 .then(function(response) {
 return response.json();
 })
 .then(function(weather) {
 console.log(weather);
 });
 */