
const intro = document.getElementById("intro");
const app = document.getElementById("app");

const modeScreen = document.getElementById("modeScreen");
const dashboard = document.getElementById("dashboard");

const useLocation = document.getElementById("useLocation");
const manual = document.getElementById("manual");
const mapMode = document.getElementById("mapMode");

const manualBox = document.getElementById("manualBox");
const countrySelect = document.getElementById("countrySelect");
const loadCountry = document.getElementById("loadCountry");

const locationText = document.getElementById("locationText");

const temp = document.getElementById("temp");
const feels = document.getElementById("feels");
const uv = document.getElementById("uv");
const wind = document.getElementById("wind");
const hum = document.getElementById("hum");
const vis = document.getElementById("vis");

const tempBig = document.getElementById("tempBig");
const condition = document.getElementById("condition");

const mapBox = document.getElementById("mapBox");
const expand = document.getElementById("expand");
const minimise = document.getElementById("minimise");

let map;
let selectedName = "";

/* INTRO */
setTimeout(()=>{
  intro.style.display="none";
  app.classList.remove("hidden");
},1500);

/* COUNTRIES */
const countries = [
  {name:"Cyprus",lat:35.1856,lon:33.3823},
  {name:"Greece",lat:37.9838,lon:23.7275},
  {name:"UK",lat:51.5072,lon:-0.1276},
  {name:"USA",lat:40.7128,lon:-74.0060}
];

countries.forEach(c=>{
  const o=document.createElement("option");
  o.value=JSON.stringify(c);
  o.textContent=c.name;
  countrySelect.appendChild(o);
});

/* MAP */
function initMap(lat,lon){

  if(map) map.remove();

  map = L.map("map").setView([lat,lon],7);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
  .addTo(map);

  map.on("click",(e)=>{
    loadWeather(e.latlng.lat,e.latlng.lng,"Map Location");
  });
}

/* WEATHER */
async function getWeather(lat,lon){

  const url =
  `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
  "&hourly=temperature_2m,uv_index,wind_speed_10m,relative_humidity_2m,visibility,apparent_temperature,weather_code" +
  "&daily=sunrise,sunset&timezone=auto";

  const res = await fetch(url);
  const data = await res.json();

  let i=0,best=999999;
  const now=new Date();

  for(let x=0;x<data.hourly.time.length;x++){
    let d=Math.abs(new Date(data.hourly.time[x]) - now);
    if(d<best){best=d;i=x;}
  }

  return {
    temp:data.hourly.temperature_2m[i],
    feels:data.hourly.apparent_temperature[i],
    uv:data.hourly.uv_index[i],
    wind:data.hourly.wind_speed_10m[i],
    hum:data.hourly.relative_humidity_2m[i],
    vis:data.hourly.visibility[i],
    code:data.hourly.weather_code[i]
  };
}

/* LOAD WEATHER */
async function loadWeather(lat,lon,name){

  selectedName = name;

  locationText.textContent = "🌍 Viewing: " + name;

  dashboard.classList.remove("hidden");
  modeScreen.classList.add("hidden");

  if(!map){
    initMap(lat,lon);
  } else {
    map.setView([lat,lon],7);
  }

  const w = await getWeather(lat,lon);

  temp.textContent=w.temp;
  feels.textContent=w.feels;
  uv.textContent=w.uv;
  wind.textContent=w.wind;
  hum.textContent=w.hum;
  vis.textContent=w.vis;

  tempBig.textContent=w.temp+"°";
  condition.textContent="Weather";
}

/* BUTTONS */
useLocation.onclick=()=>{
  navigator.geolocation.getCurrentPosition(p=>{
    loadWeather(p.coords.latitude,p.coords.longitude,"Your Location");
  });
};

manual.onclick=()=>{
  manualBox.classList.toggle("hidden");
};

loadCountry.onclick=()=>{
  const c=JSON.parse(countrySelect.value);
  loadWeather(c.lat,c.lon,c.name);
};

mapMode.onclick=()=>{
  modeScreen.classList.add("hidden");
  dashboard.classList.remove("hidden");

  const c=countries[0];
  loadWeather(c.lat,c.lon,"Map Mode");
};

/* MAP EXPAND */
expand.onclick=()=>{
  mapBox.classList.add("expanded");
  minimise.classList.remove("hidden");
  expand.classList.add("hidden");
  setTimeout(()=>map.invalidateSize(),200);
};

minimise.onclick=()=>{
  mapBox.classList.remove("expanded");
  minimise.classList.add("hidden");
  expand.classList.remove("hidden");
  setTimeout(()=>map.invalidateSize(),200);
};
