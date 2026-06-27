
const startBtn = document.getElementById("startBtn");
const manualBtn = document.getElementById("manualBtn");
const loadManual = document.getElementById("loadManual");

const manualBox = document.getElementById("manualBox");
const countrySelect = document.getElementById("countrySelect");

const status = document.getElementById("status");
const loader = document.getElementById("loader");
const card = document.getElementById("card");

const temp = document.getElementById("temp");
const feels = document.getElementById("feels");
const uv = document.getElementById("uv");
const wind = document.getElementById("wind");
const hum = document.getElementById("hum");
const vis = document.getElementById("vis");
const sun = document.getElementById("sun");
const cond = document.getElementById("cond");

let map;

// 🌍 locations
const locations = [
  {name:"Cyprus", lat:35.1856, lon:33.3823},
  {name:"Greece", lat:37.9838, lon:23.7275},
  {name:"UK", lat:51.5072, lon:-0.1276},
  {name:"USA", lat:40.7128, lon:-74.0060},
  {name:"France", lat:48.8566, lon:2.3522},
  {name:"Japan", lat:35.6762, lon:139.6503}
];

// fill dropdown
locations.forEach(l => {
  const opt = document.createElement("option");
  opt.value = JSON.stringify(l);
  opt.textContent = l.name;
  countrySelect.appendChild(opt);
});

// 🌤 condition
function weatherText(code){
  if(code === 0) return "Clear ☀️";
  if(code <= 3) return "Cloudy ⛅";
  if(code <= 48) return "Fog 🌫️";
  if(code <= 67) return "Rain 🌧️";
  if(code <= 82) return "Showers 🌦️";
  return "Storm ⛈️";
}

// 🗺 map
function loadMap(lat, lon){
  if(map) map.remove();

  map = L.map("map").setView([lat, lon], 7);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  L.marker([lat, lon]).addTo(map);
}

// 🌍 FIXED WEATHER API
async function getWeather(lat, lon){

  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${lat}` +
    `&longitude=${lon}` +
    "&hourly=temperature_2m,uv_index,wind_speed_10m,wind_direction_10m,relative_humidity_2m,visibility,apparent_temperature,weather_code" +
    "&daily=sunrise,sunset" +
    "&timezone=auto";

  const res = await fetch(url);

  if(!res.ok) throw new Error("API failed");

  const data = await res.json();

  const now = new Date();
  const times = data.hourly.time;

  let i = 0;
  let best = Infinity;

  for(let x=0; x<times.length; x++){
    const d = Math.abs(new Date(times[x]) - now);
    if(d < best){ best = d; i = x; }
  }

  return {
    temp: data.hourly.temperature_2m[i],
    feels: data.hourly.apparent_temperature[i],
    uv: data.hourly.uv_index[i],
    wind: data.hourly.wind_speed_10m[i],
    hum: data.hourly.relative_humidity_2m[i],
    vis: data.hourly.visibility[i],
    code: data.hourly.weather_code[i],
    sunrise: data.daily.sunrise[0],
    sunset: data.daily.sunset[0]
  };
}

// 🔥 SAFE GPS
function getLocation(){
  return new Promise(resolve => {
    navigator.geolocation.getCurrentPosition(
      pos => resolve(pos),
      () => resolve(null),
      {timeout: 8000}
    );
  });
}

// 🚀 GPS MODE
startBtn.onclick = async () => {

  status.textContent = "Getting location...";
  loader.classList.remove("hidden");

  const pos = await getLocation();

  let lat, lon;

  if(pos){
    lat = pos.coords.latitude;
    lon = pos.coords.longitude;
  } else {
    lat = 35.1856;
    lon = 33.3823;
    status.textContent = "Using fallback (Cyprus)";
  }

  loadMap(lat, lon);

  try {

    const w = await getWeather(lat, lon);

    loader.classList.add("hidden");
    status.style.display = "none";
    card.classList.remove("hidden");

    temp.textContent = "🌡️ " + w.temp + "°C";
    feels.textContent = "🤗 " + w.feels + "°C";
    uv.textContent = "☀️ UV " + w.uv;
    wind.textContent = "💨 " + w.wind;
    hum.textContent = "💧 " + w.hum + "%";
    vis.textContent = "👁️ " + w.vis;
    cond.textContent = "☁️ " + weatherText(w.code);

    sun.innerHTML =
      "🌅 " + w.sunrise.split("T")[1] +
      "<br>🌇 " + w.sunset.split("T")[1];

  } catch(e){
    loader.classList.add("hidden");
    status.textContent = "Weather failed";
  }
};

// 🌍 MANUAL
manualBtn.onclick = () => {
  manualBox.classList.toggle("hidden");
};

loadManual.onclick = async () => {

  const loc = JSON.parse(countrySelect.value);

  status.textContent = "Loading...";
  loader.classList.remove("hidden");

  loadMap(loc.lat, loc.lon);

  try {

    const w = await getWeather(loc.lat, loc.lon);

    loader.classList.add("hidden");
    status.style.display = "none";
    card.classList.remove("hidden");

    temp.textContent = "🌡️ " + w.temp + "°C";
    feels.textContent = "🤗 " + w.feels + "°C";
    uv.textContent = "☀️ UV " + w.uv;
    wind.textContent = "💨 " + w.wind;
    hum.textContent = "💧 " + w.hum + "%";
    vis.textContent = "👁️ " + w.vis;
    cond.textContent = "☁️ " + weatherText(w.code);

    sun.innerHTML =
      "🌅 " + w.sunrise.split("T")[1] +
      "<br>🌇 " + w.sunset.split("T")[1];

  } catch(e){
    loader.classList.add("hidden");
    status.textContent = "Weather failed";
  }
};
