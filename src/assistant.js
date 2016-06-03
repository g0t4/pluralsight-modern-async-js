const city = "New York, NY";
const appid = 'bad6f8a83fe5c5b46cf478d12a8c638c';
const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${appid}&units=imperial`;
const fiveDayUrl = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${appid}&units=imperial`;




function* me(){
  const response = yield fetch(weatherUrl);
  const weather = yield response.json();

  const fiveDay = yield fetch(fiveDayUrl).then(r => r.json());
  const number = yield 5;
  console.log(number);
  console.log(fiveDay);
  console.log(weather);
}

///////////////////

const meGenerator = me();
assistant(meGenerator);















function assistant(generator){
  remind();
  function remind(waitingFor){
    const next = generator.next(waitingFor);
    if(next.done){
      return;
    }
    //console.log(next);
    const promise = Promise.resolve(next.value);
    promise.then(result => remind(result));
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
  