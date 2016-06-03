const city = "New York, NY";
const appid = 'bad6f8a83fe5c5b46cf478d12a8c638c';
const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${appid}&units=imperial`;
const fiveDayUrl = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${appid}&units=imperial`;

me();

async function me() {
  console.log("loading...");

  const weatherResponse = await fetch(weatherUrl);
  const weather = await weatherResponse.json();

  const fiveDayResponse = await fetch(fiveDayUrl);
  const fiveDay = await fiveDayResponse.json();

  console.log(weather);
  console.log(fiveDay);
} 