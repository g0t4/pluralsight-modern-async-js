const city = "New York, NY";
const appid = 'bad6f8a83fe5c5b46cf478d12a8c638c';
const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${appid}&units=imperial`;
const fiveDayUrl = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${appid}&units=imperial`;

me()
  .catch(e => console.log(`error: ${e}`))

async function me() {
  console.log("loading...");

  const weatherRequest = fetch(weatherUrl).then(r => r.json());
  const fiveDayRequest = fetch(fiveDayUrl).then(r => r.json());

  const weather = await weatherRequest;
  const fiveDay = await fiveDayRequest;

  console.log(weather);
  console.log(fiveDay);
}