const startBtn = document.getElementById("startBtn");
const manualBtn = document.getElementById("manualBtn");
const loadManual = document.getElementById("loadManual");

const manualBox = document.getElementById("manualBox");
const countrySelect = document.getElementById("countrySelect");

const status = document.getElementById("status");
const loader = document.getElementById("loader");

const mainCard = document.getElementById("mainCard");
const cards = document.getElementById("cards");

const bigTemp = document.getElementById("bigTemp");
const conditionText = document.getElementById("conditionText");

const temp = document.getElementById("temp");
const feels = document.getElementById("feels");
const uv = document.getElementById("uv");
const wind = document.getElementById("wind");
const hum = document.getElementById("hum");
const vis = document.getElementById("vis");
const sun = document.getElementById("sun");

const bg = document.getElementById("bg");

const mapToggle = document.getElementById("mapToggle");
const mapContainer = document.getElementById("mapContainer");

let map;
let expanded = false;

/* COUNTRIES */
const locations = [
  {name:"Cyprus",lat:35.1856,lon:33.3823},
  {name:"Greece",lat:37.9838,lon:23.7275},
  {name:"UK",lat:51.5072,lon:-0.1276},
  {name:"USA",lat:40.7128,lon:-74.0060},
  {name:"Japan",lat:35.6762,lon:139.6503},
  {name:"India",lat:28.6139,lon:77.2090}
];

locations.forEach(l=>{
  const o=document.createElement("option");
  o.value=JSON.stringify(l);
  o.textContent=l.name;
  countrySelect.appendChild(o);
});

/* WEATHER */
function weatherText(code){
  if(code===0) return "Clear Sky";
  if(code<=3) return "Cloudy";
  if(code<=67) return "Rain";
  return "Storm";
}

/* BACKGROUND */
function setBackground(code){
  let g="linear-gradient(180deg,#4facfe,#00f2fe)";
  if(code<=3) g="linear-gradient(180deg,#8e9eab,#eef2f3)";
  if(code>3) g="linear-gradient(180deg,#1c1c1c,#000)";
  bg.style.background=g;
}

/* MAP */
function loadMap(lat,lon){

  if(map) map.remove();

  map = L.map("map").setView([lat,lon],7);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
  .addTo(map);

  L.marker([lat,lon]).addTo(map);

  map.on("click", async (e)=> {
    loadWeather(e.latlng.lat, e.latlng.lng);
  });
}

/* API */
async function getWeather(lat,lon){

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    "&hourly=temperature_2m,uv_index,wind_speed_10m,relative_humidity_2m,visibility,apparent_temperature,weather_code" +
    "&daily=sunrise,sunset&timezone=auto";

  const res = await fetch(url);
  const data = await res.json();

  const now = new Date();
  const times = data.hourly.time;

  let i=0, best=999999;

  for(let x=0;x<times.length;x++){
    let d=Math.abs(new Date(times[x])-now);
    if(d<best){best=d;i=x;}
  }

  return {
    temp:data.hourly.temperature_2m[i],
    feels:data.hourly.apparent_temperature[i],
    uv:data.hourly.uv_index[i],
    wind:data.hourly.wind_speed_10m[i],
    hum:data.hourly.relative_humidity_2m[i],
    vis:data.hourly.visibility[i],
    code:data.hourly.weather_code[i],
    sunrise:data.daily.sunrise[0],
    sunset:data.daily.sunset[0]
  };
}

/* LOAD */
async function loadWeather(lat,lon){

  loader.classList.remove("hidden");
  status.textContent="Loading...";

  loadMap(lat,lon);

  const w = await getWeather(lat,lon);

  loader.classList.add("hidden");
  status.style.display="none";

  mainCard.classList.remove("hidden");
  cards.classList.remove("hidden");

  bigTemp.textContent = `${w.temp}°`;
  conditionText.textContent = weatherText(w.code);

  temp.textContent = `${w.temp}°C`;
  feels.textContent = `${w.feels}°C`;
  uv.textContent = w.uv;
  wind.textContent = w.wind;
  hum.textContent = w.hum;
  vis.textContent = w.vis;

  sun.innerHTML = `🌅 ${w.sunrise.split("T")[1]}<br>🌇 ${w.sunset.split("T")[1]}`;

  setBackground(w.code);
}

/* BUTTONS */
startBtn.onclick = async ()=>{
  navigator.geolocation.getCurrentPosition(p=>{
    loadWeather(p.coords.latitude,p.coords.longitude);
  });
};

manualBtn.onclick = ()=> manualBox.classList.toggle("hidden");

loadManual.onclick = ()=>{
  const l = JSON.parse(countrySelect.value);
  loadWeather(l.lat,l.lon);
};

/* MAP TOGGLE */
mapToggle.onclick = ()=>{
  expanded = !expanded;
  mapContainer.classList.toggle("expanded",expanded);
  setTimeout(()=> map.invalidateSize(),300);
};

/* START */
window.onload = ()=>{
  setTimeout(()=>document.getElementById("welcome").style.display="none",1500);
};
