let map;

/* ELEMENTS */
const intro = document.getElementById("intro");
const modeScreen = document.getElementById("modeScreen");

const useLocation = document.getElementById("useLocation");
const manualSelect = document.getElementById("manualSelect");
const mapPick = document.getElementById("mapPick");

const viewingText = document.getElementById("viewingText");

/* 🌍 INTRO FIX (THIS WAS BROKEN BEFORE) */
window.onload = () => {
  setTimeout(() => {
    intro.classList.add("hidden");
    modeScreen.classList.remove("hidden");
  }, 1500);
};

/* 🗺️ MAP */
function initMap(lat, lon) {
  if (map) map.remove();

  map = L.map("map").setView([lat, lon], 6);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    .addTo(map);

  map.on("click", (e) => {
    loadWeather(e.latlng.lat, e.latlng.lng, "Map Selection");
  });
}

/* 🌦️ WEATHER */
async function getWeather(lat, lon) {

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    "&hourly=temperature_2m,uv_index,wind_speed_10m,relative_humidity_2m,visibility,apparent_temperature" +
    "&timezone=auto";

  const res = await fetch(url);
  const data = await res.json();

  let i = 0;
  let best = 999999;
  const now = new Date();

  for (let x = 0; x < data.hourly.time.length; x++) {
    let d = Math.abs(new Date(data.hourly.time[x]) - now);
    if (d < best) {
      best = d;
      i = x;
    }
  }

  return {
    temp: data.hourly.temperature_2m[i],
    feels: data.hourly.apparent_temperature[i],
    uv: data.hourly.uv_index[i],
    wind: data.hourly.wind_speed_10m[i],
    hum: data.hourly.relative_humidity_2m[i],
    vis: data.hourly.visibility[i]
  };
}

/* 🌍 LOAD WEATHER */
async function loadWeather(lat, lon, name) {

  viewingText.textContent = "🌍 Viewing: " + name;

  modeScreen.classList.add("hidden");

  if (!map) {
    initMap(lat, lon);
  } else {
    map.setView([lat, lon], 6);
  }

  const w = await getWeather(lat, lon);

  document.getElementById("temp").textContent = w.temp;
  document.getElementById("feels").textContent = w.feels;
  document.getElementById("uv").textContent = w.uv;
  document.getElementById("wind").textContent = w.wind;
  document.getElementById("hum").textContent = w.hum;
  document.getElementById("vis").textContent = w.vis;
}

/* 📍 BUTTON FIXED */
useLocation.onclick = () => {
  navigator.geolocation.getCurrentPosition(pos => {
    loadWeather(pos.coords.latitude, pos.coords.longitude, "Your Location");
  });
};

manualSelect.onclick = () => {
  alert("Manual system still here (you can plug your list)");
};

mapPick.onclick = () => {
  modeScreen.classList.add("hidden");

  if (!map) initMap(35.1856, 33.3823); // Cyprus default
  loadWeather(35.1856, 33.3823, "Cyprus");
};
