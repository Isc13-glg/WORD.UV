const app = document.getElementById("app");
const intro = document.getElementById("welcome");

const startBtn = document.getElementById("startBtn");
const manualBtn = document.getElementById("manualBtn");
const mapSelectBtn = document.getElementById("mapSelectBtn");

const manualBox = document.getElementById("manualBox");
const countrySelect = document.getElementById("countrySelect");
const loadManual = document.getElementById("loadManual");

const status = document.getElementById("status");
const loader = document.getElementById("loader");

const mainCard = document.getElementById("mainCard");
const cards = document.getElementById("cards");

const temp = document.getElementById("temp");
const feels = document.getElementById("feels");
const uv = document.getElementById("uv");
const wind = document.getElementById("wind");
const hum = document.getElementById("hum");
const vis = document.getElementById("vis");
const sun = document.getElementById("sun");

const bigTemp = document.getElementById("bigTemp");
const conditionText = document.getElementById("conditionText");

const mapScreen = document.getElementById("mapScreen");
const mapContainer = document.getElementById("mapContainer");

const mapExpand = document.getElementById("mapExpand");
const mapMinimise = document.getElementById("mapMinimise");
const mapExit = document.getElementById("mapExit");

let map;
let selectMode = false;

/* INTRO */
window.onload = () => {
  setTimeout(()=>{
    intro.style.display="none";
    app.classList.remove("hidden");
  },1500);
};

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

/* MAP */
function loadMap(lat,lon){

  if(map) map.remove();

  map = L.map("map").setView([lat,lon],7);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
  .addTo(map);

  map.on("click",(e)=>{
    if(selectMode){
      selectMode=false;
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

  let i=0;
  const now=new Date();
  let best=999999;

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
    code:data.hourly.weather_code[i],
    sunrise:data.daily.sunrise[0],
    sunset:data.daily.sunset[0]
  };
}

/* LOAD WEATHER */
async function loadWeather(lat,lon){

  mapScreen.classList.add("hidden");

  loader.classList.remove("hidden");
  status.textContent="Loading...";

  const w = await getWeather(lat,lon);

  loader.classList.add("hidden");
  status.style.display="none";

  mainCard.classList.remove("hidden");
  cards.classList.remove("hidden");

  bigTemp.textContent = `${w.temp}°`;
  conditionText.textContent = "Weather";

  temp.textContent=w.temp;
  feels.textContent=w.feels;
  uv.textContent=w.uv;
  wind.textContent=w.wind;
  hum.textContent=w.hum;
  vis.textContent=w.vis;

  sun.innerHTML=`🌅 ${w.sunrise.split("T")[1]}<br>🌇 ${w.sunset.split("T")[1]}`;
}

/* BUTTONS */
startBtn.onclick = () => {
  navigator.geolocation.getCurrentPosition(p=>{
    loadWeather(p.coords.latitude,p.coords.longitude);
  });
};

manualBtn.onclick = () => {
  manualBox.classList.toggle("hidden");
};

loadManual.onclick = () => {
  const l = JSON.parse(countrySelect.value);
  loadWeather(l.lat,l.lon);
};

/* MAP MODE */
mapSelectBtn.onclick = () => {

  selectMode = true;

  app.classList.remove("hidden");
  mapScreen.classList.remove("hidden");

  if(!map){
    loadMap(35.1856,33.3823);
  }

  setTimeout(()=>map.invalidateSize(),300);
};

/* MAP BUTTONS */
mapExpand.onclick = () => {
  mapContainer.classList.add("expanded");
  mapMinimise.classList.remove("hidden");
  mapExpand.classList.add("hidden");
  setTimeout(()=>map.invalidateSize(),300);
};

mapMinimise.onclick = () => {
  mapContainer.classList.remove("expanded");
  mapMinimise.classList.add("hidden");
  mapExpand.classList.remove("hidden");
  setTimeout(()=>map.invalidateSize(),300);
};

mapExit.onclick = () => {
  selectMode = false;
  mapScreen.classList.add("hidden");
};
