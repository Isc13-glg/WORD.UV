const startBtn = document.getElementById("startBtn");
const manualBtn = document.getElementById("manualBtn");
const loadManual = document.getElementById("loadManual");

const manualBox = document.getElementById("manualBox");
const countrySelect = document.getElementById("countrySelect");

const status = document.getElementById("status");
const loader = document.getElementById("loader");
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

// 🌍 fallback cities
const locations = [
  {name:"Nicosia",lat:35.1856,lon:33.3823},
  {name:"Athens",lat:37.9838,lon:23.7275},
  {name:"London",lat:51.5072,lon:-0.1276},
  {name:"Paris",lat:48.8566,lon:2.3522},
  {name:"Berlin",lat:52.52,lon:13.405},
  {name:"Tokyo",lat:35.6762,lon:139.6503}
];

// fill dropdown
locations.forEach(l=>{
  const opt = document.createElement("option");
  opt.value = JSON.stringify(l);
  opt.textContent = l.name;
  countrySelect.appendChild(opt);
});

// 🌤 condition
function condition(code){
  if(code===0) return "Clear ☀️";
  if(code<=3) return "Cloudy ⛅";
  if(code<=48) return "Fog 🌫️";
  if(code<=67) return "Rain 🌧️";
  if(code<=82) return "Showers 🌦️";
  return "Storm ⛈️";
}

// 💨 wind
function windDir(d){
  const dirs=["N","NE","E","SE","S","SW","W","NW"];
  return dirs[Math.round(d/45)%8];
}

// 🗺 map
function loadMap(lat,lon){
  if(map) map.remove();
  map = L.map("map").setView([lat,lon], 7);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:"© OpenStreetMap"
  }).addTo(map);

  L.marker([lat,lon]).addTo(map);
}

// 🌍 weather
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

  let i=0,best=999999;

  for(let x=0;x<times.length;x++){
    const d=Math.abs(new Date(times[x])-now);
    if(d<best){best=d;i=x;}
  }

  return {
    temp:data.hourly.temperature_2m[i],
    feels:data.hourly.apparent_temperature[i],
    uv:data.hourly.uv_index[i],
    wind:data.hourly.wind_speed_10m[i],
    windDir:data.hourly.wind_direction_10m[i],
    hum:data.hourly.relative_humidity_2m[i],
    vis:data.hourly.visibility[i],
    code:data.hourly.weather_code[i],
    sunrise:data.daily.sunrise[0],
    sunset:data.daily.sunset[0]
  };
}

// 🔥 safe GPS
function getGPS(){
  return new Promise(res=>{
    navigator.geolocation.getCurrentPosition(
      p=>res(p),
      ()=>res(null),
      {timeout:8000}
    );
  });
}

// 🚀 GPS MODE
startBtn.onclick = async () => {

  unlocked = true;

  loader.classList.remove("hidden");
  status.textContent = "Getting location...";

  const pos = await getGPS();

  let lat,lon;

  if(pos){
    lat=pos.coords.latitude;
    lon=pos.coords.longitude;
  }else{
    lat=35.1856;
    lon=33.3823;
    status.textContent="Using fallback location (Nicosia)";
  }

  loadMap(lat,lon);

  const w = await getWeather(lat,lon);

  loader.classList.add("hidden");
  status.style.display="none";
  card.classList.remove("hidden");

  tempBox.textContent=`🌡️ Temp: ${w.temp}°C`;
  feelsBox.textContent=`🤗 Feels: ${w.feels}°C`;
  uvBox.textContent=`☀️ UV: ${w.uv}`;
  windBox.textContent=`💨 Wind: ${w.wind} km/h (${windDir(w.windDir)})`;
  humBox.textContent=`💧 Humidity: ${w.hum}%`;
  visBox.textContent=`👁️ Visibility: ${w.vis} m`;

  sunBox.innerHTML =
    `🌅 Sunrise: ${w.sunrise.split("T")[1]}<br>🌇 Sunset: ${w.sunset.split("T")[1]}`;

  condBox.textContent=`☁️ ${condition(w.code)}`;

  msg.textContent=condition(w.code);
};

// 🌍 manual toggle
manualBtn.onclick = () => {
  manualBox.classList.toggle("hidden");
};

// 🌍 manual load
loadManual.onclick = async () => {

  const l = JSON.parse(countrySelect.value);

  loader.classList.remove("hidden");
  status.textContent="Loading...";

  loadMap(l.lat,l.lon);

  const w = await getWeather(l.lat,l.lon);

  loader.classList.add("hidden");
  status.style.display="none";
  card.classList.remove("hidden");

  tempBox.textContent=`🌡️ Temp: ${w.temp}°C`;
  feelsBox.textContent=`🤗 Feels: ${w.feels}°C`;
  uvBox.textContent=`☀️ UV: ${w.uv}`;
  windBox.textContent=`💨 Wind: ${w.wind} km/h (${windDir(w.windDir)})`;
  humBox.textContent=`💧 Humidity: ${w.hum}%`;
  visBox.textContent=`👁️ Visibility: ${w.vis} m`;

  sunBox.innerHTML =
    `🌅 Sunrise: ${w.sunrise.split("T")[1]}<br>🌇 Sunset: ${w.sunset.split("T")[1]}`;

  condBox.textContent=`☁️ ${condition(w.code)}`;

  msg.textContent=condition(w.code);
};
