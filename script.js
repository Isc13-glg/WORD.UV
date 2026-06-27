
const startBtn = document.getElementById("startBtn");
const status = document.getElementById("status");
const card = document.getElementById("card");

const tempBox = document.getElementById("temp");
const feelsBox = document.getElementById("feels");
const uvBox = document.getElementById("uv");
const windBox = document.getElementById("wind");
const humBox = document.getElementById("hum");
const visBox = document.getElementById("vis");
const sunBox = document.getElementById("sun");
const condBox = document.getElementById("cond");
const msg = document.getElementById("msg");

const alarm = document.getElementById("alarm");

let map;
let unlocked = false;

// 🔊 voice
function speak(t){
  const u = new SpeechSynthesisUtterance(t);
  u.lang = "en-US";
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

// 💨 wind direction
function windDir(deg){
  const dirs = ["N","NE","E","SE","S","SW","W","NW"];
  return dirs[Math.round(deg/45)%8];
}

// ☁️ weather code
function condition(code){
  if(code===0) return "Clear sky ☀️";
  if(code<=3) return "Cloudy ⛅";
  if(code<=48) return "Fog 🌫️";
  if(code<=67) return "Rain 🌧️";
  if(code<=82) return "Showers 🌦️";
  return "Storm ⛈️";
}

// 🔊 alarm
function playAlarm(uv){
  if(uv >= 6.5 && unlocked){
    alarm.currentTime = 0;
    alarm.play().catch(()=>{});
  }
}

// 🗺 map fix
function loadMap(lat,lon){

  setTimeout(()=>{

    if(map) map.remove();

    map = L.map("map").setView([lat,lon], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:"© OpenStreetMap"
    }).addTo(map);

    L.marker([lat,lon]).addTo(map);

    setTimeout(()=>map.invalidateSize(true),500);

  },300);
}

// 🌍 WEATHER API (FULL)
async function getWeather(lat,lon){

  const url =
  `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}
  &hourly=temperature_2m,uv_index,wind_speed_10m,wind_direction_10m,relative_humidity_2m,visibility,apparent_temperature,weather_code
  &daily=sunrise,sunset
  &timezone=auto`;

  const res = await fetch(url);
  const data = await res.json();

  const now = new Date();
  const times = data.hourly.time;

  let i=0, best=999999;

  for(let x=0;x<times.length;x++){
    const d = Math.abs(new Date(times[x]) - now);
    if(d<best){ best=d; i=x; }
  }

  return {
    temp: data.hourly.temperature_2m[i],
    feels: data.hourly.apparent_temperature[i],
    uv: data.hourly.uv_index[i],
    wind: data.hourly.wind_speed_10m[i],
    windDir: data.hourly.wind_direction_10m[i],
    hum: data.hourly.relative_humidity_2m[i],
    vis: data.hourly.visibility[i],
    code: data.hourly.weather_code[i],
    sunrise: data.daily.sunrise[0],
    sunset: data.daily.sunset[0]
  };
}

// 🚀 START
startBtn.onclick = () => {

  unlocked = true;
  status.textContent = "Getting location...";

  navigator.geolocation.getCurrentPosition(async pos => {

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    loadMap(lat,lon);

    const w = await getWeather(lat,lon);

    card.classList.remove("hidden");
    status.style.display = "none";

    tempBox.textContent = `🌡️ Temp: ${w.temp}°C`;
    feelsBox.textContent = `🤗 Feels: ${w.feels}°C`;
    uvBox.textContent = `☀️ UV: ${w.uv}`;
    windBox.textContent = `💨 Wind: ${w.wind} km/h (${windDir(w.windDir)})`;
    humBox.textContent = `💧 Humidity: ${w.hum}%`;
    visBox.textContent = `👁️ Visibility: ${w.vis} m`;

    sunBox.innerHTML =
      `🌅 Sunrise: ${w.sunrise.split("T")[1]}<br>🌇 Sunset: ${w.sunset.split("T")[1]}`;

    condBox.textContent = `☁️ ${condition(w.code)}`;

    msg.textContent = condition(w.code);

    speak(`Weather is ${condition(w.code)}. Temperature is ${w.temp} degrees.`);

    playAlarm(w.uv);

  });

};
