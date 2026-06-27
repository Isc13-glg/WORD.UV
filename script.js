
const startBtn = document.getElementById("startBtn");
const manualBtn = document.getElementById("manualBtn");
const mapSelectBtn = document.getElementById("mapSelectBtn");

const manualBox = document.getElementById("manualBox");
const countrySelect = document.getElementById("countrySelect");
const loadManual = document.getElementById("loadManual");

const status = document.getElementById("status");
const loader = document.getElementById("loader");

const card = document.getElementById("card");

const temp = document.getElementById("temp");
const feels = document.getElementById("feels");
const uv = document.getElementById("uv");
const wind = document.getElementById("wind");
const hum = document.getElementById("hum");
const vis = document.getElementById("vis");

const bigTemp = document.getElementById("bigTemp");
const conditionText = document.getElementById("conditionText");

const bg = document.getElementById("bg");

const mapBox = document.getElementById("mapBox");
const mapExpand = document.getElementById("mapExpand");
const mapMinimise = document.getElementById("mapMinimise");

let map;
let selectMode = false;

/* COUNTRIES */
const locations = [
  {name:"Cyprus",lat:35.1856,lon:33.3823},
  {name:"Greece",lat:37.9838,lon:23.7275},
  {name:"UK",lat:51.5072,lon:-0.1276},
  {name:"USA",lat:40.7128,lon:-74.0060}
];

locations.forEach(l=>{
  const o=document.createElement("option");
  o.value=JSON.stringify(l);
  o.textContent=l.name;
  countrySelect.appendChild(o);
});

/* BACKGROUND */
function setBg(code){
  if(code<=3){
    bg.style.background="linear-gradient(#4facfe,#00f2fe)";
  } else if(code<=60){
    bg.style.background="linear-gradient(#555,#999)";
  } else {
    bg.style.background="linear-gradient(#111,#000)";
  }
}

/* MAP */
function initMap(lat,lon){

  if(map) map.remove();

  map = L.map("map").setView([lat,lon],7);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
  .addTo(map);

  map.on("click",(e)=>{
    if(selectMode){
      loadWeather(e.latlng.lat,e.latlng.lng);
    }
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

  const now = new Date();
  let i=0,best=999999;

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

/* LOAD */
async function loadWeather(lat,lon){

  loader.classList.remove("hidden");

  if(!map){
    initMap(lat,lon);
  }

  const w = await getWeather(lat,lon);

  loader.classList.add("hidden");

  card.classList.remove("hidden");

  temp.textContent=w.temp;
  feels.textContent=w.feels;
  uv.textContent=w.uv;
  wind.textContent=w.wind;
  hum.textContent=w.hum;
  vis.textContent=w.vis;

  bigTemp.textContent=w.temp+"°";
  conditionText.textContent="Weather";

  setBg(w.code);
}

/* BUTTONS */
startBtn.onclick=()=>{
  navigator.geolocation.getCurrentPosition(p=>{
    loadWeather(p.coords.latitude,p.coords.longitude);
  });
};

manualBtn.onclick=()=>{
  manualBox.classList.toggle("hidden");
};

loadManual.onclick=()=>{
  const l=JSON.parse(countrySelect.value);
  loadWeather(l.lat,l.lon);
};

mapSelectBtn.onclick=()=>{
  selectMode=true;
  status.textContent="Tap map to choose";
};

/* MAP EXPAND */
mapExpand.onclick=()=>{
  mapBox.classList.add("expanded");
  mapMinimise.classList.remove("hidden");
  mapExpand.classList.add("hidden");
  setTimeout(()=>map.invalidateSize(),200);
};

mapMinimise.onclick=()=>{
  mapBox.classList.remove("expanded");
  mapMinimise.classList.add("hidden");
  mapExpand.classList.remove("hidden");
  setTimeout(()=>map.invalidateSize(),200);
};
