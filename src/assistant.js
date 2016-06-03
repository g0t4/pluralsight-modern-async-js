const city = "New York, NY";
const appid = 'bad6f8a83fe5c5b46cf478d12a8c638c';
const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${appid}&units=imperial`;
const fiveDayUrl = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${appid}&units=imperial`;


fetch(weatherUrl)
  .then(function(response) {
    return response.json();
  })
  .then(function(weather) {
    console.log(weather);
  });